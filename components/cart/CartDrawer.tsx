"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore, useCartSubtotal } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import CartItem from "./CartItem";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const subtotal = useCartSubtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className={styles.panel}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            aria-label="Carrito de compras"
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Tu carrito</h2>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Cerrar carrito"
                onClick={closeDrawer}
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className={styles.empty}>
                <ShoppingBag size={40} className={styles.emptyIcon} />
                <p>Tu carrito está vacío.</p>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={closeDrawer}
                >
                  Seguir comprando
                </button>
              </div>
            ) : (
              <>
                <div className={styles.list}>
                  {items.map((item) => (
                    <CartItem key={`${item.productId}-${item.size}`} item={item} />
                  ))}
                </div>
                <div className={styles.footer}>
                  <div className={styles.subtotalRow}>
                    <span>Subtotal</span>
                    <span className={styles.subtotalValue}>
                      {formatCOP(subtotal)}
                    </span>
                  </div>
                  <Link
                    href="/carrito"
                    className={`btn-outline ${styles.fullWidthBtn}`}
                    onClick={closeDrawer}
                  >
                    Ver carrito completo
                  </Link>
                  <Link
                    href="/checkout"
                    className={`btn-primary ${styles.fullWidthBtn}`}
                    onClick={closeDrawer}
                  >
                    Ir a pagar
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
