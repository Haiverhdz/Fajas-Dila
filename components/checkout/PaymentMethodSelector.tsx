"use client";

import { CreditCard, Clock } from "lucide-react";
import type { PaymentMethod } from "@/types/payment";
import styles from "./PaymentMethodSelector.module.css";

const WOMPI_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY);

export default function PaymentMethodSelector({
  selected,
  onChange,
}: {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <div className={styles.selector} role="radiogroup" aria-label="Método de pago">
      <button
        type="button"
        role="radio"
        aria-checked={selected === "wompi"}
        className={`${styles.option} ${selected === "wompi" ? styles.optionActive : ""}`}
        onClick={() => onChange("wompi")}
      >
        <CreditCard size={20} strokeWidth={1.75} />
        <span className={styles.optionText}>
          <strong>Pagar con Wompi</strong>
          <small>Tarjeta, PSE, Nequi, Bancolombia</small>
        </span>
        {!WOMPI_CONFIGURED && <em className={styles.badge}>No configurado</em>}
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={selected === "addi"}
        className={`${styles.option} ${selected === "addi" ? styles.optionActive : ""}`}
        onClick={() => onChange("addi")}
      >
        <Clock size={20} strokeWidth={1.75} />
        <span className={styles.optionText}>
          <strong>Pagar en cuotas con Addi</strong>
          <small>Sin tarjeta de crédito</small>
        </span>
      </button>
    </div>
  );
}
