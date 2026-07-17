"use client";

import styles from "./PaymentButtons.module.css";

export default function WompiButton({ loading, disabled }: { loading: boolean; disabled?: boolean }) {
  return (
    <button type="submit" className={`btn-primary ${styles.payBtn}`} disabled={disabled || loading}>
      {loading ? "Procesando..." : "Pagar con Wompi"}
    </button>
  );
}
