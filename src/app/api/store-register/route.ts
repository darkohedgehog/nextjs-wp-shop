import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const B2B_GROUP_ID = 308; // <- ID grupe iz B2BKing -> Groups

// Šta frontend šalje
type StoreRegisterBody = {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  isB2B?: boolean;
  company_name?: string;
  company_vat?: string;
  company_oib?: string;
  company_phone?: string;
  company_address?: string;
  company_city?: string;
  company_postcode?: string;
  company_country?: string;
};

// Woo meta_data item
type WooMeta = {
  key: string;
  value: string | number | boolean | null;
};

// Minimalni payload za kreiranje customer-a u Woo
type WooCustomerCreatePayload = {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    city?: string;
    postcode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  meta_data?: WooMeta[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as StoreRegisterBody;

  // očekujemo: email, first_name, last_name, username, password
  // plus B2B polja ako je isB2B === true
  const {
    email,
    first_name,
    last_name,
    username,
    password,
    isB2B,
    company_name,
    company_vat,
    company_oib,
    company_phone,
    company_address,
    company_city,
    company_postcode, // 👈 DODATO
    company_country,
  } = body;

  const payload: WooCustomerCreatePayload = {
    email,
    first_name,
    last_name,
    username,
    password,
  };

  // ako želiš da odmah puniš billing kompanijskim podacima:
  if (isB2B) {
    payload.billing = {
      first_name,
      last_name,
      company: company_name,
      address_1: company_address,
      city: company_city,
      postcode: company_postcode, // billing_postcode
      country: company_country,
      phone: company_phone,
      email,
    };

    const meta: WooMeta[] = [
      { key: 'b2bking_b2buser', value: 'yes' },
      { key: 'b2bking_customergroup', value: B2B_GROUP_ID },

      // tvoja ACF polja:
      { key: 'company_name', value: company_name ?? '' },
      { key: 'company_vat', value: company_vat ?? '' },
      { key: 'company_oib', value: company_oib ?? '' },
      { key: 'company_phone', value: company_phone ?? '' },
      { key: 'company_postcode', value: company_postcode ?? '' },

      // opciono:
      // { key: 'b2bking_vat_number', value: company_vat ?? '' },
    ];

    payload.meta_data = meta;
  }

  const baseUrl = process.env.WC_BASE_URL;
  if (!baseUrl || !process.env.WC_KEY || !process.env.WC_SECRET) {
    return NextResponse.json(
      { error: 'WooCommerce env vars missing (WC_BASE_URL / WC_KEY / WC_SECRET)' },
      { status: 500 },
    );
  }

  const url = new URL('/wp-json/wc/v3/customers', baseUrl);

  // ⚠️ Obrati pažnju da koristiš iste env nazive svuda
  url.searchParams.set('consumer_key', process.env.WC_KEY);
  url.searchParams.set('consumer_secret', process.env.WC_SECRET);

  const wpRes = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: unknown = await wpRes.json();
  return NextResponse.json(data, { status: wpRes.status });
}