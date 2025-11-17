'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShineBorder } from '@/components/ui/shine-border';

interface ProductCardProps {
  href: string;
  name: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  brandName?: string | null;
  price?: string | null;
  brandLabel?: string; // npr. "Proizvođač" ili "Brend"
}

export function ProductCard({
  href,
  name,
  imageUrl,
  imageAlt,
  brandName,
  price,
  brandLabel = 'Proizvođač',
}: ProductCardProps) {
  return (
    <div className="relative">
      {/* Dekorativni shine border u pozadini */}
      <div className="pointer-events-none absolute inset-0 rounded-xl">
        <ShineBorder
          shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
          duration={14}
          borderWidth={2}
        />
      </div>

      <Link
        href={href}
        className="relative z-10 block p-4 rounded-xl transition"
      >
        {imageUrl && (
          <Image
            width={400}
            height={400}
            src={imageUrl}
            alt={imageAlt || name}
            className="w-48 h-48 object-cover mb-2 mx-auto rounded-xl"
          />
        )}

        <h2 className="text-md font-bold mb-1 mx-1 secondary-color">
          {name}
        </h2>

        {brandName && (
          <p className="text-xs text-zinc-400 mb-1 mx-1">
            {brandLabel}:{' '}
            <span className="text-zinc-200">{brandName}</span>
          </p>
        )}

        {price && (
          <p className="text-sm font-semibold mb-2 mx-1 text-fuchsia-300">
            {price}
          </p>
        )}
      </Link>
    </div>
  );
}