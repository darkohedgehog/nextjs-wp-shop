export type WcProduct = {
    id: number;
    name: string;
    slug: string;
    sku?: string | null;
  
    regular_price?: string;
    price?: string;
  
    // Polja iz WP plugin-a
    zvo_regular_price?: number;
    zvo_effective_price?: number;
    zvo_discount_amount?: number;
    zvo_discount_percent?: number;
  
    images?: {
      id: number;
      src: string;
      alt?: string;
    }[];
  };
  // src/types/products.ts

export type Brand = { name?: string | null; slug?: string | null };

export type Media = { sourceUrl: string; altText?: string | null };

export type Product = {
  databaseId?: number; // ✅ bez null (normalizujemo na serveru)
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  date?: string | null;
  price?: string | null;
  image?: Media | null;
  terms?: { nodes?: Array<Brand | null> | null } | null;

  // client-only (B2B map), ostaje optional
  effectivePrice?: number;
  regularPrice?: number;
  discountPercent?: number;
};

export type PageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
};