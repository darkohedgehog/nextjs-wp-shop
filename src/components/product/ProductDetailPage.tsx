'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react'; // ✅ za Apollo 4.0.7
import he from 'he';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartWrapper from '@/components/cart/AddToCartWrapper';
import { PiEyeClosedLight } from "react-icons/pi";
import { HiArrowNarrowRight, HiArrowLeft } from "react-icons/hi";

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
function getSlugParam(
  params: Record<string, string | string[] | undefined>,
  key = 'slug'
): string | null {
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
  // Next App Router: useParams može vratiti string ili string[]
  const params = useParams() as Record<string, string | string[] | undefined>;
  const slug = getSlugParam(params, 'slug');

  const { data, loading, error } = useQuery<{ product: Product }>(GET_PRODUCT, {
    variables: { id: slug as string },
    skip: !slug, // ne šalji query dok slug nije spreman
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  // --- STATE za modal / lightbox ---
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // --- Izvedeni podaci iz query-ja (uvek posle hookova, pre return-a) ---
  const product = data?.product ?? null;
  const galleryNodes = product?.galleryImages?.nodes ?? [];

  const mainImage: GalleryImage | null =
    product?.image?.sourceUrl
      ? {
          sourceUrl: product.image.sourceUrl,
          altText: product.image.altText || product.name,
        }
      : null;

  const allImages: GalleryImage[] = [
    ...(mainImage ? [mainImage] : []),
    ...galleryNodes,
  ];

  const hasImages = allImages.length > 0;

  const priceNum = parsePrice(
    product?.price ?? product?.regularPrice ?? undefined
  );

  // ESC + strelice levo/desno na tastaturi
  useEffect(() => {
    if (!hasImages) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowRight') {
        if (!isOpen) return;
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === 'ArrowLeft') {
        if (!isOpen) return;
        setCurrentIndex(
          (prev) => (prev - 1 + allImages.length) % allImages.length
        );
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, hasImages, allImages.length]);

  // helper da otvori modal na određenom indexu
  const openAtIndex = (index: number) => {
    if (!hasImages) return;
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const showNext = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const showPrev = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // --- Sada tek idu early return-ovi (posle svih hookova!) ---
  if (!slug) {
    return (
      <div className="p-4 flex items-center justify-center paragraph-color">
        Učitavanje proizvoda…
      </div>
    );
  }

  if (loading && !product) {
    return (
      <div className="p-4 flex items-center justify-center paragraph-color">
        Učitavanje proizvoda…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 text-red-600 flex items-center justify-center">
        Proizvod nije pronađen.
      </div>
    );
  }

  // --- Komponenta za modal slika ---
  const ImageModal = () => {
    if (!isOpen || !hasImages) return null;

    const currentImage = allImages[currentIndex] ?? allImages[0];

    return (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="relative max-w-4xl max-h-[90vh] w-full px-4"
          onClick={(e) => e.stopPropagation()} // da klik na sliku ne zatvara modal
        >
          {/* X dugme */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 bg-primary-color text-zinc-300 rounded-full w-8 h-8 flex items-center justify-center font-bold"
            aria-label="Zatvori"
          >
            <PiEyeClosedLight />
          </button>

          {/* Strelica levo */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl"
              aria-label="Prethodna slika"
            >
              <HiArrowLeft />
            </button>
          )}

          {/* Slika */}
          <div className="flex items-center justify-center">
            <Image
              src={currentImage.sourceUrl}
              alt={currentImage.altText || product.name}
              width={1600}
              height={1600}
              className="object-contain max-h-[80vh] rounded-lg"
            />
          </div>

          {/* Strelica desno */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl"
              aria-label="Sledeća slika"
            >
              <HiArrowNarrowRight />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Modal za zoom + strelice */}
      <ImageModal />

      <div className="p-4 max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Glavna slika proizvoda */}
        {product.image?.sourceUrl && (
          <Image
            width={600}
            height={600}
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            className="w-56 h-56 object-cover mb-2 mx-auto rounded-xl shadow-lg shadow-blue-400 cursor-pointer"
            priority
            onClick={() => {
              // featured slika je index 0 u allImages
              openAtIndex(0);
            }}
          />
        )}

        <div>
          <h1 className="text-2xl font-bold mb-4 text-zinc-400">
            {product.name}
          </h1>
          <p className="text-xl text-blue-500 mb-4">
            {priceNum > 0 ? `${priceNum.toFixed(2)} €` : '—'}
          </p>

          {product.shortDescription && (
            <div
              className="prose prose-lg mb-6 text-zinc-300"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {/* Gallery slike */}
          {galleryNodes.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {galleryNodes.map((img, idx) => {
                // ako postoji mainImage, gallery počinje od indexa 1, inače od 0
                const baseIndex = mainImage ? 1 : 0;
                const imageIndex = baseIndex + idx;

                return (
                  <Image
                    width={200}
                    height={200}
                    key={`${img.sourceUrl}-${idx}`}
                    src={img.sourceUrl}
                    alt={img.altText || product.name}
                    priority
                    className="w-44 h-44 object-cover mb-2 mx-auto rounded-xl cursor-pointer"
                    onClick={() => {
                      openAtIndex(imageIndex);
                    }}
                  />
                );
              })}
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
    </>
  );
}