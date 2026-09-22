import type { Metadata } from "next";
import Link from "next/link";
import { getAllOrders } from "@/lib/order";
import { formatCOP, formatOrderDate, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import StatusBadge, { STATUS_LABELS } from "@/components/orders/StatusBadge";
import type { OrderStatus } from "@/types/payment";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pedidos | Admin",
};

const STATUS_FILTERS: { value: OrderStatus | undefined; label: string }[] = [
  { value: undefined, label: "Todos" },
  { value: "pending", label: STATUS_LABELS.pending },
  { value: "approved", label: STATUS_LABELS.approved },
  { value: "declined", label: STATUS_LABELS.declined },
  { value: "abandoned", label: STATUS_LABELS.abandoned },
  { value: "error", label: STATUS_LABELS.error },
  { value: "in_process", label: STATUS_LABELS.in_process },
];

const VALID_STATUSES = new Set<string>([
  "pending",
  "approved",
  "declined",
  "in_process",
  "abandoned",
  "error",
]);

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminPedidosPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const activeStatus = status && VALID_STATUSES.has(status) ? (status as OrderStatus) : undefined;

  const orders = await getAllOrders(activeStatus);

  return (
    <div className={`${styles.page} container`}>
      <h1 className={styles.title}>Pedidos</h1>

      <div className={styles.filters}>
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/admin/pedidos?status=${filter.value}` : "/admin/pedidos"}
            className={`${styles.filterLink} ${activeStatus === filter.value ? styles.filterLinkActive : ""}`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className={styles.tableWrap}>
        {orders.length === 0 ? (
          <p className={styles.empty}>No hay pedidos con este filtro.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/pedidos/${order.reference}`} className={styles.rowLink}>
                      {order.reference}
                    </Link>
                  </td>
                  <td>{formatOrderDate(order.createdAt)}</td>
                  <td>{order.customerName}</td>
                  <td>{formatCOP(order.total)}</td>
                  <td>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
