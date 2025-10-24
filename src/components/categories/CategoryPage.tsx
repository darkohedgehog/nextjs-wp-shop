'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react'; // ✅ Apollo 4.0.7 hooks
import { client } from '@/lib/apollo-client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import he from 'he';

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
    products(first: 10, after: $after, where: { categoryId: $categoryId }) {
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

// util: bezbedno izvući slug-ove iz params
function getSlugs(params: Record<string, string | string[] | undefined>) {
  const raw = params?.slug;
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return { parentSlug: arr[0] ?? null, childSlug: arr[1] ?? null };
}

// util: pročisti cenu (entiteti &nbsp; i realni NBSP)
function cleanPrice(raw?: string | null) {
  if (!raw) return '';
  return he.decode(raw).replace(/&nbsp;|\u00A0/g, '').trim();
}

export default function CategoryPage() {
  // Dynamic slugs
  const params = useParams() as Record<string, string | string[] | undefined>;
  const { parentSlug, childSlug } = getSlugs(params);

  // Fetch category tree
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

  // Izračunaj trenutnu kategoriju (parent ili child)
  const parentCat = catData?.productCategory ?? null;

  // children.nodes mogu imati null/undefined -> očisti
  const childNodes: Category[] = (parentCat?.children?.nodes ?? []).filter(
    (c): c is Category => Boolean(c)
  );

  const currentCat: Category | null = parentCat
    ? childSlug
      ? childNodes.find((c) => c.slug === childSlug) || null
      : parentCat
    : null;

  const categoryId = currentCat?.databaseId ?? null;

  // State za paginaciju
  const [products, setProducts] = useState<Product[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    endCursor: null,
    hasNextPage: false,
  });

  // Fetch products za aktivnu (leaf) kategoriju
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

  // Sync product state na svaku promenu prodData
  useEffect(() => {
    if (!prodData?.products) return;
  
    const nodes = prodData.products.nodes ?? [];
    const clean = nodes.filter((p): p is Product => Boolean(p));
  
    setProducts(clean);
  
    setPageInfo({
      endCursor: prodData.products.pageInfo?.endCursor ?? null,
      hasNextPage: prodData.products.pageInfo?.hasNextPage ?? false,
    });
  }, [prodData]);

  const loadMore = async () => {
    if (!fetchMore || !pageInfo.hasNextPage || !pageInfo.endCursor) return;
  
    const res = await fetchMore({ variables: { after: pageInfo.endCursor } });
  
    const nodes = res?.data?.products?.nodes ?? [];
    const clean = nodes.filter((p): p is Product => Boolean(p));
  
    setProducts((prev) => [...prev, ...clean]);
  
    setPageInfo({
      endCursor: res?.data?.products?.pageInfo?.endCursor ?? null,
      hasNextPage: res?.data?.products?.pageInfo?.hasNextPage ?? false,
    });
  };
  // Rendering logic
  if (!parentSlug) {
    return <p className="p-4">Učitavanje…</p>;
  }
  if (catLoading && !parentCat) {
    return <p className="p-4">Učitavanje kategorije...</p>;
  }
  if (catError || !parentCat) {
    return <p className="p-4 text-red-600">Kategorija nije pronađena.</p>;
  }
  if (!currentCat) {
    return <p className="p-4 text-red-600">Podkategorija nije pronađena.</p>;
  }

  const showSubcategories = !childSlug && childNodes.length > 0;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{currentCat.name}</h1>

      {showSubcategories ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {childNodes.map((sub) => (
            <Link
              key={sub.id}
              href={`/categories/${parentSlug}/${sub.slug}`}
              className="border rounded overflow-hidden hover:shadow-lg"
            >
              {sub.image?.sourceUrl && (
                <Image
                  src={sub.image.sourceUrl}
                  alt={sub.image.altText || sub.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 text-center">
                <h2 className="text-xl font-semibold">{sub.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="border p-4 rounded shadow hover:shadow-lg transition"
              >
                {product.image?.sourceUrl && (
                  <Image
                    src={product.image.sourceUrl}
                    alt={product.image.altText || product.name}
                    width={220}
                    height={220}
                    className="w-full h-40 object-cover mb-2"
                  />
                )}
                <h2 className="text-lg font-bold mb-1">{product.name}</h2>
                {product.price && (
                  <p className="text-green-600 font-semibold">
                    {cleanPrice(product.price)}
                  </p>
                )}
              </Link>
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