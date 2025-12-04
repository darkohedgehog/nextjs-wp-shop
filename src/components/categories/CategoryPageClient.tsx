'use client';

import { useState, useEffect } from 'react';
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

  // ⚠️ ovde TS zna da je catData: CategoryData | undefined
  // zato prvo izvučemo "categoryData"
  const categoryData = catData?.productCategory ?? null;
  const parentCat = categoryData;

  const childNodes: Category[] = (parentCat?.children?.nodes ?? []).filter(
    (c): c is Category => Boolean(c),
  );

  const currentCat: Category | null = parentCat
    ? childSlug
      ? childNodes.find((c) => c.slug === childSlug) || null
      : parentCat
    : null;

  const categoryId = currentCat?.databaseId ?? null;

  // 2) Proizvodi za aktivnu kategoriju
  const [products, setProducts] = useState<Product[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    endCursor: null,
    hasNextPage: false,
  });

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

  useEffect(() => {
    // 🔒 prvo izvučemo productsData da TS suzimo
    const productsData = prodData?.products;
    if (!productsData) return;

    const nodes = productsData.nodes ?? [];
    const clean = nodes.filter((p): p is Product => Boolean(p));

    setProducts(clean);
    setPageInfo({
      endCursor: productsData.pageInfo?.endCursor ?? null,
      hasNextPage: productsData.pageInfo?.hasNextPage ?? false,
    });
  }, [prodData]);

  const loadMore = async () => {
    if (!fetchMore || !pageInfo.hasNextPage || !pageInfo.endCursor) return;

    const res = await fetchMore({ variables: { after: pageInfo.endCursor } });

    // opet lokalna varijabla da TS bude srećan
    const productsData = res?.data?.products;
    if (!productsData) return;

    const nodes = productsData.nodes ?? [];
    const clean = nodes.filter((p): p is Product => Boolean(p));

    setProducts((prev) => [...prev, ...clean]);

    setPageInfo({
      endCursor: productsData.pageInfo?.endCursor ?? null,
      hasNextPage: productsData.pageInfo?.hasNextPage ?? false,
    });
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
              imageUrl={sub.image?.sourceUrl ?? parentCat.image?.sourceUrl ?? null}
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
                price={product.price ? cleanPrice(product.price) : undefined}
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
            <p className="mt-4 text-red-600">Greška: {prodError.message}</p>
          )}
        </>
      )}
    </div>
  );
}