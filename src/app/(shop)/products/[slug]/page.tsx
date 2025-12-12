// src/app/(shop)/products/[slug]/page.tsx

import type { Metadata } from "next";
import ProductDetailPage from "@/components/product/ProductDetailPage";
import { buildMetadata } from "@/utils/seo";
import { siteMetaData } from "@/utils/siteMetaData";

// -----------------------------
// Types
// -----------------------------
type BrandNode = { name?: string | null; slug?: string | null } | null;

type ProductMeta = {
  name: string;
  slug: string;
  shortDescription?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
  pwbBrands?: { nodes: BrandNode[] } | null;
};

type ProductMetaResponse = {
  data?: {
    product?: ProductMeta | null;
  };
  errors?: unknown;
};

type ProductJsonLd = {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  image?: string[];
  description?: string;
  sku?: string;
  brand?: {
    "@type": "Brand";
    name: string;
  };
  offers?: {
    "@type": "Offer";
    url: string;
    priceCurrency: string;
    price: string;
    availability:
      | "https://schema.org/InStock"
      | "https://schema.org/OutOfStock"
      | "https://schema.org/PreOrder"
      | "https://schema.org/BackOrder";
  };
};

// -----------------------------
// Helpers
// -----------------------------
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input: string, max = 160): string {
  const s = input.trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

// -----------------------------
// Server fetch – meta (GraphQL)
// -----------------------------
async function fetchProductMeta(slug: string): Promise<ProductMeta | null> {
  const endpoint =
    process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;

  if (!endpoint) return null;

  const query = `
    query ProductMeta($id: ID!) {
      product(id: $id, idType: SLUG) {
        name
        slug
        shortDescription
        image {
          sourceUrl
          altText
        }
        pwbBrands(first: 1) {
          nodes {
            name
            slug
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ query, variables: { id: slug } }),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as ProductMetaResponse;
    return json?.data?.product ?? null;
  } catch {
    return null;
  }
}

/**
 * Small in-module cache so we don't fetch twice (metadata + page render).
 * (Napomena: radi u okviru istog node procesa; u dev-u i na serverless-u
 * očekuj da ponekad bude "best effort", ali u praksi pomaže.)
 */
const productMetaCache = new Map<string, Promise<ProductMeta | null>>();

function getProductMetaCached(slug: string): Promise<ProductMeta | null> {
  const existing = productMetaCache.get(slug);
  if (existing) return existing;

  const p = fetchProductMeta(slug);
  productMetaCache.set(slug, p);
  return p;
}

// -----------------------------
// JSON-LD builder
// -----------------------------
function buildProductJsonLd(product: ProductMeta): ProductJsonLd {
  const brandName = product.pwbBrands?.nodes?.[0]?.name ?? null;

  const descriptionText = product.shortDescription
    ? truncate(stripHtml(product.shortDescription), 300)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image?.sourceUrl ? [product.image.sourceUrl] : undefined,
    description: descriptionText,
    brand: brandName
      ? {
          "@type": "Brand",
          name: brandName,
        }
      : undefined,

    // offers: namerno prazno dok ne uradimo server-side fetch cene/stock-a
    // (da JSON-LD ne laže ako B2B/B2C menja price)
  };
}

// -----------------------------
// SEO METADATA
// -----------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductMetaCached(slug);

  // fallback ako WP padne ili nema proizvoda
  if (!product?.name || !product?.slug) {
    return buildMetadata({
      title: `Proizvod | ${siteMetaData.brand}`,
      description: siteMetaData.description,
      path: `/products/${slug}`,
      ogImage: siteMetaData.banners.products,
      noIndex: true,
    });
  }

  const brandName = product.pwbBrands?.nodes?.[0]?.name ?? null;

  const rawDescription = product.shortDescription
    ? stripHtml(product.shortDescription)
    : "";

  const description =
    truncate(rawDescription, 160) ||
    truncate(`Kupite ${product.name} online. Dostupnost, cijena i specifikacije.`, 160);

  const title = brandName ? `${product.name} – ${brandName}` : product.name;

  const ogImage = product.image?.sourceUrl || siteMetaData.banners.products;

  return buildMetadata({
    title,
    description,
    path: `/products/${product.slug}`,
    ogImage,
  });
}

// -----------------------------
// PAGE RENDER (server wrapper + JSON-LD)
// -----------------------------
export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductMetaCached(slug);
  const jsonLd = product ? buildProductJsonLd(product) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Client UI (tvoj postojeći) */}
      <ProductDetailPage />
    </>
  );
}