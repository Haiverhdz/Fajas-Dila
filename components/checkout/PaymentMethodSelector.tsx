"use client";

import { useEffect, useState } from "react";
import { CreditCard, Clock } from "lucide-react";
import type { PaymentMethod } from "@/types/payment";
import { formatCOP } from "@/lib/utils";
import styles from "./PaymentMethodSelector.module.css";

const WOMPI_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY);

type AddiConfig = {
  minAmount: number;
  maxAmount: number;
  discount: number;
  isActiveAlly: boolean;
  isActivePayNow: boolean;
};

export default function PaymentMethodSelector({
  selected,
  onChange,
  amount,
}: {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  amount: number;
}) {
  const [addiConfig, setAddiConfig] = useState<AddiConfig | null>(null);

  useEffect(() => {
    if (!amount || amount <= 0) return;
    let cancelled = false;

    fetch(`/api/addi/config?amount=${Math.round(amount)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AddiConfig | null) => {
        if (!cancelled) setAddiConfig(data);
      })
      .catch(() => {
        if (!cancelled) setAddiConfig(null);
      });

    return () => {
      cancelled = true;
    };
  }, [amount]);

  const addiOutOfRange =
    addiConfig !== null &&
    (!addiConfig.isActiveAlly || amount < addiConfig.minAmount || amount > addiConfig.maxAmount);

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
        disabled={addiOutOfRange}
      >
        <Clock size={20} strokeWidth={1.75} />
        <span className={styles.optionText}>
          <strong>Pagar en cuotas con Addi</strong>
          {addiOutOfRange ? (
            <small>
              Addi aplica para compras entre {formatCOP(addiConfig!.minAmount)} y{" "}
              {formatCOP(addiConfig!.maxAmount)}.
            </small>
          ) : (
            <small>Sin tarjeta de crédito</small>
          )}
        </span>
        {/* El descuento es solo informativo — nunca se resta del monto real enviado a Addi. */}
        {!addiOutOfRange && addiConfig && addiConfig.discount > 0 && (
          <em className={styles.discountBadge}>{Math.round(addiConfig.discount * 100)}% dcto. con Addi</em>
        )}
      </button>
    </div>
  );
}
