"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore, useCartSubtotal } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import CartItem from "@/components/cart/CartItem";
import styles from "./page.module.css";

export default function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartSubtotal();

  if (items.length === 0) {
    return (
      <div className={`${styles.page} container`}>
        <div className={styles.empty}>
          <ShoppingBag size={48} className={styles.emptyIcon} />
          <p>Tu carrito está vacío.</p>
          <Link href="/#productos" className="btn-primary">
            Ver el short DILA
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} container`}>
      <h1 className={styles.title}>Tu carrito</h1>

      <div className={styles.grid}>
        <div className={styles.list}>
          {items.map((item) => (
            <CartItem key={`${item.productId}-${item.size}`} item={item} />
          ))}
        </div>

        <div className={styles.summary}>
          <p className={styles.summaryTitle}>Resumen</p>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <div className={styles.summaryTotalRow}>
            <span>Total</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <Link href="/checkout" className={`btn-primary ${styles.checkoutBtn}`}>
            Ir a pagar
          </Link>
          <Link href="/#productos" className={styles.continueLink}>
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
