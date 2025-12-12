// src/app/(shop)/categories/[...slug]/page.tsx

import type { Metadata } from "next";
import { client } from "@/lib/apollo-client";
import { gql } from "@apollo/client";

import { ProductCard } from "@/components/product/ProductCard";
import { CategoryProductsClient } from "@/components/categories/CategoryProductsClient";
import BackButton from "@/components/ui/BackButton";
import ShopShell from "@/components/shop/ShopShell";

import { buildMetadata } from "@/utils/seo";
import { siteMetaData } from "@/utils/siteMetaData";

// --------------------
// "Strict" tipovi koje koristi UI (100% definisani gde treba)
// --------------------
type Media = {
  sourceUrl: string;
  altText?: string | null;
};

type Category = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: Media | null;
  children: { nodes: Category[] };
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price?: string | null;
  image?: Media | null;
};

type PageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
};

type ProductsData = {
  products?: {
    pageInfo: PageInfo;
    nodes: Array<Product | null | undefined>;
  } | null;
};

type SearchParams = Record<string, string | string[] | undefined>;

// --------------------
// "Raw" tipovi za GraphQL (svuda optional) — da ne puca TS zbog DeepPartial
// --------------------
type MediaRaw = {
  sourceUrl?: string | null;
  altText?: string | null;
} | null;

type CategoryRaw = {
  id?: string | null;
  databaseId?: number | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  image?: MediaRaw;
  children?: {
    nodes?: Array<CategoryRaw | null | undefined> | null;
  } | null;
} | null;

type CategoryDataRaw = {
  productCategory?: CategoryRaw;
};

