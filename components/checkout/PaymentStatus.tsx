"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock3, type LucideIcon } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import styles from "./PaymentStatus.module.css";

type Variant = "success" | "error" | "pending";

const CONTENT: Record<Variant, { icon: LucideIcon; title: string; message: string; clearsCart: boolean }> = {
  success: {
    icon: CheckCircle2,
    title: "¡Pago aprobado!",
    message: "Tu pedido fue confirmado. Te escribiremos pronto con los detalles del envío.",
    clearsCart: true,
  },
  error: {
    icon: XCircle,
    title: "El pago no se pudo procesar",
    message: "Tu pago fue rechazado o cancelado. Puedes intentarlo de nuevo desde el carrito.",
    clearsCart: false,
  },
  pending: {
    icon: Clock3,
    title: "Pago en proceso",
    message: "Estamos confirmando tu pago. Te avisaremos por correo o WhatsApp en cuanto se confirme.",
    clearsCart: true,
  },
};

export default function PaymentStatus({ variant }: { variant: Variant }) {
  const searchParams = useSearchParams();
  const reference = searchParams.get("ref");
  const clearCart = useCartStore((state) => state.clearCart);
  const { icon: Icon, title, message, clearsCart } = CONTENT[variant];

  useEffect(() => {
    if (clearsCart) clearCart();
  }, [clearsCart, clearCart]);

  return (
    <div className={`${styles.page} container`}>
      <div className={`${styles.card} ${styles[variant]}`}>
        <Icon size={48} className={styles.icon} strokeWidth={1.5} />
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
        {reference && <p className={styles.reference}>Referencia: {reference}</p>}
        <div className={styles.actions}>
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
          {variant === "error" && (
            <Link href="/carrito" className="btn-outline">
              Volver al carrito
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
