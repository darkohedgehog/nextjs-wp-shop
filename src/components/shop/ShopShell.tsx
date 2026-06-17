import type { ReactNode } from "react";
import ProductMenuSSR from "@/components/navigation/ProductMenuSSR";
import ProductMenuDrawer from "@/components/navigation/ProductMenuDrawer";
import { getShopMenuData } from "@/lib/shop-menu-data";

type SearchParams = Record<string, string | string[] | undefined>;

export type ShopShellProps = {
  children: ReactNode;
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function ShopShell({ children, searchParams }: ShopShellProps) {
  // Fetch once server-side and pass to both menus to avoid duplicate SSR + client GraphQL requests.
  const menuData = await getShopMenuData();

  return (
    <div className="max-w-6xl mx-auto px-2 py-6">
      {/* TOP BAR mobile */}
      <div className="mb-4 flex items-center justify-start lg:hidden">
        <ProductMenuDrawer categories={menuData.categories} brands={menuData.brands} />
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex gap-8 h-[calc(100vh-8rem)] overflow-hidden">
        <aside className="w-72 min-w-72 overflow-y-auto pr-2">
          <ProductMenuSSR
            searchParams={searchParams}
            categories={menuData.categories}
            brands={menuData.brands}
          />
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto pr-1">{children}</main>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden">{children}</div>
    </div>
  );
}
