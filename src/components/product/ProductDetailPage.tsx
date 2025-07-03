'use client';

import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
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
  databaseId: string | number;
  id: string;
  name: string;
  slug: string;
  price?: string;
  regularPrice?: string;
  shortDescription?: string;
  image?: { sourceUrl: string; altText?: string | null };
  galleryImages?: { nodes: GalleryImage[] };
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

export default function ProductDetailPage() {
  const params = useParams() as { slug: string };
  const slug = params?.slug;

  const { data, loading, error } = useQuery<{ product: Product }>(GET_PRODUCT, {
    variables: { id: slug },
    skip: !slug,
  });

  if (loading) return <div className="p-4">Učitavanje proizvoda...</div>;
  if (error || !data?.product) return <div className="p-4 text-red-600">Proizvod nije pronađen.</div>;

  const product = data.product;
  const galleryNodes = product.galleryImages?.nodes ?? [];
  const priceStr = product.price ?? product.regularPrice;
  const priceNum = typeof priceStr === 'string' ? parseFloat(he.decode(priceStr)) : 0;

  return (
    <div className="p-4 max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      {product.image?.sourceUrl && (
        <Image
          width={500}
          height={500}
          src={product.image.sourceUrl}
          alt={product.image.altText || product.name}
          className="w-full h-auto object-cover rounded"
          priority 
        />
      )}

      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-xl text-green-600 mb-4">{priceNum.toFixed(2)} €</p>

        {product.shortDescription && (
          <div
            className="prose prose-lg mb-6"
            dangerouslySetInnerHTML={{ __html: product.shortDescription }}
          />
        )}

        {galleryNodes.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {galleryNodes.map((img, idx) => (
              <Image
                width={200}
                height={200}
                key={idx}
                src={img.sourceUrl}
                alt={img.altText || product.name}
                className="w-40 h-40 object-cover rounded"
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center space-x-4">
          <AddToCartWrapper
            product_id={parseInt(String(product.databaseId))}
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