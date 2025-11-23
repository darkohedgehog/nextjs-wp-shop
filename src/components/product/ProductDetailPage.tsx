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
import { TbShoppingCartMinus, TbShoppingCartPlus } from 'react-icons/tb';
import { TiShoppingCart } from 'react-icons/ti';
import BackButton from '../ui/BackButton';

// --- Tipovi ---
type GalleryImage = {
  sourceUrl: string;
  altText?: string | null;
};

type ProductMeta = {
  key: string;
  value: string;
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

  // Novo:
  sku?: string | null;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER' | string;
  stockQuantity?: number | null;
  metaData?: ProductMeta[];
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
        sku
        stockStatus
        stockQuantity

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

        metaData {
          key
          value
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

  // EAN / barcode iz metaData – prilagodi ključeve ako tvoj plugin koristi druge
const ean =
product?.metaData?.find((m) =>
  ['_ean', 'ean', '_barcode', 'barcode', 'EAN', 'BARCODE', 'GTIN', 'UPC'].includes(
    m.key.trim()
  )
)?.value ?? null;

// Da li je proizvod na zalihi
const isInStock = product?.stockStatus === 'IN_STOCK';

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

  const [quantity, setQuantity] = useState<number>(1);

useEffect(() => {
  // kad se promijeni proizvod, resetuj količinu
  setQuantity(1);
}, [product?.databaseId]);

const handleQuantityChange = (value: number) => {
  if (Number.isNaN(value)) return;

  let next = value;

  if (!next || next < 1) next = 1;

  // ako imaš info o stockQuantity, limitiraj
  if (product?.stockQuantity != null) {
    next = Math.min(next, product.stockQuantity);
  }

  setQuantity(next);
};

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
        <h1 className="text-2xl font-bold text-zinc-300 mb-2">
         {product.name}
        </h1>
        {/* SKU + EAN */}
         <div className="text-sm text-zinc-400 space-y-0.5 mb-3">
        {product.sku && (
         <p>
        <span className="font-semibold text-zinc-400">SKU:</span> {product.sku}
          </p>
         )}
         {ean && (
         <p>
           <span className="font-semibold text-zinc-500">EAN:</span> {ean}
         </p>
             )}
        </div>

      {/* Cena + status zalihe */}
     <div className="flex items-center gap-3 mb-4">
          <p className="text-xl text-blue-500">
            {priceNum > 0 ? `${priceNum.toFixed(2)} €` : '—'}
            </p>

          {product.stockStatus && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide
            ${
            isInStock
              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40'
              : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/40'}`}>
              {isInStock ? 'Na zalihi' : 'Nema na zalihi'}
              </span>)}
    </div>
          {product.shortDescription && (
            <div
              className="prose prose-lg mb-8 text-zinc-300"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {/* Gallery slike */}
          {galleryNodes.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-8">
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

      {/* Količina */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-zinc-300">Količina:</span>
        <div className="inline-flex items-center rounded-lg bg-[#f8f9fa] border border-[#adb5bd] shadow-lg shadow-[#adb5bd]">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={!isInStock || quantity <= 1}
            className="px-3 py-2 text-lg text-red-600 disabled:opacity-40"
          >
            <TbShoppingCartMinus />
          </button>
          <input
            type="number"
            min={1}
            max={product.stockQuantity ?? undefined}
            value={quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value, 10))
            }
            disabled={!isInStock}
            className="w-14 bg-transparent text-center text-zinc-700 outline-none px-1 py-2 [appearance:textfield]
                       [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={
              !isInStock ||
              (product?.stockQuantity != null &&
                quantity >= product.stockQuantity)
            }
            className="px-3 py-2 text-lg text-green-400 disabled:opacity-40"
          >
            <TbShoppingCartPlus />
          </button>
        </div>
        {product?.stockQuantity != null && (
          <span className="text-xs text-zinc-300">
            Na zalihi: {product.stockQuantity}
          </span>
        )}
      </div>
          <div className="mt-12 flex items-center gap-4">
            <AddToCartWrapper
              product_id={product.databaseId}
              name={product.name}
              price={priceNum}
              image={product.image?.sourceUrl || ''}
              imageAlt={product.image?.altText || product.name}
              disabled={!isInStock}
              quantity={quantity}
              sku={product.sku || ''}
            />
            <div>
            <Link href="/cart">
              <button
              type='button'
              className='bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff]'>
              Košarica
              <span><TiShoppingCart className='text-[#343a40]' /></span>
              </button>
            </Link>
            </div>
          </div>
        </div>
        <BackButton />
      </div>
    </>
  );
}