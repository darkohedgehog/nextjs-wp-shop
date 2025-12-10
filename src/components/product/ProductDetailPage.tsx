'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import he from 'he';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartWrapper from '@/components/cart/AddToCartWrapper';
import { PiEyeClosedLight } from 'react-icons/pi';
import { HiArrowNarrowRight, HiArrowLeft } from 'react-icons/hi';
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
type Brand = {
  name: string;
  slug: string;
};

type CategoryNode = {
  databaseId: number;
  name: string;
  slug: string;
  parent?: {
    node: {
      databaseId: number;
      name: string;
      slug: string;
    } | null;
  } | null;
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
  ean?: string | null;
  globalUniqueId?: string | null;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER' | string;
  stockQuantity?: number | null;
  metaData?: ProductMeta[];
  productCategories?: { nodes: CategoryNode[] } | null;
  pwbBrands?: { nodes: Brand[] } | null;
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
      globalUniqueId

      # 👇 KATEGORIJE
      productCategories(first: 10) {
        nodes {
          databaseId
          name
          slug
          parent {
            node {
              databaseId
              name
              slug
            }
          }
        }
      }

      # 👇 BRAND (iz Perfect WooCommerce Brands plugina)
      pwbBrands(first: 5) {
        nodes {
          name
          slug
        }
      }

      ... on SimpleProduct {
        sku
        ean
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

// --- ImageModal kao poseban komponent izvan rendera ---
type ImageModalProps = {
  isOpen: boolean;
  hasImages: boolean;
  allImages: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  productName: string;
};

function ImageModal({
  isOpen,
  hasImages,
  allImages,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  productName,
}: ImageModalProps) {
  if (!isOpen || !hasImages) return null;

  const currentImage = allImages[currentIndex] ?? allImages[0];

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-zinc-900/80 border border-zinc-700 text-zinc-200 rounded-full w-8 h-8 flex items-center justify-center shadow-lg shadow-black/40"
          aria-label="Zatvori"
        >
          <PiEyeClosedLight />
        </button>

        {allImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-lg shadow-black/50"
            aria-label="Prethodna slika"
          >
            <HiArrowLeft />
          </button>
        )}

        <div className="flex items-center justify-center">
          <Image
            src={currentImage.sourceUrl}
            alt={currentImage.altText || productName}
            width={1600}
            height={1600}
            priority
            className="object-contain max-h-[80vh] rounded-2xl border border-zinc-800/80 bg-zinc-900/60"
          />
        </div>

        {allImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-lg shadow-black/50"
            aria-label="Sledeća slika"
          >
            <HiArrowNarrowRight />
          </button>
        )}
      </div>
    </div>
  );
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

  // --- brand & kategorije ---
  const brand = product?.pwbBrands?.nodes?.[0] ?? null;
  const categories = product?.productCategories?.nodes ?? [];

  const primaryCategory = categories[0] ?? null;
  const parentCategory = primaryCategory?.parent?.node ?? null;

  const mainCategory = parentCategory ?? primaryCategory;
  const subCategory =
    parentCategory &&
    primaryCategory &&
    parentCategory.databaseId !== primaryCategory.databaseId
      ? primaryCategory
      : null;

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

  // (uklonjen useEffect koji je radio setQuantity(1) na promenu productId)

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

  return (
    <>
      <ImageModal
        isOpen={isOpen}
        hasImages={hasImages}
        allImages={allImages}
        currentIndex={currentIndex}
        onClose={() => setIsOpen(false)}
        onPrev={showPrev}
        onNext={showNext}
        productName={product.name}
      />

      <div className="max-w-5xl mx-auto px-4 pb-16 pt-8 space-y-8">
        {/* Top bar + back */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400/70">
              Detalji proizvoda
            </span>
            <span className="text-xs text-zinc-500">
              Web shop · Živić elektro materijal
            </span>
          </div>
          <BackButton />
        </div>

        {/* Glavni card */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl shadow-[0_0_60px_rgba(56,189,248,0.18)] shadow-cyan-500/30 px-4 py-6 md:px-8 md:py-8">
          <div className="grid gap-8 md:grid-cols-2 items-start">
            {/* Slika + mini galerija */}
            <div className="space-y-4">
              {product.image?.sourceUrl && (
                <div
                  className="relative mx-auto flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-linear-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 p-px cursor-pointer group"
                  onClick={() => openAtIndex(0)}
                >
                  <div className="relative w-full rounded-2xl bg-zinc-950/90 p-4 group-hover:bg-zinc-900/90 transition-colors duration-300">
                    <Image
                      width={600}
                      height={600}
                      src={product.image.sourceUrl}
                      alt={product.image.altText || product.name}
                      className="w-full h-auto max-h-80 object-contain mx-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.35)]"
                      priority
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cyan-500/20 group-hover:ring-cyan-300/50 transition-all duration-300" />
                  </div>
                </div>
              )}

              {/* Gallery thumbs */}
              {galleryNodes.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryNodes.map((img, idx) => {
                    const baseIndex = mainImage ? 1 : 0;
                    const imageIndex = baseIndex + idx;

                    return (
                      <button
                        key={`${img.sourceUrl}-${idx}`}
                        type="button"
                        onClick={() => openAtIndex(imageIndex)}
                        className="relative rounded-xl border border-zinc-800/80 bg-zinc-900/70 hover:border-cyan-400/60 hover:bg-zinc-900/90 transition-colors duration-200 overflow-hidden"
                      >
                        <Image
                          width={200}
                          height={200}
                          src={img.sourceUrl}
                          alt={img.altText || product.name}
                          priority
                          className="w-full h-24 object-contain p-2"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desna strana – info + cena + CTA */}
            <div className="space-y-6">
              {/* Naziv + meta */}
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50 leading-tight">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                  {product.sku && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700/70 bg-zinc-900/70 px-2.5 py-1 text-zinc-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      SKU: {product.sku}
                    </span>
                  )}

                  {(product.ean || product.globalUniqueId) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-cyan-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      Barcode: {product.ean || product.globalUniqueId}
                    </span>
                  )}

                  {product.stockStatus && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide
                      ${
                        isInStock
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/10 text-red-300 border border-red-500/40'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isInStock ? 'bg-emerald-400' : 'bg-red-400'
                        }`}
                      />
                      {isInStock ? 'Na zalihi' : 'Nema na zalihi'}
                    </span>
                  )}
                </div>
              </div>

              {/* CENA + POPUST */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  {regularNum > 0 && priceNum < regularNum && (
                    <span className="text-sm line-through text-zinc-500">
                      {regularNum.toFixed(2)} €
                    </span>
                  )}
                  <p className="text-2xl font-semibold text-cyan-400">
                    {priceNum > 0 ? `${priceNum.toFixed(2)} €` : '—'}
                  </p>
                  {discountPercent > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/40">
                      Ušteda -{discountPercent.toFixed(0)}%
                    </span>
                  )}
                </div>

                {product?.stockQuantity != null && (
                  <span className="text-xs text-zinc-400">
                    Dostupno na zalihi:{' '}
                    <span className="text-zinc-100 font-medium">
                      {product.stockQuantity}
                    </span>
                  </span>
                )}
              </div>

              {/* Količina + CTA */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-zinc-300">Količina</span>
                  <div className="inline-flex items-center rounded-xl bg-zinc-900/80 border border-zinc-700/80 shadow-[0_0_25px_rgba(15,23,42,0.8)]">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={!isInStock || quantity <= 1}
                      className="px-3 py-2 text-lg text-zinc-300 disabled:opacity-40 hover:text-red-400 transition-colors"
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
                      className="w-14 bg-transparent text-center text-zinc-50 outline-none px-1 py-2 text-sm [appearance:textfield]
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
                      className="px-3 py-2 text-lg text-zinc-300 disabled:opacity-40 hover:text-emerald-400 transition-colors"
                    >
                      <TbShoppingCartPlus />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <AddToCartWrapper
                    product_id={product.databaseId}
                    name={product.name}
                    price={priceNum}
                    image={product.image?.sourceUrl || ''}
                    imageAlt={product.image?.altText || product.name}
                    disabled={!isInStock}
                    quantity={quantity}
                    sku={product.sku || ''}
                    ean={product.ean || product.globalUniqueId || ''}
                  />
                  <Link href="/cart">
                    <button
                      type="button"
                      className="bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700 text-zinc-200 cursor-pointer flex items-center px-4 py-2 rounded-2xl transition shadow-[0_0_25px_rgba(15,23,42,0.8)] gap-2 text-sm"
                    >
                      Košarica
                      <TiShoppingCart className="text-cyan-300" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Opis proizvoda – full width ispod grida */}
          {product.shortDescription && (
            <div className="mt-8 rounded-2xl border border-zinc-600/80 bg-zinc-900/40 p-4 md:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500 mb-3">
                Opis i specifikacije
              </h2>
              <div
                className="prose prose-invert max-w-none prose-p:text-sm prose-p:text-zinc-200 prose-li:text-sm prose-li:text-zinc-200 prose-headings:text-zinc-50 prose-headings:text-base prose-strong:text-zinc-50 prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:text-cyan-100 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-table:text-sm prose-th:border-zinc-700 prose-td:border-zinc-800"
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />

              {(brand || mainCategory) && (
                <div className="mt-5 border-t border-zinc-800/80 pt-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-500 mb-2">
                    Dodatne informacije
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                    {/* brand link */}
                    {brand && (
                      <Link
                        href={`/products?brand=${encodeURIComponent(
                          brand.slug
                        )}`}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-700/70 bg-zinc-900/70 px-2.5 py-1 text-zinc-300 hover:border-cyan-400/70 hover:bg-zinc-900/90 hover:text-cyan-200 transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        Brand:{' '}
                        <span className="text-zinc-100 underline decoration-dotted underline-offset-2">
                          {brand.name}
                        </span>
                      </Link>
                    )}

                    {/* glavna kategorija */}
                    {mainCategory && (
                      <Link
                        href={`/categories/${mainCategory.slug}`}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-700/70 bg-zinc-900/70 px-2.5 py-1 text-zinc-300 hover:border-emerald-400/70 hover:bg-zinc-900/90 hover:text-emerald-200 transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Kategorija:{' '}
                        <span className="text-zinc-100 underline decoration-dotted underline-offset-2">
                          {mainCategory.name}
                        </span>
                      </Link>
                    )}

                    {/* podkategorija */}
                    {subCategory && (
                      <Link
                        href={`/categories/${subCategory.slug}`}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-700/70 bg-zinc-900/70 px-2.5 py-1 text-zinc-300 hover:border-fuchsia-400/70 hover:bg-zinc-900/90 hover:text-fuchsia-200 transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                        Podkategorija:{' '}
                        <span className="text-zinc-100 underline decoration-dotted underline-offset-2">
                          {subCategory.name}
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}