'use client';

import { useState } from 'react';
import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import he from 'he';
import { ProductCard } from '@/components/product/ProductCard';
import { FaSpinner } from 'react-icons/fa6';

// ——— Tipovi (mogu da budu i shared ako hoćeš) ———
type Product = {
  id: string;
  name: string;
  slug: string;
  price?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
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

type Vars = {
  categoryId: number;
  after?: string | null;
};

// isti query kao na server strani
const GET_PRODUCTS_BY_CATEGORY = gql`
  query ProductsByCategory($categoryId: Int!, $after: String) {
    products(first: 12, after: $after, where: { categoryId: $categoryId }) {
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

// helper za display cene
function cleanPrice(raw?: string | null) {
  if (!raw) return '';
  return he.decode(raw).replace(/&nbsp;|\u00A0/g, '').trim();
}

export function CategoryProductsClient({
  initialProducts,
  initialPageInfo,
  categoryId,
}: {
  initialProducts: Product[];
  initialPageInfo: PageInfo;
  categoryId: number;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [pageInfo, setPageInfo] = useState<PageInfo>(
    initialPageInfo ?? { endCursor: null, hasNextPage: false },
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return;
    try {
      setLoadingMore(true);
      setError(null);

      const res = await client.query<ProductsData, Vars>({
        query: GET_PRODUCTS_BY_CATEGORY,
        variables: {
          categoryId,
          after: pageInfo.endCursor,
        },
        fetchPolicy: 'network-only',
      });

      const next = res.data?.products;
      if (next) {
        const nextNodes =
          next.nodes.filter(
            (p: Product | null | undefined): p is Product => Boolean(p),
          ) ?? [];
        setProducts((prev) => [...prev, ...nextNodes]);
        setPageInfo(next.pageInfo);
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message ?? 'Greška pri učitavanju proizvoda.');
      } else {
        setError('Greška pri učitavanju proizvoda.');
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      {/* Grid proizvoda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 mt-6 gap-5 max-w-5xl mx-auto">
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

      {/* Dugme “Učitaj više” */}
      {pageInfo.hasNextPage && (
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-button-color text-blue-500 px-6 py-2 rounded-xl disabled:opacity-60 flex items-center gap-3"
          >
            {loadingMore ? 'Učitavanje…' : 'Učitaj više'}
            {loadingMore && <FaSpinner className="animate-spin text-blue-500" />}
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="mt-4 text-center text-red-500 text-sm max-w-md mx-auto">
          {error}
        </p>
      )}

      {/* Ako baš nema proizvoda */}
      {!products.length && !pageInfo.hasNextPage && !loadingMore && !error && (
        <p className="mt-4 text-center text-gray-400 text-sm">
          Nema proizvoda u ovoj kategoriji.
        </p>
      )}
    </>
  );
}