import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByReference } from "@/lib/order";
import { formatCOP, formatOrderDate, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import StatusBadge from "@/components/orders/StatusBadge";
import styles from "./page.module.css";

type PageProps = {
  params: Promise<{ reference: string }>;
};

export const metadata: Metadata = {
  title: "Detalle de pedido | Admin",
};

export default async function AdminPedidoDetallePage({ params }: PageProps) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);

  if (!order) {
    notFound();
  }

  return (
    <div className={`${styles.page} container`}>
      <Link href="/admin/pedidos" className={styles.backLink}>
        ← Volver a pedidos
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{order.reference}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className={styles.card}>
        <p className={styles.cardTitle}>Cliente</p>
        <dl className={styles.grid}>
          <div className={styles.field}>
            <dt>Nombre</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div className={styles.field}>
            <dt>Cédula</dt>
            <dd>{order.customerCedula}</dd>
          </div>
          <div className={styles.field}>
            <dt>Correo</dt>
            <dd>{order.customerEmail}</dd>
          </div>
          <div className={styles.field}>
            <dt>Celular</dt>
            <dd>{order.customerPhone}</dd>
          </div>
          <div className={styles.field}>
            <dt>Dirección</dt>
            <dd>{order.shippingAddress}</dd>
          </div>
          <div className={styles.field}>
            <dt>Ciudad</dt>
            <dd>{order.shippingCity}</dd>
          </div>
          <div className={styles.field}>
            <dt>Usuario</dt>
            <dd>{order.userId ? `#${order.userId}` : "Invitado"}</dd>
          </div>
          <div className={styles.field}>
            <dt>Fecha</dt>
            <dd>{formatOrderDate(order.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.card}>
        <p className={styles.cardTitle}>Pago</p>
        <dl className={styles.grid}>
          <div className={styles.field}>
            <dt>Método</dt>
            <dd>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
          </div>
          {order.addiStatus && (
            <div className={styles.field}>
              <dt>Estado crudo de Addi</dt>
              <dd>{order.addiStatus}</dd>
            </div>
          )}
          <div className={styles.field}>
            <dt>Última actualización</dt>
            <dd>{formatOrderDate(order.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.card}>
        <p className={styles.cardTitle}>Productos</p>
        <div className={styles.itemsList}>
          {order.items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <span>
                {item.name} · Talla {item.size} × {item.quantity}
              </span>
              <span>{formatCOP(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className={styles.totalsRow}>
          <span>Subtotal</span>
          <span>{formatCOP(order.subtotal)}</span>
        </div>
        <div className={styles.totalsRow}>
          <span>Envío</span>
          <span>{formatCOP(order.shippingCost)}</span>
        </div>
        <div className={styles.totalsRowFinal}>
          <span>Total</span>
          <span>{formatCOP(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
