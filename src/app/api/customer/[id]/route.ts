import { NextRequest } from 'next/server';
import { address, customerView, record } from '@/lib/commerce-security';
import { checkMutation, commerceError, ownCustomer, privateJson, woo, CommerceError } from '@/lib/commerce-server';

type Context = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const id = await ownCustomer(req, (await params).id);
    return privateJson(customerView(await woo(`customers/${id}`)));
  } catch (error) { return commerceError(error); }
}
export async function PUT(req: NextRequest, { params }: Context) {
  try {
    checkMutation(req);
    const id = await ownCustomer(req, (await params).id);
    const body = record(await req.json());
    let billing;
    try { billing = address(body); } catch { throw new CommerceError(400, 'Provjerite podatke adrese.'); }
    const meta_data = ['company_oib', 'company_vat'].flatMap(key => {
      const value = body[key];
      if (value === undefined) return [];
      if (typeof value !== 'string' || value.length > 100) throw new CommerceError(400, 'Neispravni podaci tvrtke.');
      return [{ key, value }];
    });
    const { email, ...shipping } = billing;
    const customer = await woo(`customers/${id}`, { method: 'PUT', body: JSON.stringify({
      first_name: billing.first_name, last_name: billing.last_name, email,
      billing, shipping, meta_data,
    }) });
    return privateJson(customerView(customer));
  } catch (error) { return commerceError(error); }
}
