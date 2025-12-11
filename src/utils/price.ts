import { WcProduct } from "@/types/product";

export function getEffectivePrice(product: WcProduct): number {
  if (typeof product.zvo_effective_price === "number") {
    return product.zvo_effective_price;
  }
  return Number(product.price ?? product.regular_price ?? 0);
}

export function getRegularPrice(product: WcProduct): number {
  if (typeof product.zvo_regular_price === "number") {
    return product.zvo_regular_price;
  }
  return Number(product.regular_price ?? product.price ?? 0);
}

export function getDiscountPercent(product: WcProduct): number {
  if (typeof product.zvo_discount_percent === "number") {
    return product.zvo_discount_percent;
  }

  const regular = getRegularPrice(product);
  const effective = getEffectivePrice(product);

  if (!regular || effective >= regular) return 0;

  return Math.round(((regular - effective) / regular) * 100);
}