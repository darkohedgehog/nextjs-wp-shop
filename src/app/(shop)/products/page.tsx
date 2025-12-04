// src/app/(shop)/products/page.tsx

import ShopShell from "@/components/shop/ShopShell";
import ProductListPage from "@/components/product/ProductListPage";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // ⬇️ obavezno: razreši Promise koji Next šalje
  const resolvedSearchParams = await searchParams;

  return (
    <ShopShell searchParams={resolvedSearchParams}>
      <ProductListPage searchParams={resolvedSearchParams} />
    </ShopShell>
  );
}