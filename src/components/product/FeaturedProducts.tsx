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

function stripHtml(input?: string | null) {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default async function FeaturedProducts({ count = 8 }: { count?: number }) {
  const { data } = await client.query({
    query: GET_FEATURED_PRODUCTS,
    variables: { first: count },
  });

  const products: Product[] = data?.products?.nodes ?? [];
  if (products.length === 0) return null;

  // Priprema plain-props za klijentsku komponentu (bez funkcija/Date/Map itd.)
  const items = products.map((p) => ({
    key: p.databaseId,                                   // stabilan key
    name: p.name,
    slug: p.slug,
    price: p.price ? he.decode(p.price).replace(/&nbsp;|&npsb;/g, '').trim() : null,
    imageSrc: p.image?.sourceUrl ?? '',
    imageAlt: p.image?.altText ?? p.name,
    blurb: stripHtml(p.shortDescription),
  }));

  return (
    <section>
      <h2 className="secondary-color text-center text-2xl md:text-5xl my-4">
        Izdvojeni proizvodi
      </h2>

      {/* Karusel/slider u klijentu */}
      <FeaturedProductsCarousel items={items} />
    </section>
  );
}