export type PublicWooTerm = {
  id: number;
  name: string;
  slug: string;
};

export type PublicWooImage = {
  src: string;
  thumbnail?: string;
  alt?: string;
  name?: string;
};

export type PublicWooProduct = {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  stock_status?: string;
  purchasable?: boolean;
  categories?: PublicWooTerm[];
  brands?: PublicWooTerm[];
  images: PublicWooImage[];
  zvo_regular_price?: number;
  zvo_effective_price?: number;
  zvo_discount_percent?: number;
};

type SanitizeWooProductOptions = {
  includeCustomerPricing?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function sanitizeTerms(value: unknown): PublicWooTerm[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const terms = value
    .filter(isRecord)
    .map((term) => {
      const id = numberValue(term.id);
      const name = stringValue(term.name);
      const slug = stringValue(term.slug);

      if (id === undefined || !name || !slug) return null;

      return { id, name, slug };
    })
    .filter((term): term is PublicWooTerm => term !== null);

  return terms.length > 0 ? terms : undefined;
}

function sanitizeImages(value: unknown): PublicWooImage[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).flatMap((image) => {
    const src = stringValue(image.src);
    if (!src) return [];

    return [
      {
        src,
        thumbnail: stringValue(image.thumbnail),
        alt: stringValue(image.alt),
        name: stringValue(image.name),
      },
    ];
  });
}

function firstTermList(product: Record<string, unknown>, keys: string[]): PublicWooTerm[] | undefined {
  for (const key of keys) {
    const terms = sanitizeTerms(product[key]);
    if (terms) return terms;
  }

  return undefined;
}

function setIfDefined<K extends keyof PublicWooProduct>(
  target: PublicWooProduct,
  key: K,
  value: PublicWooProduct[K] | undefined,
): void {
  if (value !== undefined) {
    target[key] = value;
  }
}

export function sanitizeWooProduct(
  product: Record<string, unknown>,
  options?: SanitizeWooProductOptions,
): PublicWooProduct;
export function sanitizeWooProduct(
  product: unknown,
  options?: SanitizeWooProductOptions,
): PublicWooProduct | null;
export function sanitizeWooProduct(
  product: unknown,
  options: SanitizeWooProductOptions = {},
): PublicWooProduct | null {
  if (!isRecord(product)) return null;

  const id = numberValue(product.id);
  const name = stringValue(product.name);
  const slug = stringValue(product.slug);

  if (id === undefined || !name || !slug) return null;

  const sanitized: PublicWooProduct = {
    id,
    name,
    slug,
    images: sanitizeImages(product.images),
  };

  setIfDefined(sanitized, "permalink", stringValue(product.permalink));
  setIfDefined(sanitized, "sku", stringValue(product.sku));
  setIfDefined(sanitized, "price", stringValue(product.price));
  setIfDefined(sanitized, "regular_price", stringValue(product.regular_price));
  setIfDefined(sanitized, "sale_price", stringValue(product.sale_price));
  setIfDefined(sanitized, "on_sale", booleanValue(product.on_sale));
  setIfDefined(sanitized, "stock_status", stringValue(product.stock_status));
  setIfDefined(sanitized, "purchasable", booleanValue(product.purchasable));
  setIfDefined(sanitized, "categories", sanitizeTerms(product.categories));
  setIfDefined(sanitized, "brands", firstTermList(product, ["brands", "pwb_brands", "pwb-brand"]));

  if (options.includeCustomerPricing) {
    setIfDefined(sanitized, "zvo_regular_price", numberValue(product.zvo_regular_price));
    setIfDefined(sanitized, "zvo_effective_price", numberValue(product.zvo_effective_price));
    setIfDefined(sanitized, "zvo_discount_percent", numberValue(product.zvo_discount_percent));
  }

  return sanitized;
}

export function sanitizeWooProducts(
  products: unknown,
  options?: SanitizeWooProductOptions,
): PublicWooProduct[] {
  if (!Array.isArray(products)) return [];

  return products.flatMap((product) => {
    const sanitized = sanitizeWooProduct(product, options);
    return sanitized ? [sanitized] : [];
  });
}
