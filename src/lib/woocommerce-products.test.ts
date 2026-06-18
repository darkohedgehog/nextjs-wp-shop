import assert from "node:assert/strict";
import test from "node:test";

const products = (await import(
  new URL("./woocommerce-products.ts", import.meta.url).href
)) as typeof import("./woocommerce-products");

const { sanitizeWooProduct, sanitizeWooProducts } = products;

const rawProduct = {
  id: 2298,
  name: "Test product",
  slug: "test-product",
  permalink: "https://wp.zivic-elektro.shop/product/test-product/",
  sku: "SKU-1",
  price: "12.00",
  regular_price: "15.00",
  sale_price: "12.00",
  on_sale: true,
  stock_status: "instock",
  purchasable: true,
  short_description: "<p>Short public copy.</p>",
  categories: [
    {
      id: 10,
      name: "Switches",
      slug: "switches",
      extra: "private",
    },
  ],
  brands: [
    {
      id: 7,
      name: "Brand",
      slug: "brand",
      description: "internal",
    },
  ],
  images: [
    {
      id: 1,
      src: "https://wp.zivic-elektro.shop/image.jpg",
      thumbnail: "https://wp.zivic-elektro.shop/image-150x150.jpg",
      alt: "Alt text",
      name: "Image name",
      srcset: "large list of generated sizes",
      sizes: "(max-width: 800px) 100vw, 800px",
    },
  ],
  meta_data: [{ key: "b2bking_regular_product_price_group_1", value: "1" }],
  b2bking_regular_product_price_group_1: "1",
  _links: { self: [{ href: "https://wp.zivic-elektro.shop/wp-json/wc/v3/products/2298" }] },
  zvo_regular_price: 11,
  zvo_effective_price: 9,
  zvo_discount_percent: 18,
  zvo_is_b2b: true,
  zvo_group_id: "3",
};

test("sanitizeWooProduct returns a minimal anonymous public product", () => {
  const sanitized = sanitizeWooProduct(rawProduct);

  assert.deepEqual(sanitized, {
    id: 2298,
    name: "Test product",
    slug: "test-product",
    permalink: "https://wp.zivic-elektro.shop/product/test-product/",
    sku: "SKU-1",
    price: "12.00",
    regular_price: "15.00",
    sale_price: "12.00",
    on_sale: true,
    stock_status: "instock",
    purchasable: true,
    categories: [{ id: 10, name: "Switches", slug: "switches" }],
    brands: [{ id: 7, name: "Brand", slug: "brand" }],
    images: [
      {
        src: "https://wp.zivic-elektro.shop/image.jpg",
        thumbnail: "https://wp.zivic-elektro.shop/image-150x150.jpg",
        alt: "Alt text",
        name: "Image name",
      },
    ],
  });

  assert.equal("meta_data" in sanitized, false);
  assert.equal("_links" in sanitized, false);
  assert.equal("short_description" in sanitized, false);
  assert.equal("b2bking_regular_product_price_group_1" in sanitized, false);
  assert.equal("zvo_regular_price" in sanitized, false);
  assert.equal("zvo_group_id" in sanitized, false);
  assert.equal("srcset" in sanitized.images[0], false);
});

test("sanitizeWooProduct keeps computed pricing only for user-specific responses", () => {
  const sanitized = sanitizeWooProduct(rawProduct, {
    includeCustomerPricing: true,
  });

  assert.equal(sanitized.zvo_regular_price, 11);
  assert.equal(sanitized.zvo_effective_price, 9);
  assert.equal(sanitized.zvo_discount_percent, 18);
  assert.equal("zvo_is_b2b" in sanitized, false);
  assert.equal("zvo_group_id" in sanitized, false);
});

test("sanitizeWooProducts maps arrays and ignores non-object entries", () => {
  assert.deepEqual(sanitizeWooProducts([rawProduct, null, "bad"]), [
    sanitizeWooProduct(rawProduct),
  ]);
});
