// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const WP_REST_ROOT       = process.env.WP_REST_ROOT;        // npr. https://wp.zivic-elektro.shop/wp-json
const WC_CONSUMER_KEY    = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WP_REST_ROOT)       console.warn('[product] WP_REST_ROOT nije definisan');
if (!WC_CONSUMER_KEY)    console.warn('[product] WC_CONSUMER_KEY nije definisan');
if (!WC_CONSUMER_SECRET) console.warn('[product] WC_CONSUMER_SECRET nije definisan');

function basicAuthHeader() {
  const token = Buffer.from(
    `${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`,
  ).toString('base64');
  return `Basic ${token}`;
}

// --- Minimalni Woo tipovi za meta / customer / product ---

type WooMeta = {
  key: string;
  value: unknown;
};

type WooCustomer = {
  meta_data?: WooMeta[];
};

type WooProduct = {
  price?: string;
  regular_price?: string;
  meta_data?: WooMeta[];
  // ostala polja nas ne zanimaju tipizovano
  [key: string]: unknown;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!WP_REST_ROOT || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      console.error('[product] WooCommerce credencijali nisu podešeni u .env');
      return NextResponse.json(
        { error: 'WooCommerce credentials missing' },
        { status: 500 },
      );
    }

    const { id } = await params;

    // 1) Pročitaj email iz cookie-ja
    const cookieStore = req.cookies;
    const userEmail = cookieStore.get('wpUserEmail')?.value ?? null;

    // 2) Dohvati Woo proizvod (B2C baza)
    const productUrl = new URL(`${WP_REST_ROOT}/wc/v3/products/${id}`);

    const productRes = await fetch(productUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: basicAuthHeader(),
      },
      cache: 'no-store',
    });

    const productText = await productRes.text();

    if (!productRes.ok) {
      console.error(
        '[product GET] Woo single product error:',
        productRes.status,
        productText,
      );
      return new NextResponse(productText, {
        status: productRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsedProduct: unknown = JSON.parse(productText);
    const product = parsedProduct as WooProduct;

    // Osnovne Woo cene
    const rawPrice = product.price ?? product.regular_price ?? '0';
    const rawRegularPrice = product.regular_price ?? product.price ?? '0';

    const basePrice = Number(rawPrice) || 0;
    const baseRegularPrice = Number(rawRegularPrice) || 0;

    // default zvo_* (B2C)
    let zvo_regular_price = baseRegularPrice;
    let zvo_effective_price = basePrice;
    let zvo_discount_percent = 0;

    if (zvo_regular_price > 0 && zvo_effective_price < zvo_regular_price) {
      zvo_discount_percent = Math.round(
        ((zvo_regular_price - zvo_effective_price) / zvo_regular_price) * 100,
      );
    }

    // 3) Ako imamo email, pokušaj da nađeš customer + B2B grupu
    let customerGroupId: string | null = null;
    let isB2BUser = false;

    if (userEmail) {
      try {
        const customersUrl = new URL(`${WP_REST_ROOT}/wc/v3/customers`);
        customersUrl.searchParams.set('email', userEmail);
        customersUrl.searchParams.set('per_page', '1');

        const custRes = await fetch(customersUrl.toString(), {
          method: 'GET',
          headers: {
            Authorization: basicAuthHeader(),
          },
          cache: 'no-store',
        });

        const custText = await custRes.text();

        if (custRes.ok) {
          const parsedCustomers: unknown = JSON.parse(custText);
          const customers = Array.isArray(parsedCustomers)
            ? (parsedCustomers as WooCustomer[])
            : [];

          const customer = customers[0] ?? null;

          if (customer) {
            const meta = Array.isArray(customer.meta_data)
              ? customer.meta_data
              : [];

            const isB2BMeta = meta.find(
              (m: WooMeta) =>
                m.key === 'b2bking_b2buser' &&
                String(m.value).toLowerCase() === 'yes',
            );

            const groupMeta = meta.find(
              (m: WooMeta) => m.key === 'b2bking_customergroup',
            );

            if (isB2BMeta) {
              isB2BUser = true;
            }

            if (groupMeta?.value != null) {
              customerGroupId = String(groupMeta.value);
            }
          }
        } else {
          console.warn(
            '[product GET] customers fetch NOT OK:',
            custRes.status,
            custText,
          );
        }
      } catch (err: unknown) {
        console.warn('[product GET] error fetching customer by email:', err);
      }
    }

    // 4) Ako je B2B user + ima grupu -> primeni B2BKing grupne cene
    if (isB2BUser && customerGroupId) {
      const meta = Array.isArray(product.meta_data) ? product.meta_data : [];

      const regularKey = `b2bking_regular_product_price_group_${customerGroupId}`;
      const saleKey = `b2bking_sale_product_price_group_${customerGroupId}`;

      const regularMeta = meta.find((m: WooMeta) => m.key === regularKey);
      const saleMeta = meta.find((m: WooMeta) => m.key === saleKey);

      const groupRegular = regularMeta ? Number(regularMeta.value) : NaN;
      const groupSale = saleMeta ? Number(saleMeta.value) : NaN;

      // Ako postoji posebna sale cena → koristimo nju kao effective
      if (!Number.isNaN(groupSale) && groupSale > 0) {
        zvo_regular_price =
          !Number.isNaN(groupRegular) && groupRegular > 0
            ? groupRegular
            : baseRegularPrice || basePrice || groupSale;

        zvo_effective_price = groupSale;
      } else if (!Number.isNaN(groupRegular) && groupRegular > 0) {
        // Inače ako postoji samo regular za grupu
        zvo_regular_price = groupRegular;
        zvo_effective_price = groupRegular;
      }

      if (zvo_regular_price > 0 && zvo_effective_price < zvo_regular_price) {
        zvo_discount_percent = Math.round(
          ((zvo_regular_price - zvo_effective_price) / zvo_regular_price) * 100,
        );
      } else {
        zvo_discount_percent = 0;
      }
    }

    const payload = {
      ...product,
      zvo_regular_price,
      zvo_effective_price,
      zvo_discount_percent,
      // može pomoći kod debug-a:
      zvo_is_b2b: isB2BUser,
      zvo_group_id: customerGroupId,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err: unknown) {
    console.error('[product GET] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected error', details: String(err) },
      { status: 500 },
    );
  }
}