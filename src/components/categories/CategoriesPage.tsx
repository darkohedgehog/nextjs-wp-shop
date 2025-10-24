import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { unstable_cache } from 'next/cache';

// Tipovi
type Category = {
  id: string;
  name: string;
  slug: string;
  image?: {
    sourceUrl: string;
    altText?: string | null;
  } | null;
};

type CategoriesData = {
  productCategories: {
    nodes: Array<Category | null | undefined>;
  } | null;
};

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

// ⬇️ Server-side cache (ISR) za rezultat upita
const getTopCategories = unstable_cache(
  async () => {
    const { data } = await client.query<CategoriesData>({
      query: GET_TOP_CATEGORIES,
      // Ovi fetchOptions idu u underlying fetch → Next vidi revalidate signal
      context: {
        fetchOptions: {
          next: { revalidate: 300 }, // ⏱️ revalidiraj na 5 min (promeni po želji)
          cache: 'force-cache',
        },
      },
    });

    const categories: Category[] = (data?.productCategories?.nodes ?? []).filter(
      (c): c is Category => Boolean(c)
    );

    return categories;
  },
  ['wp-top-categories'], // cache key
  { revalidate: 300 }     // safety net: i wrapper ima isti TTL
);

// Server component (async!)
export default async function CategoriesPage() {
  const categories = await getTopCategories();

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.length === 0 ? (
        <div className="col-span-3 text-center text-gray-500">
          Nema kategorija za prikaz.
        </div>
      ) : (
        categories.map((cat) => (
          <Link
            key={cat.id}
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
        ))
      )}
    </div>
  );
}