// --------------------
// GraphQL
// --------------------
const GET_CATEGORY_TREE = gql`
  query CategoryTree($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      image {
        sourceUrl
        altText
      }
      children {
        nodes {
          id
          databaseId
          name
          slug
          description
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory($categoryId: Int!, $after: String) {
    products(first: 24, after: $after, where: { categoryId: $categoryId }) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

// --------------------
// SEO helpers
// --------------------
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input: string, max = 160): string {
  const s = input.trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

// --------------------
// Normalizacija (Raw -> Strict)
// --------------------
function normalizeMedia(raw: MediaRaw): Media | null {
  const url = raw?.sourceUrl ?? null;
  if (!url) return null;
  return { sourceUrl: url, altText: raw?.altText ?? null };
}

function normalizeCategory(raw: CategoryRaw): Category | null {
  const id = raw?.id ?? null;
  const databaseId = raw?.databaseId ?? null;
  const name = raw?.name ?? null;
  const slug = raw?.slug ?? null;

  if (!id || !databaseId || !name || !slug) return null;

  const childrenNodesRaw = raw?.children?.nodes ?? [];
  const childrenNodes = (childrenNodesRaw ?? [])
    .map((c) => normalizeCategory(c ?? null))
    .filter((c): c is Category => Boolean(c));

  return {
    id,
    databaseId,
    name,
    slug,
    description: raw?.description ?? null,
    image: normalizeMedia(raw?.image ?? null),
    children: { nodes: childrenNodes },
  };
}

function normalizeCategoryData(raw: CategoryDataRaw): { productCategory: Category | null } {
  const normalized = normalizeCategory(raw.productCategory ?? null);
  return { productCategory: normalized };
}

// --------------------
// Small cache (metadata + page render)
// Cache-ujemo RAW data, pa normalizujemo na izlazu.
// --------------------
const categoryTreeCache = new Map<string, Promise<CategoryDataRaw>>();

function getCategoryTreeCached(parentSlug: string): Promise<CategoryDataRaw> {
  const existing = categoryTreeCache.get(parentSlug);
  if (existing) return existing;

  const p = client
    .query<CategoryDataRaw>({
      query: GET_CATEGORY_TREE,
      variables: { slug: parentSlug },
      context: {
        fetchOptions: {
          next: { revalidate: 300 },
          cache: "force-cache",
        },
      },
    })
    .then((res) => res.data ?? {});

  categoryTreeCache.set(parentSlug, p);
  return p;
}

// --------------------
// generateMetadata
// --------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  const slugArr = resolvedParams.slug ?? [];
  const parentSlug = slugArr[0] ?? null;
  const childSlug = slugArr[1] ?? null;

  // /categories fallback
  if (!parentSlug) {
    return buildMetadata({
      title: siteMetaData.pages.categories.title,
      description: siteMetaData.pages.categories.description,
      path: siteMetaData.pages.categories.path,
      ogImage: siteMetaData.pages.categories.banner,
    });
  }

  const raw = await getCategoryTreeCached(parentSlug);
  const { productCategory: parentCat } = normalizeCategoryData(raw);

  if (!parentCat) {
    return buildMetadata({
      title: "Kategorija nije pronađena",
      description: siteMetaData.pages.categories.description,
      path: `/categories/${parentSlug}`,
      ogImage: siteMetaData.pages.categories.banner,
      noIndex: true,
    });
  }

  const childNodes = parentCat.children.nodes;
  const currentCat: Category | null = childSlug
    ? childNodes.find((c) => c.slug === childSlug) ?? null
    : parentCat;

  if (!currentCat) {
    const badPath = `/categories/${parentSlug}/${childSlug ?? ""}`.replace(/\/$/, "");
    return buildMetadata({
      title: "Podkategorija nije pronađena",
      description: siteMetaData.pages.categories.description,
      path: badPath,
      ogImage: siteMetaData.pages.categories.banner,
      noIndex: true,
    });
  }

  const path = childSlug
    ? `/categories/${parentSlug}/${childSlug}`
    : `/categories/${parentSlug}`;

  const title = childSlug
    ? `${currentCat.name} | ${parentCat.name}`
    : `${currentCat.name} | ${siteMetaData.brand}`;

  const rawDesc =
    currentCat.description?.trim() ||
    parentCat.description?.trim() ||
    siteMetaData.pages.categories.description;

  const description = truncate(stripHtml(rawDesc), 160);

  const ogImage =
    currentCat.image?.sourceUrl ||
    parentCat.image?.sourceUrl ||
    siteMetaData.banners.categories;

  return buildMetadata({
    title,
    description,
    path,
    ogImage,
  });
}

// --------------------
// Page
// --------------------
export default async function CategorySlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slugArr = resolvedParams.slug ?? [];
  const parentSlug = slugArr[0] ?? null;
  const childSlug = slugArr[1] ?? null;

  if (!parentSlug) {
    return (
      <ShopShell searchParams={resolvedSearchParams}>
        <p className="p-4 max-w-5xl mx-auto text-sm paragraph-color text-center">
          Učitavanje…
        </p>
      </ShopShell>
    );
  }

  const raw = await getCategoryTreeCached(parentSlug);
  const { productCategory: parentCat } = normalizeCategoryData(raw);

  if (!parentCat) {
    return (
      <ShopShell searchParams={resolvedSearchParams}>
        <p className="p-4 max-w-5xl mx-auto text-sm text-red-600 text-center">
          Kategorija nije pronađena.
        </p>
      </ShopShell>
    );
  }

  const childNodes = parentCat.children.nodes;

  const currentCat: Category | null = childSlug
    ? childNodes.find((c) => c.slug === childSlug) ?? null
    : parentCat;

  if (!currentCat) {
    return (
      <ShopShell searchParams={resolvedSearchParams}>
        <p className="p-4 max-w-5xl mx-auto text-sm text-red-600 text-center">
          Podkategorija nije pronađena.
        </p>
      </ShopShell>
    );
  }

  const showSubcategories = !childSlug && childNodes.length > 0;

  // leaf -> products
  let products: Product[] = [];
  let initialPageInfo: PageInfo = { endCursor: null, hasNextPage: false };

  if (!showSubcategories) {
    const prodRes = await client.query<ProductsData>({
      query: GET_PRODUCTS_BY_CATEGORY,
      variables: { categoryId: currentCat.databaseId, after: null },
      context: {
        fetchOptions: {
          next: { revalidate: 300 },
          cache: "force-cache",
        },
      },
    });

    const productsData = prodRes.data?.products ?? null;
    const nodes = productsData?.nodes ?? [];

    products = nodes.filter((p): p is Product => Boolean(p));
    initialPageInfo =
      productsData?.pageInfo ?? { endCursor: null, hasNextPage: false };
  }

  return (
    <ShopShell searchParams={resolvedSearchParams}>
      <div className="p-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 secondary-color">
          {currentCat.name}
        </h1>

        {showSubcategories ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 mt-6 gap-5 max-w-5xl mx-auto">
            {childNodes.map((sub) => (
              <ProductCard
                key={sub.id}
                href={`/categories/${parentSlug}/${sub.slug}`}
                name={sub.name}
                imageUrl={sub.image?.sourceUrl ?? parentCat.image?.sourceUrl ?? null}
                imageAlt={sub.image?.altText || sub.name}
                price={undefined}
                brandName={undefined}
              />
            ))}
          </div>
        ) : (
          <CategoryProductsClient
            initialProducts={products}
            initialPageInfo={initialPageInfo}
            categoryId={currentCat.databaseId}
          />
        )}

        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    </ShopShell>
  );
}