'use client';

import { gql, useQuery } from '@apollo/client';
import client from '@/lib/apollo-client';
import Link from 'next/link';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      nodes {
        id
        name
        slug
        description
        price
      }
    }
  }
`;

export default function ProductListPage() {
  const { loading, error, data } = useQuery(GET_PRODUCTS, { client });

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p>Greška: {error.message}</p>;

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {data.products.nodes.map((product: any) => (
        <Link href={`/products/${product.slug}`} key={product.id} className="border p-4 rounded shadow">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <h2 className="text-xl font-bold">{product.price}</h2>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </Link>
      ))}
    </div>
  );
}
