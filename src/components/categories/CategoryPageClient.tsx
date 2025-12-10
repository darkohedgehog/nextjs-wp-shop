'use client';

import { useState, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { client } from '@/lib/apollo-client';
import he from 'he';
import { ProductCard } from '@/components/product/ProductCard';

// --- Tipovi podataka
type Category = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image?: { sourceUrl: string; altText?: string | null } | null;
  children: { nodes: Array<Category | null | undefined> };
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
};

type PageInfo = { endCursor: string | null; hasNextPage: boolean };

type ProductsData = {
  products: {
    pageInfo: PageInfo;
    nodes: Array<Product | null | undefined>;
  };
};

type CategoryData = {
  productCategory: Category | null;
};

// GraphQL queries
const GET_CATEGORY_TREE = gql`
  query CategoryTree($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      image { sourceUrl altText }
      children {
        nodes {
          id
          databaseId
          name
          slug
          image { sourceUrl altText }
        }
      }
    }
  }
`;

const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory($categoryId: Int!, $after: String) {
    products(first: 12, after: $after, where: { categoryId: $categoryId }) {
      pageInfo { endCursor hasNextPage }
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price
          image { sourceUrl altText }
        }
      }
    }
  }
`;

// util: pročisti cenu
function cleanPrice(raw?: string | null) {
  if (!raw) return '';
  return he.decode(raw).replace(/&nbsp;|\u00A0/g, '').trim();
}

// slug može biti string ili string[]
function normalizeSlugParam(slug: string | string[] | undefined): string[] {
  if (!slug) return [];
  return Array.isArray(slug) ? slug : [slug];
}

export function CategoryPageClient({
  params,
}: {
  params: { slug?: string | string[] };
}) {
  // slug-ove dobijamo iz props-a od server route-a
  const slugArr = normalizeSlugParam(params.slug);
  const parentSlug = slugArr[0] ?? null;
  const childSlug = slugArr[1] ?? null;

  // 1) Kategorija (stablo)
  const {
    data: catData,
    loading: catLoading,
    error: catError,
  } = useQuery<CategoryData>(GET_CATEGORY_TREE, {
    variables: { slug: parentSlug as string },
    skip: !parentSlug,
    client,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const categoryData = catData?.productCategory ?? null;
  const parentCat = categoryData;

  const childNodes: Category[] = (parentCat?.children?.nodes ?? []).filter(
    (c: Category | null | undefined): c is Category => Boolean(c),
  );

  const currentCat: Category | null = parentCat
    ? childSlug
      ? childNodes.find((c) => c.slug === childSlug) || null
      : parentCat
    : null;

  const categoryId = currentCat?.databaseId ?? null;

  // 2) Proizvodi za aktivnu kategoriju

  // osnovni query
  const {
    data: prodData,
    loading: prodLoading,
    error: prodError,
    fetchMore,
  } = useQuery<ProductsData>(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId: categoryId as number, after: null },
    skip: !categoryId,
    client,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  // bazni podaci iz GraphQL-a (bez dodatnih stranica)
  const baseProductsData = prodData?.products;

  const baseProducts = useMemo<Product[]>(() => {
    if (!baseProductsData?.nodes) return [];
    return baseProductsData.nodes.filter(
      (p: Product | null | undefined): p is Product => Boolean(p),
    );
  }, [baseProductsData]);

  const basePageInfo: PageInfo = baseProductsData?.pageInfo ?? {
    endCursor: null,
    hasNextPage: false,
  };

  // dodatno učitane stranice (paginacija)
  const [extraProducts, setExtraProducts] = useState<Product[] | null>(null);
  const [overridePageInfo, setOverridePageInfo] = useState<PageInfo | null>(
    null,
  );

  const products = extraProducts ?? baseProducts;
  const pageInfo = overridePageInfo ?? basePageInfo;

  const loadMore = async () => {
    if (!fetchMore || !pageInfo.hasNextPage || !pageInfo.endCursor) return;

    const res = await fetchMore({ variables: { after: pageInfo.endCursor } });

    const productsData =
      (res.data as ProductsData | undefined)?.products ?? undefined;

    if (!productsData?.nodes) return;

    const newProducts = productsData.nodes.filter(
      (p: Product | null | undefined): p is Product => Boolean(p),
    );

    setExtraProducts((prev) => {
      const current = prev ?? baseProducts;
      return [...current, ...newProducts];
    });

    setOverridePageInfo(
      productsData.pageInfo ?? { endCursor: null, hasNextPage: false },
    );
  };

  // Rendering logic / guardovi
  if (!parentSlug) {
    return (
      <p className="p-4 flex items-center justify-center text-sm paragraph-color">
        Učitavanje…
      </p>
    );
  }

  if (catLoading && !parentCat) {
    return (
      <p className="p-4 flex items-center justify-center text-sm paragraph-color">
        Učitavanje kategorije...
      </p>
    );
  }

  if (catError || !parentCat) {
    return (
      <p className="p-4 text-red-600 flex items-center justify-center text-sm">
        Kategorija nije pronađena
      </p>
    );
  }

  if (!currentCat) {
    return (
      <p className="p-4 text-red-600 flex items-center justify-center text-sm">
        Podkategorija nije pronađena
      </p>
    );
  }

  const showSubcategories = !childSlug && childNodes.length > 0;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{currentCat.name}</h1>

      {showSubcategories ? (
        // 👉 Podkategorije – isti UI kao na CategoriesPage
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
          {childNodes.map((sub) => (
            <ProductCard
              key={sub.id}
              href={`/categories/${parentSlug}/${sub.slug}`}
              name={sub.name}
              imageUrl={
                sub.image?.sourceUrl ?? parentCat.image?.sourceUrl ?? null
              }
              imageAlt={sub.image?.altText || sub.name}
              price={undefined}
              brandName={undefined}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Leaf kategorija – proizvodi */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mt-6 gap-5 w-full">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                href={`/products/${product.slug}`}
                name={product.name}
                imageUrl={product.image?.sourceUrl ?? null}
                imageAlt={product.image?.altText || product.name}
                price={
                  product.price ? cleanPrice(product.price) : undefined
                }
                brandName={undefined}
              />
            ))}
          </div>

          {pageInfo.hasNextPage && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                disabled={prodLoading}
              >
                {prodLoading ? 'Učitavanje…' : 'Učitaj još'}
              </button>
            </div>
          )}

          {prodLoading && products.length === 0 && (
            <p className="mt-4 text-center">Učitavanje...</p>
          )}
          {prodError && (
            <p className="mt-4 text-red-600">
              Greška: {prodError.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}