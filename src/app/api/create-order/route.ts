import { NextRequest, NextResponse } from 'next/server';

const WC_BASE_URL        = process.env.WC_BASE_URL;
const WC_CONSUMER_KEY    = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_BASE_URL)        console.warn('[create-order] WC_BASE_URL nije definisan u .env');
if (!WC_CONSUMER_KEY)    console.warn('[create-order] WC_CONSUMER_KEY nije definisan u .env');
if (!WC_CONSUMER_SECRET) console.warn('[create-order] WC_CONSUMER_SECRET nije definisan u .env');

function basicAuthHeader() {
  const token = Buffer.from(
    `${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`
  ).toString('base64');
  return `Basic ${token}`;
}

export async function GET() {
  //console.log('🟢 [/api/create-order] GET handler');
  return NextResponse.json({
    ok: true,
    route: '/api/create-order',
    method: 'GET',
  });
}

// helper: parsiranje broja
function toNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

// 👇 1) Dohvati B2BKing group za customer-a
async function fetchCustomerGroup(customerId: number): Promise<{
  groupId: string | null;
  isB2B: boolean;
}> {
  if (!WC_BASE_URL) return { groupId: null, isB2B: false };

  const url = new URL(`/wp-json/wc/v3/customers/${customerId}`, WC_BASE_URL);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: basicAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error(
      `[create-order] fetchCustomerGroup error for customer ${customerId}:`,
      res.status,
      txt
    );
    return { groupId: null, isB2B: false };
  }

  const json: any = await res.json();

  let groupId: string | null = null;
  let isB2B = false;

  if (Array.isArray(json.meta_data)) {
    for (const m of json.meta_data) {
      if (
        m.key === 'b2bking_b2buser' &&
        String(m.value).toLowerCase() === 'yes'
      ) {
        isB2B = true;
      }
      if (m.key === 'b2bking_customergroup') {
        groupId = String(m.value);
      }
    }
  }

  console.log(
    `[create-order] Customer ${customerId} -> isB2B=${isB2B}, groupId=${groupId}`
  );

  return { groupId, isB2B };
}

// 👇 2) Dohvati produkt i izračunaj grupnu cijenu na osnovu B2BKing meta
async function fetchProductGroupPricing(
  productId: number,
  groupId: string | null
): Promise<{ regular: number; effective: number; ok: boolean }> {
  if (!WC_BASE_URL) return { regular: 0, effective: 0, ok: false };

  const url = new URL(`/wp-json/wc/v3/products/${productId}`, WC_BASE_URL);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: basicAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error(
      `[create-order] fetchProductGroupPricing error for product ${productId}:`,
      res.status,
      txt
    );
    return { regular: 0, effective: 0, ok: false };
  }

  const json: any = await res.json();

  // Osnovne Woo cijene
  let regular = toNum(json.regular_price ?? json.price ?? 0);
  let effective = toNum(json.price ?? json.sale_price ?? regular);

  // Ako imamo groupId, pokušaj B2BKing price meta
  if (groupId && Array.isArray(json.meta_data)) {
    const keyRegular = `b2bking_regular_product_price_group_${groupId}`;
    const keySale    = `b2bking_sale_product_price_group_${groupId}`;

    let groupRegular: number | null = null;
    let groupSale: number | null = null;

    for (const m of json.meta_data) {
      if (m.key === keyRegular) {
        groupRegular = toNum(m.value);
      }
      if (m.key === keySale) {
        groupSale = toNum(m.value);
      }
    }

    // Ako postoje grupne cijene, koristi njih
    if (groupRegular && groupRegular > 0) {
      regular = groupRegular;
    }
    if (groupSale && groupSale > 0) {
      effective = groupSale;
    }
  }

  const ok = (regular > 0 || effective > 0) && Number.isFinite(regular) && Number.isFinite(effective);

  //console.log(
  //  `[create-order] Product ${productId} pricing -> regular=${regular}, effective=${effective}, ok=${ok}`
  //);

  if (!ok) {
    console.warn(
      `[create-order] Product ${productId} pricing suspicious (regular=${regular}, effective=${effective}) – neće se override-at line_item`
    );
  }

  return { regular, effective, ok };
}

