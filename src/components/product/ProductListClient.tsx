'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react'; // za 4.0.7 je ovo pravi import za hookove
import Link from 'next/link';
import { useEffect, useState } from 'react';
import he from 'he';
import Image from 'next/image';

interface Product {
  databaseId?: number;
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  price?: string;
  image?: { sourceUrl: string; altText?: string };
}
interface PageInfo { endCursor: string | null; hasNextPage: boolean; }
interface ProductsData {
  products: { pageInfo: PageInfo; nodes: Product[] };
}
interface Vars {
  search?: string;
  category?: string[];
  after?: string | null;
}

const GET_PRODUCTS = gql`
  query GetProducts($search: String, $category: [String], $after: String) {
    products(
      first: 6
      after: $after
      where: { search: $search, categoryIn: $category }
    ) {
      pageInfo { endCursor hasNextPage }
      nodes {
        databaseId
        id
        name
        slug
        description
        ... on SimpleProduct {
          price
          image { sourceUrl altText }
        }
      }
    }
  }
`;

function dedupeProducts(list: Product[]): Product[] {
  const map = new Map<string | number, Product>();
  for (const p of list) {
    const key = p.databaseId ?? `${p.id}:${p.slug}`;
    if (!map.has(key)) map.set(key, p);
  }
  return Array.from(map.values());
}

function productKey(p: Product): string {
  return String(p.databaseId ?? `${p.id}:${p.slug}`);
}

export default function ProductListClient({
  initialProducts,
  initialPageInfo,
  initialSearch,
}: {
  initialProducts: Product[];
  initialPageInfo: PageInfo;
  initialSearch: string;
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch ?? '');
  const [products, setProducts] = useState<Product[]>(
    dedupeProducts(initialProducts ?? [])
  );
  const [pageInfo, setPageInfo] = useState<PageInfo>(
    initialPageInfo ?? { endCursor: null, hasNextPage: false }
  );

  // Napomena: u 4.0.7 typings za /react overload su konzervativni.
  // Ne koristimo onCompleted; umesto toga sync radimo u useEffect ispod.
  const { data, loading, error, fetchMore, refetch, networkStatus } =
    useQuery<ProductsData, Vars>(GET_PRODUCTS, {
      variables: {
        search: initialSearch || undefined,
        category: undefined,
        after: null,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });

  // Kad stignu podaci, uskladi lokalni state (bez duplikata)
  useEffect(() => {
    if (data?.products) {
      setProducts(dedupeProducts(data.products.nodes));
      setPageInfo(data.products.pageInfo);
    }
  }, [data]);

  const loadMore = async () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return;

    const res = await fetchMore({
      variables: {
        search: searchTerm || undefined,
        category: undefined,
        after: pageInfo.endCursor,
      },
    });

    const next = (res?.data as ProductsData | undefined)?.products;
    if (next) {
      setProducts((prev) => dedupeProducts([...prev, ...next.nodes]));
      setPageInfo(next.pageInfo);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await refetch({
      search: searchTerm || undefined,
      category: undefined,
      after: null,
    });

    const refreshed = (res.data as ProductsData | undefined)?.products;
    if (refreshed) {
      setProducts(dedupeProducts(refreshed.nodes));
      setPageInfo(refreshed.pageInfo);
    } else {
      setProducts([]);
      setPageInfo({ endCursor: null, hasNextPage: false });
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Pretraga..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          aria-label="Pretraži proizvode"
        >
          Traži
        </button>
      </form>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            href={`/products/${product.slug}`}
            key={productKey(product)}
            className="border p-4 rounded shadow hover:shadow-lg transition"
          >
            {product.image?.sourceUrl && (
              <Image
                width={400}
                height={400}
                src={product.image.sourceUrl}
                alt={product.image.altText || product.name}
                className="w-full h-48 object-cover mb-2"
              />
            )}
            <h2 className="text-lg font-bold mb-1">{product.name}</h2>

            {product.price && (
              <p className="text-green-600 text-sm font-semibold mb-2">
                {
                  he
                    .decode(product.price)
                    .replace(/&nbsp;|\u00A0/g, '')
                    .trim()
                }
              </p>
            )}

            {product.description && (
              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </Link>
        ))}
      </div>

      {pageInfo.hasNextPage && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            disabled={loading || networkStatus === 3 /* refetch */ }
          >
            {loading ? 'Učitavanje…' : 'Učitaj još'}
          </button>
        </div>
      )}

      {loading && !products.length && (
        <p className="mt-4 text-center">Učitavanje…</p>
      )}
      {error && <p className="mt-4 text-red-600">Greška: {error.message}</p>}
      {!loading && !error && !products.length && (
        <p className="mt-4 text-center text-gray-600">Nema rezultata.</p>
      )}
    </div>
  );
}