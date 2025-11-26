// src/types/order.ts

export type Address = {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  
  export type LineItem = {
    product_id: number;
    quantity: number;
  };
  
  export type ShippingLine = {
    method_id: string;
    method_title: string;
    total: string;
  };
  
  export type CreateOrderRequest = {
    customer_id?: number;
    billing: Address;
    shipping: Address;
    payment_method: string;
    payment_method_title: string;
    line_items: LineItem[];
    customer_note?: string | null;
    shipping_lines: ShippingLine[];
  };