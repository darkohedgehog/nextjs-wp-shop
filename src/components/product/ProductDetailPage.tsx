'use client';

import { useParams } from 'next/navigation';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react'; // ✅ za Apollo 4.0.7
import he from 'he';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartWrapper from '@/components/cart/AddToCartWrapper';

// --- Tipovi ---
type GalleryImage = {
  sourceUrl: string;
  altText?: string | null;
};

type Product = {
  databaseId: number;
  id: string;
  name: string;
  slug: string;
  price?: string | null;
  regularPrice?: string | null;
  shortDescription?: string | null;
  image?: { sourceUrl: string; altText?: string | null } | null;
  galleryImages?: { nodes: GalleryImage[] } | null;
};

// --- GraphQL ---
const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id, idType: SLUG) {
      databaseId
      id
      name
      slug
      shortDescription
      ... on SimpleProduct {
        price(format: RAW)
        regularPrice(format: RAW)
        image {
          sourceUrl
          altText
        }
        galleryImages {
          nodes {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

// util: bezbedno izvuci string slug iz params
function getSlugParam(params: Record<string, string | string[] | undefined>, key = 'slug'): string | null {
  const raw = params?.[key];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

// util: parsiranje WP/GraphQL RAW cene u broj
function parsePrice(raw?: string | null): number {
  if (!raw) return 0;
  const cleaned = he
    .decode(raw)
    .replace(/&nbsp;|\u00A0/g, '') // HTML NBSP & real NBSP
    .replace(/\s+/g, '')
    .replace(',', '.'); // podrži zarez kao decimalni separator
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function ProductDetailPage() {
  // Next 16 App Router: useParams može vratiti string ili string[]
  const params = useParams() as Record<string, string | string[] | undefined>;
  const slug = getSlugParam(params, 'slug');

  const { data, loading, error } = useQuery<{ product: Product }>(GET_PRODUCT, {
    variables: { id: slug as string },
    skip: !slug, // ne šalji query dok slug nije spreman
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  if (!slug) {
    // npr. pre nego što se klijentski router hidrira
    return <div className="p-4">Učitavanje proizvoda…</div>;
  }

  if (loading && !data?.product) {
    return <div className="p-4">Učitavanje proizvoda…</div>;
  }

  if (error || !data?.product) {
    return <div className="p-4 text-red-600">Proizvod nije pronađen.</div>;
  }

  const product = data.product;
  const galleryNodes = product.galleryImages?.nodes ?? [];
  const priceNum = parsePrice(product.price ?? product.regularPrice);

  return (
    <div className="p-4 max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      {product.image?.sourceUrl && (
        <Image
          width={600}
          height={600}
          src={product.image.sourceUrl}
          alt={product.image.altText || product.name}
          className="w-full h-auto object-cover rounded"
          priority
        />
      )}

      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-xl text-green-600 mb-4">
          {priceNum > 0 ? `${priceNum.toFixed(2)} €` : '—'}
        </p>

        {product.shortDescription && (
          <div
            className="prose prose-lg mb-6"
            dangerouslySetInnerHTML={{ __html: product.shortDescription }}
          />
        )}

        {galleryNodes.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {galleryNodes.map((img, idx) => (
              <Image
                width={200}
                height={200}
                key={`${img.sourceUrl}-${idx}`}
                src={img.sourceUrl}
                alt={img.altText || product.name}
                className="w-40 h-40 object-cover rounded"
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <AddToCartWrapper
            product_id={product.databaseId}
            name={product.name}
            price={priceNum}
            image={product.image?.sourceUrl || ''}
            imageAlt={product.image?.altText || product.name}
          />
          <Link href="/cart" className="text-blue-600 hover:underline">
            Vidi košaricu
          </Link>
        </div>
      </div>
    </div>
  );
}