import { gql } from "@apollo/client";
import { unstable_cache } from "next/cache";

import { client } from "@/lib/apollo-client";
import { GET_PWB_BRANDS } from "@/queries/brands";

export const SHOP_MENU_REVALIDATE_SECONDS = 300;

export type ShopMenuCategoryChild = {
  id: string;
  name: string;
  slug: string;
};

export type ShopMenuCategory = {
  id: string;
  name: string;
  slug: string;
  children?: { nodes: ShopMenuCategoryChild[] } | null;
};

export type ShopMenuBrand = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

type PwbBrandNode = {
  id: string;
  name?: string | null;
  slug: string;
  count?: number | null;
};

const GET_CATEGORIES_TREE = gql`
  query GetCategoriesTree {
    productCategories(where: { parent: 0 }, first: 100) {
      nodes {
        id
        name
        slug
        children(first: 100) {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`;

function normalizeBrands(nodes: PwbBrandNode[] | undefined): ShopMenuBrand[] {
  const brandMap = (nodes ?? [])
    .filter((brand) => Boolean(brand?.slug))
    .map<ShopMenuBrand>((brand) => ({
      id: brand.id || brand.slug,
      name: ((brand.name ?? "").trim() || brand.slug).trim(),
      slug: brand.slug,
      count: brand.count ?? 0,
    }))
    .filter((brand) => brand.name.length > 0)
    .reduce<Record<string, ShopMenuBrand>>((acc, brand) => {
      const existing = acc[brand.slug];
      if (!existing || brand.count > existing.count) {
        acc[brand.slug] = brand;
      }
      return acc;
    }, {});

  return Object.values(brandMap).sort((a, b) =>
    a.name.localeCompare(b.name, "hr", { sensitivity: "base" })
  );
}

export const getShopMenuData = unstable_cache(
  async () => {
    try {
      // Cached and intentionally sequential to avoid WordPress/PHP upstream bursts and Nginx 502/504s.
      const { data: catData } = await client.query<{
        productCategories: { nodes: ShopMenuCategory[] };
      }>({
        query: GET_CATEGORIES_TREE,
        context: {
          fetchOptions: {
            cache: "force-cache",
            next: { revalidate: SHOP_MENU_REVALIDATE_SECONDS },
          },
        },
      });

      const { data: brandData } = await client.query<{
        pwbBrands: { nodes: PwbBrandNode[] };
      }>({
        query: GET_PWB_BRANDS,
        context: {
          fetchOptions: {
            cache: "force-cache",
            next: { revalidate: SHOP_MENU_REVALIDATE_SECONDS },
          },
        },
      });

      return {
        categories: catData?.productCategories?.nodes ?? [],
        brands: normalizeBrands(brandData?.pwbBrands?.nodes),
      };
    } catch (error) {
      console.error("Shop menu data fetch failed:", error);
      return { categories: [], brands: [] };
    }
  },
  ["shop-menu-data"],
  { revalidate: SHOP_MENU_REVALIDATE_SECONDS }
);
