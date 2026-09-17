export type CustomerInfo = {
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type PaymentMethod = "wompi" | "addi";

export type OrderStatus = "pending" | "approved" | "declined" | "in_process";

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

// Un pedido tal como está guardado en la tabla `orders`.
export type OrderRecord = {
  id: number;
  reference: string;
  userId: number | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerCedula: string;
  shippingAddress: string;
  shippingCity: string;
  items: OrderPricingItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};
