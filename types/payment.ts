export type CustomerInfo = {
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type PaymentMethod = "wompi" | "addi";

export type OrderItemInput = {
  productId: string;
  size: string;
  quantity: number;
};

export type OrderPricingItem = {
  productId: string;
  slug: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
};

export type OrderPricing = {
  reference: string;
  items: OrderPricingItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: "COP";
};
