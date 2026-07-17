"use client";

import styles from "./PaymentButtons.module.css";

export default function AddiButton({ loading, disabled }: { loading: boolean; disabled?: boolean }) {
  return (
    <button type="submit" className={`btn-primary ${styles.payBtn}`} disabled={disabled || loading}>
      {loading ? "Procesando..." : "Continuar con Addi"}
    </button>
  );
}
