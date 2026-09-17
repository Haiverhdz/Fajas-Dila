import { randomUUID } from "crypto";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { products } from "@/lib/products";
import { SHIPPING_COST } from "@/lib/shipping";
import type {
  CustomerInfo,
  OrderItemInput,
  OrderPricing,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
} from "@/types/payment";

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

// Se llama justo antes de contactar a Wompi/Addi, con status 'pending' —
// así el pedido queda registrado aunque el cliente cierre la ventana antes
// de terminar de pagar. userId es null en checkout de invitado (Fase 4
// Paso 3 lo llena cuando hay sesión).
export async function saveOrder(
  order: OrderPricing,
  customer: CustomerInfo,
  paymentMethod: PaymentMethod,
  userId: number | null
): Promise<void> {
  await pool.query(
    `INSERT INTO orders
      (reference, user_id, customer_email, customer_name, customer_phone, customer_cedula,
       shipping_address, shipping_city, items, subtotal, shipping_cost, total, payment_method, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      order.reference,
      userId,
      customer.email,
      customer.fullName,
      customer.phone,
      customer.documentId,
      customer.address,
      customer.city,
      JSON.stringify(order.items),
      order.subtotal,
      order.shipping,
      order.total,
      paymentMethod,
    ]
  );
}

export async function updateOrderStatus(reference: string, status: OrderStatus): Promise<void> {
  await pool.query(`UPDATE orders SET status = ? WHERE reference = ?`, [status, reference]);
}

export async function getOrdersByUserId(userId: number): Promise<OrderRecord[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, reference, user_id, customer_email, customer_name, customer_phone, customer_cedula,
            shipping_address, shipping_city, items, subtotal, shipping_cost, total, payment_method,
            status, created_at, updated_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(mapOrderRow);
}

export async function getAllOrders(status?: OrderStatus): Promise<OrderRecord[]> {
  const baseQuery = `SELECT id, reference, user_id, customer_email, customer_name, customer_phone, customer_cedula,
            shipping_address, shipping_city, items, subtotal, shipping_cost, total, payment_method,
            status, created_at, updated_at
     FROM orders`;

  const [rows] = status
    ? await pool.query<RowDataPacket[]>(`${baseQuery} WHERE status = ? ORDER BY created_at DESC`, [status])
    : await pool.query<RowDataPacket[]>(`${baseQuery} ORDER BY created_at DESC`);

  return rows.map(mapOrderRow);
}

export async function getOrderByReference(reference: string): Promise<OrderRecord | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, reference, user_id, customer_email, customer_name, customer_phone, customer_cedula,
            shipping_address, shipping_city, items, subtotal, shipping_cost, total, payment_method,
            status, created_at, updated_at
     FROM orders
     WHERE reference = ?
     LIMIT 1`,
    [reference]
  );
  return rows[0] ? mapOrderRow(rows[0]) : null;
}

function mapOrderRow(row: RowDataPacket): OrderRecord {
  return {
    id: row.id,
    reference: row.reference,
    userId: row.user_id,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerCedula: row.customer_cedula,
    shippingAddress: row.shipping_address,
    shippingCity: row.shipping_city,
    items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    total: row.total,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
