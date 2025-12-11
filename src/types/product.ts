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