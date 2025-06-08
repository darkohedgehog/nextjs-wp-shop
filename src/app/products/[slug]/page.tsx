import client from '@/lib/apollo-client';
import AddToCartBtn from '@/components/cart/AddToCart';
import { gql } from '@apollo/client';
import he from 'he';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Server Component for Product Detail
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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

  const { data } = await client.query({
    query: GET_PRODUCT,
    variables: { id: slug },
  });

  const product = data.product;
  if (!product) {
    return notFound();
  }

  // parse price after fetch
  const priceStr = product.price ?? product.regularPrice;
  const priceNum = typeof priceStr === 'string' ? parseFloat(he.decode(priceStr)) : 0;

  return (
    <div className="p-4 max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      {/* Main Image */}
      {product.image?.sourceUrl && (
        <Image
          width={500}
          height={500}
          src={product.image.sourceUrl}
          alt={product.image.altText || product.name}
          className="w-full h-auto object-cover rounded"
        />
      )}

      {/* Details */}
      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-xl text-green-600 mb-4">
          {priceNum.toFixed(2)} €
        </p>

        {product.shortDescription && (
          <div
            className="prose prose-lg mb-6"
            dangerouslySetInnerHTML={{ __html: product.shortDescription }}
          />
        )}

        {/* Gallery */}
        {product.galleryImages?.nodes?.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {product.galleryImages.nodes.map((img: any, idx: number) => (
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

        {/* Add to Cart and Link to Cart */}
        <div className="mt-6 flex items-center space-x-4">
        <AddToCartBtn
           product_id={parseInt(product.databaseId)}
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
