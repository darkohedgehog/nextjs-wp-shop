import { client } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import he from 'he';
import FeaturedProductsCarousel from './FeaturedProductsCarousel';

type Product = {
  databaseId: number;
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
};

type ProductsData = {
  products: { nodes: Array<Product | null | undefined> } | null;
};

type Vars = { first?: number };

const GET_FEATURED_PRODUCTS = gql`
  # default vrednost ide samo na ne-obavezne varijable
  query FeaturedProducts($first: Int = 8) {
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

function stripHtml(input?: string | null) {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default async function FeaturedProducts({ count = 8 }: { count?: number }) {
  // ⬇️ Ne forsiramo ApolloQueryResult tip — prepustimo TS-u inference
  const { data } = await client.query<ProductsData, Vars>({
    query: GET_FEATURED_PRODUCTS,
    variables: { first: count },
    // po želji: fetchPolicy: 'cache-first'
  });

  // nodes mogu biti (Product | null | undefined) → očistimo ih type guard-om
  const products = (data?.products?.nodes ?? []).filter(
    (p): p is Product => Boolean(p)
  );

  if (products.length === 0) return null;

  const items = products.map((p) => ({
    key: p.databaseId,
    name: p.name,
    slug: p.slug,
    // ukloni &nbsp; i realni NBSP (U+00A0)
    price: p.price ? he.decode(p.price).replace(/&nbsp;|\u00A0/g, '').trim() : null,
    imageSrc: p.image?.sourceUrl ?? '',
    imageAlt: p.image?.altText ?? p.name,
    blurb: stripHtml(p.shortDescription),
  }));

  return (
    <section>
      <h2 className="secondary-color text-center text-2xl md:text-5xl my-10">
        Izdvojeni proizvodi
      </h2>
      <FeaturedProductsCarousel items={items} />
    </section>
  );
}