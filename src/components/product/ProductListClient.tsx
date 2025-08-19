'use client';

import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useState } from 'react';
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
    products(first: 6, after: $after, where: { search: $search, categoryIn: $category }) {
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
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [products, setProducts] = useState<Product[]>(dedupeProducts(initialProducts));
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);

  const { loading, error, fetchMore, refetch } = useQuery<ProductsData, Vars>(
    GET_PRODUCTS,
    {
      variables: { search: initialSearch || undefined, category: undefined, after: null },
      onCompleted: (d) => {
        setProducts(dedupeProducts(d.products.nodes));
        setPageInfo(d.products.pageInfo);
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const loadMore = async () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return;

    const { data: more } = await fetchMore({
      variables: {
        search: searchTerm || undefined,
        category: undefined,
        after: pageInfo.endCursor,         // <- KORISTI STATE, ne data
      },
    });

    const next = more.products;
    setProducts((prev) => dedupeProducts([...prev, ...next.nodes]));
    setPageInfo(next.pageInfo);            // <- AŽURIRAJ STATE PAGEINFO
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await refetch({
      search: searchTerm || undefined,
      category: undefined,
      after: null,
    });
    setProducts(dedupeProducts(res.data.products.nodes));
    setPageInfo(res.data.products.pageInfo);
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Traži</button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <Link
            href={`/products/${product.slug}`}
            key={productKey(product)}
            className="border p-4 rounded shadow hover:shadow-lg transition"
          >
            {product.image?.sourceUrl && (
              <Image
                width={200}
                height={200}
                src={product.image.sourceUrl}
                alt={product.image.altText || product.name}
                priority
                className="w-40 h-40 object-cover mb-2"
              />
            )}
            <h2 className="text-lg font-bold mb-1">{product.name}</h2>
            {product.price && (
              <p className="text-green-600 text-sm font-semibold mb-2">
                {he.decode(product.price).replace(/&nbsp;|&npsb;/g, '').trim()}
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
          <button onClick={loadMore} className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700">
            Učitaj još
          </button>
        </div>
      )}

      {loading && <p className="mt-4 text-center">Učitavanje...</p>}
      {error && <p className="mt-4 text-red-600">Greška: {error.message}</p>}
    </div>
  );
}