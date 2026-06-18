import { NextRequest, NextResponse } from 'next/server';
import {
  getServerWooBaseUrl,
  getWooRestLogContext,
} from '@/lib/wordpress-endpoints';
import { sanitizeWooProducts } from '@/lib/woocommerce-products';

const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const PRODUCT_READ_REVALIDATE_SECONDS = 60;
const PRODUCT_READ_TIMEOUT_MS = 8000;

function getWooCredentialsPresence() {
  return {
    consumerKey: Boolean(WC_CONSUMER_KEY),
    consumerSecret: Boolean(WC_CONSUMER_SECRET),
  };
}

export async function GET(req: NextRequest) {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    console.error('WooCommerce credencijali nisu podešeni u .env', {
      credentialsPresent: getWooCredentialsPresence(),
    });
    return NextResponse.json(
      { error: 'WooCommerce credentials missing' },
      { status: 500 }
    );
  }

  let url: URL | null = null;

  try {
    const search  = req.nextUrl.searchParams;
    const include = search.get('include') ?? '';
    const perPage = search.get('per_page') ?? '10';

    url = new URL('/wp-json/wc/v3/products', getServerWooBaseUrl());

    if (include) url.searchParams.set('include', include);
    url.searchParams.set('per_page', perPage);

    // Basic auth sa ck/cs — isto kao u [id] ruti
    const authHeader =
      'Basic ' +
      Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

    const isUserSpecific = Boolean(
      req.headers.get('authorization') ||
        req.cookies.get('wpToken') ||
        req.cookies.get('wpUserEmail')
    );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PRODUCT_READ_TIMEOUT_MS);
    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
      headers: {
        Authorization: authHeader,
      },
      // Anonymous product reads can be briefly cached to avoid WooCommerce burst traffic and Nginx 502/504s.
      cache: isUserSpecific ? 'no-store' : 'force-cache',
      signal: controller.signal,
    };

    if (!isUserSpecific) {
      fetchOptions.next = { revalidate: PRODUCT_READ_REVALIDATE_SECONDS };
    }

    let res: Response;
    try {
      res = await fetch(url.toString(), fetchOptions);
    } finally {
      clearTimeout(timeout);
    }

    const text = await res.text();

    if (!res.ok) {
      console.error(
        'Woo products error:',
        getWooRestLogContext(url, getWooCredentialsPresence(), res.status),
      );
      return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const products: unknown = JSON.parse(text);
    const sanitizedProducts = sanitizeWooProducts(products, {
      includeCustomerPricing: isUserSpecific,
    });

    return NextResponse.json(sanitizedProducts, { status: 200 });
  } catch (error) {
    console.error(
      'Products proxy error:',
      url
        ? getWooRestLogContext(url, getWooCredentialsPresence())
        : { credentialsPresent: getWooCredentialsPresence() },
      error,
    );
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: timedOut ? 'WooCommerce products request timed out' : 'Unexpected error' },
      { status: timedOut ? 504 : 502 }
    );
  }
}
