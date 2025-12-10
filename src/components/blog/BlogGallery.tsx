'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { PiEyeClosedLight } from "react-icons/pi";
import { HiArrowNarrowRight, HiArrowLeft } from "react-icons/hi";

export type BlogGalleryImage = {
  sourceUrl: string;
  altText?: string | null;
};

type BlogGalleryProps = {
  images: BlogGalleryImage[];
  title: string;
};

// --- Modal kao zaseban komponent (van rendera) ---

type ImageModalProps = {
  isOpen: boolean;
  hasImages: boolean;
  images: BlogGalleryImage[];
  currentIndex: number;
  title: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function ImageModal({
  isOpen,
  hasImages,
  images,
  currentIndex,
  title,
  onClose,
  onPrev,
  onNext,
}: ImageModalProps) {
  if (!isOpen || !hasImages) return null;

  const currentImage = images[currentIndex] ?? images[0];

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-100 shadow-lg"
          aria-label="Zatvori"
        >
          <PiEyeClosedLight />
        </button>

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white text-2xl"
            aria-label="Prethodna slika"
          >
            <HiArrowLeft />
          </button>
        )}

        <div className="flex items-center justify-center">
          <Image
            src={currentImage.sourceUrl}
            alt={currentImage.altText || title}
            width={1600}
            height={1600}
            priority
            className="max-h-[80vh] rounded-lg object-contain"
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white text-2xl"
            aria-label="Sledeća slika"
          >
            <HiArrowNarrowRight />
          </button>
        )}
      </div>
    </div>
  );
}

// --- Glavna komponenta ---

export default function BlogGallery({ images, title }: BlogGalleryProps) {
  const hasImages = images.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (!hasImages) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowRight") {
        if (!isOpen) return;
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        if (!isOpen) return;
        setCurrentIndex(
          (prev) => (prev - 1 + images.length) % images.length
        );
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, hasImages, images.length]);

  const openAtIndex = (index: number) => {
    if (!hasImages) return;
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const showNext = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const showPrev = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!hasImages) return null;

  const mainImage = images[0];
  const thumbs = images.slice(1);

  return (
    <>
      <ImageModal
        isOpen={isOpen}
        hasImages={hasImages}
        images={images}
        currentIndex={currentIndex}
        title={title}
        onClose={() => setIsOpen(false)}
        onPrev={showPrev}
        onNext={showNext}
      />

      <div className="mb-8">
        {/* glavna slika */}
        <div className="relative mb-8 cursor-pointer overflow-hidden rounded-3xl border border-[#adb5bd] bg-[#f8f9fa] shadow-lg shadow-[#adb5bd]">
          <div className="relative aspect-video w-full">
            <Image
              src={mainImage.sourceUrl}
              alt={mainImage.altText || title}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              priority
              className="object-cover transition duration-500 hover:scale-[1.03]"
              onClick={() => openAtIndex(0)}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />
        </div>

        {/* thumbnails */}
        {thumbs.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
            {thumbs.map((img, idx) => (
              <button
                key={`${img.sourceUrl}-${idx}`}
                type="button"
                className="relative h-32 md:h-48 lg:h-48 overflow-hidden rounded-2xl border border-[#adb5bd] bg-[#f8f9fa] transition hover:border-cyan-400/60 object-cover"
                onClick={() => openAtIndex(idx + 1)}
              >
                <Image
                  src={img.sourceUrl}
                  alt={img.altText || title}
                  fill
                  priority
                  sizes="120px"
                  className="object-cover w-full h-56"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}