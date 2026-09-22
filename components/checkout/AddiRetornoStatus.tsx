"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock3, type LucideIcon } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { OrderStatus } from "@/types/payment";
import styles from "./PaymentStatus.module.css";

type Variant = "success" | "error" | "pending";

const STATUS_CONTENT: Record<
  OrderStatus,
  { variant: Variant; icon: LucideIcon; title: string; message: string; clearsCart: boolean }
> = {
  approved: {
    variant: "success",
    icon: CheckCircle2,
    title: "¡Pago aprobado!",
    message: "Addi aprobó tu compra en cuotas. Te escribiremos pronto con los detalles del envío.",
    clearsCart: true,
  },
  rejected: {
    variant: "error",
    icon: XCircle,
    title: "Addi rechazó la solicitud",
    message: "Tu solicitud de crédito con Addi no fue aprobada. Puedes intentar con otro método de pago.",
    clearsCart: false,
  },
  declined: {
    variant: "error",
    icon: XCircle,
    title: "El pago no se pudo procesar",
    message: "Tu pago fue rechazado o cancelado. Puedes intentarlo de nuevo desde el carrito.",
    clearsCart: false,
  },
  abandoned: {
    variant: "pending",
    icon: Clock3,
    title: "Proceso no completado",
    message: "No terminaste el proceso con Addi. Puedes retomarlo desde el carrito cuando quieras.",
    clearsCart: false,
  },
  pending: {
    variant: "pending",
    icon: Clock3,
    title: "Confirmando tu pago",
    message: "Todavía estamos esperando la confirmación de Addi. Te avisaremos por correo o WhatsApp.",
    clearsCart: false,
  },
  in_process: {
    variant: "pending",
    icon: Clock3,
    title: "Confirmando tu pago",
    message: "Todavía estamos esperando la confirmación de Addi. Te avisaremos por correo o WhatsApp.",
    clearsCart: false,
  },
};

export default function AddiRetornoStatus({
  status,
  reference,
}: {
  status: OrderStatus | null;
  reference: string | null;
}) {
  const clearCart = useCartStore((state) => state.clearCart);
  const content = status ? STATUS_CONTENT[status] : null;

  useEffect(() => {
    if (content?.clearsCart) clearCart();
  }, [content?.clearsCart, clearCart]);

  if (!content) {
    return (
      <div className={`${styles.page} container`}>
        <div className={`${styles.card} ${styles.pending}`}>
          <Clock3 size={48} className={styles.icon} strokeWidth={1.5} />
          <h1 className={styles.title}>No encontramos ese pedido</h1>
          <p className={styles.message}>
            Si acabas de pagar, escríbenos con tu referencia y lo confirmamos manualmente.
          </p>
          {reference && <p className={styles.reference}>Referencia: {reference}</p>}
          <div className={styles.actions}>
            <Link href="/" className="btn-primary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { icon: Icon, title, message, variant } = content;

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
          {(status === "rejected" || status === "declined" || status === "abandoned") && (
            <Link href="/carrito" className="btn-outline">
              Volver al carrito
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
