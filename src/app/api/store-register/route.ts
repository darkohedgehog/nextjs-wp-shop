// app/api/store-register/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const B2B_GROUP_ID = 308; // <- ID grupe iz B2BKing -> Groups

export async function POST(req: NextRequest) {
  const body = await req.json();

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
    company_postcode,   // 👈 DODATO
    company_country,
  } = body;

  const payload: any = {
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
      company:   company_name,
      address_1: company_address,
      city:      company_city,
      postcode:  company_postcode,  // 👈 DODATO (billing_postcode)
      country:   company_country,
      phone:     company_phone,
      email,
    };

    payload.meta_data = [
      { key: 'b2bking_b2buser',       value: 'yes' },
      { key: 'b2bking_customergroup', value: B2B_GROUP_ID },

      // tvoja ACF polja:
      { key: 'company_name',      value: company_name },
      { key: 'company_vat',       value: company_vat },
      { key: 'company_oib',       value: company_oib },
      { key: 'company_phone',     value: company_phone },
      { key: 'company_postcode',  value: company_postcode },

      // opciono: ako želiš da B2BKing koristi VAT broj za svoje logike:
      // { key: 'b2bking_vat_number', value: company_vat },
    ];
  }

  const url = new URL('/wp-json/wc/v3/customers', process.env.WC_BASE_URL!);

  // ⚠️ Obrati pažnju da koristiš iste env nazive svuda
  url.searchParams.set('consumer_key',    process.env.WC_KEY!);
  url.searchParams.set('consumer_secret', process.env.WC_SECRET!);

  const wpRes = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await wpRes.json();
  return NextResponse.json(data, { status: wpRes.status });
}