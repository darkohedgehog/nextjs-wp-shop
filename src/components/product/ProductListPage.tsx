'use client';

import { gql, useQuery } from '@apollo/client';
import { client } from '@/lib/apollo-client';
import Link from 'next/link';
import { useState } from 'react';
import he from 'he';
import Image from 'next/image';

// Tip za Product
interface Product {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  price?: string;
  image?: {
    sourceUrl: string;
    altText?: string;
  };
}

const GET_PRODUCTS = gql`
  query GetProducts($search: String, $category: [String], $after: String) {
    products(first: 6, after: $after, where: { search: $search, categoryIn: $category }) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        name
        slug
        description
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

export default function ProductListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const { loading, error, data, fetchMore, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      search: searchTerm || undefined,
      category: undefined, // mozeš kasnije dodati filter po kategoriji ako bude UI
      after: null,
    },
    client,
    onCompleted: (data) => {
      setProducts(data.products.nodes);
      setAfterCursor(data.products.pageInfo.endCursor);
    },
  });

  const loadMore = async () => {
    const { data: moreData } = await fetchMore({
      variables: { after: afterCursor },
    });
    setProducts((prev) => [...prev, ...moreData.products.nodes]);
    setAfterCursor(moreData.products.pageInfo.endCursor);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch({ search: searchTerm, category: undefined, after: null });
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Traži
        </button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <Link
            href={`/products/${product.slug}`}
            key={product.id}
            className="border p-4 rounded shadow hover:shadow-lg transition"
          >
            {/* Product Image */}
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

            {/* Product Name */}
            <h2 className="text-lg font-bold mb-1">{product.name}</h2>

            {/* Product Price */}
            {product.price && (
              <p className="text-green-600 text-sm font-semibold mb-2">
                {he.decode(product.price).replace(/&nbsp;|&npsb;/g, '').trim()}
              </p>
            )}

            {/* Product Description */}
            {product.description && (
              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </Link>
        ))}
      </div>

      {data?.products?.pageInfo?.hasNextPage && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Učitaj još
          </button>
        </div>
      )}

      {loading && <p className="mt-4 text-center">Učitavanje...</p>}
      {error && <p className="mt-4 text-red-600">Greška: {error.message}</p>}
    </div>
  );
}