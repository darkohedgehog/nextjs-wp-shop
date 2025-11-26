'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
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

// util: parsiranje WP/GraphQL RAW cene u broj (fallback)
function parsePrice(raw?: string | null): number {
  if (!raw) return 0;
  const cleaned = he
    .decode(raw)
    .replace(/&nbsp;|\u00A0/g, '')
    .replace(/\s+/g, '')
    .replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function ProductDetailPage() {
  const params = useParams() as Record<string, string | string[] | undefined>;
  const slug = getSlugParam(params, 'slug');

  const { data, loading, error } = useQuery<{ product: Product }>(GET_PRODUCT, {
    variables: { id: slug as string },
    skip: !slug,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const product = data?.product ?? null;
  const galleryNodes = product?.galleryImages?.nodes ?? [];

  // EAN / barcode iz metaData
  const ean =
    product?.metaData?.find((m) =>
      ['_ean', 'ean', '_barcode', 'barcode', 'EAN', 'BARCODE', 'GTIN', 'UPC'].includes(
        m.key.trim()
      )
    )?.value ?? null;

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
  // 👉 STATE za B2B/B2C cenu iz Woo REST-a
  const [priceInfo, setPriceInfo] = useState<{
    effective: number;
    regular: number;
    discountPercent: number;
  } | null>(null);

  const [quantity, setQuantity] = useState<number>(1);

  // kad se promijeni proizvod, resetuj količinu
  useEffect(() => {
    setQuantity(1);
  }, [product?.databaseId]);

  // REST poziv na /api/products/[id] koji vraća wc/v3 product + zvo_* polja
  useEffect(() => {
    if (!product?.databaseId) return;

    (async () => {
      try {
        const res = await fetch(`/api/products/${product.databaseId}`);
        if (!res.ok) {
          console.warn(
            'Ne mogu da dohvatim detalje proizvoda iz Woo:',
            await res.text()
          );
          setPriceInfo(null);
          return;
        }

        type RestProduct = {
          id: number;
          price?: string;
          regular_price?: string;
          zvo_regular_price?: number;
          zvo_effective_price?: number;
          zvo_discount_percent?: number;
        };

        const p: RestProduct = await res.json();

        const regular =
          typeof p.zvo_regular_price === 'number'
            ? p.zvo_regular_price
            : Number(p.regular_price ?? p.price ?? 0);

        const effective =
          typeof p.zvo_effective_price === 'number'
            ? p.zvo_effective_price
            : Number(p.price ?? p.regular_price ?? 0);

        let discountPercent =
          typeof p.zvo_discount_percent === 'number'
            ? p.zvo_discount_percent
            : 0;

        if (!discountPercent && regular > 0 && effective < regular) {
          discountPercent = Math.round(
            ((regular - effective) / regular) * 100
          );
        }

        setPriceInfo({ effective, regular, discountPercent });
      } catch (err) {
        console.warn('Greška pri dohvaćanju B2B/B2C cene:', err);
        setPriceInfo(null);
      }
    })();
  }, [product?.databaseId]);

  // vrednosti za prikaz (fallback GraphQL ako nema REST priceInfo)
  const fallbackEffective = parsePrice(
    product?.price ?? product?.regularPrice ?? undefined
  );
  const fallbackRegular = parsePrice(
    product?.regularPrice ?? product?.price ?? undefined
  );

  const priceNum = priceInfo ? priceInfo.effective : fallbackEffective;
  const regularNum = priceInfo ? priceInfo.regular : fallbackRegular;
  const discountPercent =
    priceInfo?.discountPercent ??
    (regularNum > 0 && priceNum < regularNum
      ? Math.round(((regularNum - priceNum) / regularNum) * 100)
      : 0);

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value)) return;

    let next = value;

    if (!next || next < 1) next = 1;

    if (product?.stockQuantity != null) {
      next = Math.min(next, product.stockQuantity);
    }

    setQuantity(next);
  };

  // --- modal state ---
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

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

  // --- early returns ---
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

  // --- modal komponenta ---
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
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 bg-primary-color text-zinc-300 rounded-full w-8 h-8 flex items-center justify-center font-bold"
            aria-label="Zatvori"
          >
            <PiEyeClosedLight />
          </button>

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

          <div className="flex items-center justify-center">
            <Image
              src={currentImage.sourceUrl}
              alt={currentImage.altText || product.name}
              width={1600}
              height={1600}
              priority
              className="object-contain max-h-[80vh] rounded-lg"
            />
          </div>

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
            onClick={() => openAtIndex(0)}
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
                <span className="font-semibold text-zinc-400">SKU:</span>{' '}
                {product.sku}
              </p>
            )}
            {ean && (
              <p>
                <span className="font-semibold text-zinc-500">EAN:</span> {ean}
              </p>
            )}
          </div>

          {/* CENA + STATUS + POPUST */}
          <div className="flex items-center flex-wrap gap-3 mb-4">
            <div className="flex items-baseline gap-2">
              {regularNum > 0 && priceNum < regularNum && (
                <span className="text-sm line-through text-zinc-500">
                  {regularNum.toFixed(2)} €
                </span>
              )}
              <p className="text-xl text-blue-500">
                {priceNum > 0 ? `${priceNum.toFixed(2)} €` : '—'}
              </p>
              {discountPercent > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/40">
                  -{discountPercent.toFixed(0)}%
                </span>
              )}
            </div>

            {product.stockStatus && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide
                ${
                  isInStock
                    ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40'
                    : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/40'
                }`}
              >
                {isInStock ? 'Na zalihi' : 'Nema na zalihi'}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <div
              className="prose prose-lg mb-8 text-zinc-300"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {/* Gallery */}
          {galleryNodes.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-8">
              {galleryNodes.map((img, idx) => {
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
                    onClick={() => openAtIndex(imageIndex)}
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
              // 👇 ovde sad ide B2B/B2C effective cena iz REST-a
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
                  type="button"
                  className="bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff]"
                >
                  Košarica
                  <span>
                    <TiShoppingCart className="text-[#343a40]" />
                  </span>
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