export async function POST(req: NextRequest) {
  //console.log('🔥 [/api/create-order] POST handler START');

  if (!WC_BASE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    console.error('[create-order] Missing env vars');
    return NextResponse.json(
      { error: 'Woo env vars missing (WC_BASE_URL / CK / CS)' },
      { status: 500 },
    );
  }

  // 1) Učitaj body sa fronta
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error('[create-order] Cannot parse JSON body:', err);
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  //console.log(
    //'[create-order] Received payload (raw from frontend):',
   // JSON.stringify(body, null, 2)
//  );

  const customerId = body.customer_id ? Number(body.customer_id) : 0;

  let groupId: string | null = null;
  let isB2B = false;

  // 2) Ako imamo customer_id, pokušaj izvući B2B group
  if (customerId > 0) {
    const customerInfo = await fetchCustomerGroup(customerId);
    groupId = customerInfo.groupId;
    isB2B = customerInfo.isB2B;
  }

  // 3) Pripremi line_items (override cijena SAMO ako znamo B2B grupu i validne cijene)
  const originalLineItems: any[] = Array.isArray(body.line_items)
    ? body.line_items
    : [];

  const adjustedLineItems: any[] = [];

  for (const li of originalLineItems) {
    const productId = li.product_id ?? li.variation_id;
    const qty = toNum(li.quantity ?? 1) || 1;

    if (!productId) {
      adjustedLineItems.push(li);
      continue;
    }

    // Ako nije B2B user ili nema groupId → ne diramo
    if (!isB2B || !groupId) {
      adjustedLineItems.push(li);
      continue;
    }

    try {
      const { regular, effective, ok } = await fetchProductGroupPricing(
        Number(productId),
        groupId
      );

      if (!ok) {
        console.warn(
          `[create-order] Skipping override for product ${productId} – koristim originalni line_item`
        );
        adjustedLineItems.push(li);
        continue;
      }

      const unitPrice = effective || regular;
      const lineTotal = unitPrice * qty;

      const newItem = {
        ...li,
        product_id: productId,
        quantity: qty,
        price: unitPrice.toFixed(2),
        subtotal: lineTotal.toFixed(2),
        total: lineTotal.toFixed(2),
      };

    //  console.log(
      //  `[create-order] Line item product ${productId} qty=${qty} -> unit=${unitPrice}, total=${lineTotal}`
    //  );

      adjustedLineItems.push(newItem);
    } catch (e) {
      console.error(
        `[create-order] Error when adjusting price for product ${productId}:`,
        e
      );
      adjustedLineItems.push(li);
    }
  }

  // 4) Pripremi URL → /wp-json/wc/v3/orders
  const url = new URL('/wp-json/wc/v3/orders', WC_BASE_URL);
  const authHeader = basicAuthHeader();

  // 5) Odredi status i set_paid prema metodi plaćanja
  const paymentMethod: string = body.payment_method;

  const isCOD  = paymentMethod === 'cod';   // plaćanje pouzećem
  const isBacs = paymentMethod === 'bacs';  // b2b virman

  let status: 'pending' | 'processing' | 'on-hold' = 'pending';
  let set_paid = false;

  if (isCOD) {
    status   = 'processing';
    set_paid = true;
  } else if (isBacs) {
    status   = 'processing';
    set_paid = false;
  }

  // 6) Složi finalni payload za Woo
  const wooPayload = {
    ...body,
    status,
    set_paid,
    line_items: adjustedLineItems,
  };

 // console.log('[create-order] Sending to Woo:', url.toString());
  //console.log(
   // '[create-order] Woo payload (sanitized):',
   // JSON.stringify(wooPayload, null, 2)
  //);

  try {
    const wpRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(wooPayload),
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      console.error(
        '[create-order] Woo create order error:',
        wpRes.status,
        text,
      );

      return NextResponse.json(
        {
          error: `Woo create order failed (status ${wpRes.status})`,
          wooStatus: wpRes.status,
          wooBody: text,
        },
        { status: 500 },
      );
    }

    let order: any;
    try {
      order = JSON.parse(text);
    } catch {
      order = text;
    }

    console.log('[create-order] Woo order created OK, id =', order?.id);

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('[create-order] Unexpected error calling Woo:', err);
    return NextResponse.json(
      { error: 'Unexpected error calling Woo', details: String(err) },
      { status: 500 },
    );
  }
}