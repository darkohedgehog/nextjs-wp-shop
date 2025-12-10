import { NextRequest, NextResponse } from 'next/server';

const WC_BASE_URL        = process.env.WC_BASE_URL;
const WC_CONSUMER_KEY    = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_BASE_URL)        console.warn('[customer] WC_BASE_URL nije definisan');
if (!WC_CONSUMER_KEY)    console.warn('[customer] WC_CONSUMER_KEY nije definisan');
if (!WC_CONSUMER_SECRET) console.warn('[customer] WC_CONSUMER_SECRET nije definisan');

function basicAuthHeader(): string {
  const token = Buffer.from(
    `${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`
  ).toString('base64');
  return `Basic ${token}`;
}

type WooCustomerUpdatePayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  billing: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  shipping: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postcode?: string;
    country?: string;
    phone?: string;
  };
  meta_data?: { key: string; value: string }[];
  // ako Woo doda još nešto, da ne puca:
  [key: string]: unknown;
};

// GET /api/customer/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!WC_BASE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return NextResponse.json(
        { error: 'Woo env vars missing' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const url = new URL(`/wp-json/wc/v3/customers/${id}`, WC_BASE_URL);

    const wpRes = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: basicAuthHeader() },
      cache: 'no-store',
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      console.error('[customer GET] Woo error:', wpRes.status, text);
      return new NextResponse(text, {
        status: wpRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[customer GET] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected error', details: String(err) },
      { status: 500 }
    );
  }
}

// PUT /api/customer/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!WC_BASE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return NextResponse.json(
        { error: 'Woo env vars missing' },
        { status: 500 }
      );
    }

    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const {
      first_name,
      last_name,
      company,
      address_1,
      address_2,
      city,
      postcode,
      country,
      phone,
      email,

      // B2B polja
      company_oib,
      company_vat,
    } = body;

    const url = new URL(`/wp-json/wc/v3/customers/${id}`, WC_BASE_URL);

    const meta: { key: string; value: string }[] = [];

    if (company_oib) {
      meta.push({ key: 'company_oib', value: String(company_oib) });
    }
    if (company_vat) {
      meta.push({ key: 'company_vat', value: String(company_vat) });
      // ako želiš i za B2BKing:
      // meta.push({ key: 'b2bking_vat_number', value: String(company_vat) });
    }

    const wooPayload: WooCustomerUpdatePayload = {
  first_name,
  last_name,
  email,
  billing: {
    first_name,
    last_name,
    company,
    address_1,
    address_2,
    city,
    postcode,
    country,
    phone,
    email,
  },
  shipping: {
    first_name,
    last_name,
    company,
    address_1,
    address_2,
    city,
    postcode,
    country,
    phone,
  },
};
    if (meta.length > 0) {
      wooPayload.meta_data = meta;
    }

    const wpRes = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuthHeader(),
      },
      body: JSON.stringify(wooPayload),
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      console.error('[customer PUT] Woo error:', wpRes.status, text);
      return NextResponse.json(
        {
          error: `Woo update customer failed (status ${wpRes.status})`,
          wooStatus: wpRes.status,
          wooBody: text,
        },
        { status: 500 }
      );
    }

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[customer PUT] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected error', details: String(err) },
      { status: 500 }
    );
  }
}