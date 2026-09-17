import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrdersByUserId } from "@/lib/order";
import { formatCOP, formatOrderDate, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import StatusBadge from "@/components/orders/StatusBadge";
import SignOutButton from "@/components/auth/SignOutButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default async function CuentaPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await getOrdersByUserId(Number(session.user.id));

  return (
    <div className={`${styles.page} container`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mi cuenta</h1>
        <SignOutButton className={styles.signOutBtn} />
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p>Todavía no tienes pedidos.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.reference}>{order.reference}</span>
                <StatusBadge status={order.status} />
              </div>

              <p className={styles.date}>{formatOrderDate(order.createdAt)}</p>

              <div className={styles.orderMeta}>
                <span>
                  Total: <strong>{formatCOP(order.total)}</strong>
                </span>
                <span>
                  Pago: <strong>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</strong>
                </span>
              </div>

              <div className={styles.itemsList}>
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${index}`} className={styles.itemRow}>
                    <span>
                      {item.name} · Talla {item.size} × {item.quantity}
                    </span>
                    <span>{formatCOP(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
