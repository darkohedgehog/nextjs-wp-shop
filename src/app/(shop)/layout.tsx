import type { ReactNode } from 'react';
import ProductMenuSSR from '@/components/navigation/ProductMenuSSR';
import ProductMenuDrawer from '@/components/navigation/ProductMenuDrawer';

type ShopLayoutProps = {
  children: ReactNode;
  params: Record<string, string | string[]>;
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ShopLayout({ children, searchParams }: ShopLayoutProps) {
  return (
    <div className="max-w-6xl mx-auto px-2 py-6">
      {/* 🔹 TOP BAR samo za mobilne – globalni drawer trigger */}
      <div className="mb-4 flex items-center justify-start lg:hidden">
        <ProductMenuDrawer />
      </div>

      {/* Desktop layout: sidebar + content, sa odvojenim scrollovima */}
      <div className="hidden lg:flex gap-8 h-[calc(100vh-8rem)] overflow-hidden">
        {/* LEFT: SSR sidebar, skroluje se nezavisno */}
        <aside className="w-72 min-w-72 overflow-y-auto pr-2">
          <ProductMenuSSR searchParams={searchParams} />
        </aside>

        {/* RIGHT: sadržaj stranice sa svojim scrollom */}
        <main className="flex-1 min-w-0 overflow-y-auto pr-1">
          {children}
        </main>
      </div>

      {/* Mobile content: bez fiksne visine, normalan scroll (drawer je fixed overlay) */}
      <div className="lg:hidden">
        {children}
      </div>
    </div>
  );
}