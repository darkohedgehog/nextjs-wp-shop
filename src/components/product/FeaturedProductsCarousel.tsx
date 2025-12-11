'use client';

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type FeaturedItem = {
  key: string | number;   // koristi stabilan ključ, npr. databaseId
  name: string;
  slug: string;
  price?: string | null;
  imageSrc?: string;
  imageAlt?: string;
  blurb?: string;
};

function hashToInt(input: string | number) {
  const s = String(input);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function rotationFor(key: string | number, index: number) {
  // stabilan opseg [-10, 10]
  const n = (hashToInt(key) + index) % 21;
  return n - 10;
}

export default function FeaturedProductsCarousel({
  items,
  autoplay = true,
}: {
  items: FeaturedItem[];
  autoplay?: boolean;
}) {
  const [active, setActive] = useState(0);

  const handleNext = () => setActive((p) => (p + 1) % items.length);
  const handlePrev = () => setActive((p) => (p - 1 + items.length) % items.length);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(handleNext, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, items.length]);

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-sm px-4 py-10 md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Leva kolona (slike) */}
        <div>
          <div className="relative h-80 w-full">
            {/* initial={false} da SSR/CSR startuju iz istog stanja */}
            <AnimatePresence initial={false}>
              {items.map((it, index) => {
                const rot = rotationFor(it.key, index);
                const isActive = index === active;
                return (
                  <motion.div
                    key={it.key}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0.7,
                      scale: isActive ? 1 : 0.95,
                      z: isActive ? 0 : -100,
                      rotate: isActive ? 0 : rot,
                      zIndex: isActive ? 40 : items.length + 2 - index,
                      y: isActive ? [0, -60, 0] : 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      z: 100,
                      rotate: rot,
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom"
                  >
                    {it.imageSrc && (
                      <Link href={`/products/${it.slug}`} className="block h-full w-full">
                        <Image
                          src={it.imageSrc}
                          alt={it.imageAlt || it.name}
                          width={800}
                          height={600}
                          draggable={false}
                          priority
                          className="h-full w-full rounded-3xl object-cover object-center"
                        />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Desna kolona (tekst) */}
        <div className="flex flex-col justify-between py-2">
          <motion.div
            key={items[active].key}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Link href={`/products/${items[active].slug}`}>
              <h3 className="text-2xl font-bold hover:underline secondary-color">
                {items[active].name}
              </h3>
            </Link>
            {items[active].price && (
              <p className="mt-1 text-neutral-300 font-semibold">{items[active].price}</p>
            )}
            {items[active].blurb && (
              <p className="mt-6 text-lg paragraph-color line-clamp-6">
                {items[active].blurb}
              </p>
            )}
          </motion.div>

          <div className="flex gap-4 pt-10 md:pt-0">
            <button
              onClick={handlePrev}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-secondary-color"
            >
              <IconArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover/button:rotate-12" />
            </button>
            <button
              onClick={handleNext}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-secondary-color"
            >
              <IconArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/button:-rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}