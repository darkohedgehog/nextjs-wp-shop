// src/app/(shop)/products/page.tsx
import type { Metadata } from "next";
import ShopShell from "@/components/shop/ShopShell";
import ProductListPage from "@/components/product/ProductListPage";
import { buildMetadata } from "@/utils/seo";
import { siteMetaData } from "@/utils/siteMetaData";

type SearchParams = Record<string, string | string[] | undefined>;

function getString(sp: SearchParams | undefined, key: string): string {
  if (!sp) return "";
  const v = sp[key];
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) return (v[0] ?? "").trim();
  return "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const resolved = await searchParams;

  const q = getString(resolved, "q");
  const baseTitle = siteMetaData.pages.products.title;
  const title = q ? `Pretraga: ${q}` : baseTitle;

  // opinionated: canonical uvek /products (ne indexiraj filter varijacije)
  return buildMetadata({
    title,
    description: siteMetaData.pages.products.description,
    path: "/products",
    ogImage: siteMetaData.pages.products.banner,
    noIndex: Boolean(q), // pretrage obično noindex (po želji)
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;

  return (
    <ShopShell searchParams={resolved}>
      <ProductListPage searchParams={resolved} />
    </ShopShell>
  );
}