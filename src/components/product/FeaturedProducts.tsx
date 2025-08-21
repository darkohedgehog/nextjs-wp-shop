import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import he from 'he';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  databaseId: number;
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
};

const GET_FEATURED_PRODUCTS = gql`
  query FeaturedProducts($first: Int! = 8) {
    products(first: $first, where: { featured: true }) {
      nodes {
        databaseId
        id
        name
        slug
        shortDescription
        ... on SimpleProduct {
          price
          image { sourceUrl altText }
        }
      }
    }
  }
`;

export default async function FeaturedProducts({ count = 8 }: { count?: number }) {
  const { data } = await client.query({
    query: GET_FEATURED_PRODUCTS,
    variables: { first: count },
  });

  const products: Product[] = data?.products?.nodes ?? [];
  if (products.length === 0) return null;

  return (
    <section>
      <h2 className="secondary-color text-center text-2xl md:text-5xl my-4">Izdvojeni proizvodi</h2>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <Link
            key={p.databaseId} // stabilan key
            href={`/products/${p.slug}`}
            className="border rounded-lg p-3 hover:shadow transition"
          >
            {p.image?.sourceUrl && (
              <Image
                src={p.image.sourceUrl}
                alt={p.image.altText || p.name}
                width={300}
                height={300}
                className="w-full h-48 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-semibold leading-tight line-clamp-2">{p.name}</h3>
            {p.price && <p className="text-green-600 font-medium">{he.decode(p.price).replace(/&nbsp;|&npsb;/g, '').trim()}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}