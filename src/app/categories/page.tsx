import client from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';

export default async function CategoriesPage() {
  const GET_TOP_CATEGORIES = gql`
    query GetTopCategories {
      productCategories(where: { parent: 0 }) {
        nodes {
          id
          name
          slug
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  `;

  const { data } = await client.query({ query: GET_TOP_CATEGORIES });
  const categories = data.productCategories.nodes;

  return (
    <div className="p-4 grid grid-cols-3 gap-6">
      {categories.map((cat: any) => (
        <Link
          key={cat.slug}
          href={`/categories/${cat.slug}`}
          className="border rounded overflow-hidden hover:shadow-lg"
        >
          {cat.image?.sourceUrl && (
            <Image
              src={cat.image.sourceUrl}
              alt={cat.image.altText || cat.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold">{cat.name}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}
