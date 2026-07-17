import { randomUUID } from "crypto";
import { products } from "@/lib/products";
import { SHIPPING_COST } from "@/lib/shipping";
import type { OrderItemInput, OrderPricing } from "@/types/payment";

export class OrderValidationError extends Error {}

// Recalcula el pedido en el servidor a partir del catálogo (nunca se
// confía en precios/nombres que pueda enviar el cliente).
export function buildOrderPricing(items: OrderItemInput[]): OrderPricing {
  if (!items.length) {
    throw new OrderValidationError("El carrito está vacío.");
  }

  const resolvedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new OrderValidationError(`Producto no encontrado: ${item.productId}`);
    }
    if (!product.sizes.includes(item.size)) {
      throw new OrderValidationError(`Talla no disponible: ${item.size}`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) {
      throw new OrderValidationError(`Cantidad inválida para ${product.name}`);
    }
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: item.size,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = SHIPPING_COST;

  return {
    reference: generateOrderReference(),
    items: resolvedItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
    currency: "COP",
  };
}

function generateOrderReference(): string {
  const random = randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  return `DILA-${Date.now()}-${random}`;
}
