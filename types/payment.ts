export type CustomerInfo = {
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type PaymentMethod = "wompi" | "addi";

// Estado interno normalizado. 'abandoned' y 'error' son estados reales de
// Addi (INTERNAL_ERROR) sin equivalente en Wompi — 'error' es a propósito
// distinto de 'declined': no es que el cliente no haya calificado, es que
// algo falló técnicamente del lado de Addi y probablemente necesita
// seguimiento manual. 'in_process' es al revés, solo lo usa Wompi.
export type OrderStatus = "pending" | "approved" | "declined" | "in_process" | "abandoned" | "error";

// Los 6 valores crudos que Addi manda en el campo `status` del webhook
// (confirmados contra su documentación oficial).
export type AddiRawStatus = "APPROVED" | "PENDING" | "REJECTED" | "ABANDONED" | "DECLINED" | "INTERNAL_ERROR";

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
  addiStatus: AddiRawStatus | null;
  createdAt: Date;
  updatedAt: Date;
};
