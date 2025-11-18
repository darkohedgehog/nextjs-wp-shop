import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import { unstable_cache } from 'next/cache';
import { ProductCard } from '@/components/product/ProductCard';

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
      context: {
        fetchOptions: {
          next: { revalidate: 300 }, // ⏱️ revalidiraj na 5 min
          cache: 'force-cache',
        },
      },
    });

    const categories: Category[] = (data?.productCategories?.nodes ?? []).filter(
      (c): c is Category => Boolean(c),
    );

    return categories;
  },
  ['wp-top-categories'],
  { revalidate: 300 },
);

// Server component (async!)
export default async function CategoriesPage() {
  const categories = await getTopCategories();

  if (!categories.length) {
    return (
      <div className="p-4 max-w-5xl mx-auto text-center text-gray-500">
        Nema kategorija za prikaz.
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 secondary-color">Kategorije proizvoda</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 mt-6 gap-5 max-w-5xl mx-auto">
        {categories.map((cat) => (
          <ProductCard
            key={cat.id}
            href={`/categories/${cat.slug}`}
            name={cat.name}
            imageUrl={cat.image?.sourceUrl ?? null}
            imageAlt={cat.image?.altText || cat.name}
            // ovde nemamo cenu ni brend – ostavljamo ih prazne
            price={undefined}
            brandName={undefined}
          />
        ))}
      </div>
    </div>
  );
}