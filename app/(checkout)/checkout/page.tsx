"use client";

import Link from "next/link";
import { useCartStore, useCartSubtotal } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import { SHIPPING_COST } from "@/lib/shipping";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartSubtotal();

  if (items.length === 0) {
    return (
      <div className={`${styles.page} container`}>
        <div className={styles.empty}>
          <p>Tu carrito está vacío.</p>
          <Link href="/productos" className="btn-primary">
            Ver el short DILA
          </Link>
        </div>
      </div>
    );
  }

  const total = subtotal + SHIPPING_COST;

  return (
    <div className={`${styles.page} container`}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.grid}>
        <CheckoutForm />

        <div className={styles.summary}>
          <p className={styles.summaryTitle}>Resumen del pedido</p>

          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className={styles.summaryItem}>
                <span>
                  {item.name} · Talla {item.size} × {item.quantity}
                </span>
                <span>{formatCOP(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Envío</span>
            <span>{formatCOP(SHIPPING_COST)}</span>
          </div>
          <div className={styles.summaryTotalRow}>
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </div>

          <Link href="/carrito" className={styles.editCartLink}>
            Editar carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
