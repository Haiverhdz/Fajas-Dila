"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types/cart";
import styles from "./CartItem.module.css";

export default function CartItem({ item }: { item: CartItemType }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className={styles.item}>
      <div className={styles.imageWrap}>
        <Image
          src={item.image}
          alt={item.name}
          width={90}
          height={112}
          className={styles.image}
        />
      </div>

      <div className={styles.details}>
        <div className={styles.topRow}>
          <p className={styles.name}>{item.name}</p>
          <button
            type="button"
            className={styles.removeButton}
            aria-label={`Quitar ${item.name} del carrito`}
            onClick={() => removeItem(item.productId, item.size)}
          >
            <X size={16} />
          </button>
        </div>

        <p className={styles.size}>Talla {item.size}</p>

        <div className={styles.bottomRow}>
          <div className={styles.quantity}>
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() =>
                updateQuantity(item.productId, item.size, item.quantity - 1)
              }
            >
              <Minus size={14} />
            </button>
            <span>{item.quantity}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={() =>
                updateQuantity(item.productId, item.size, item.quantity + 1)
              }
            >
              <Plus size={14} />
            </button>
          </div>
          <p className={styles.price}>{formatCOP(item.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
}
