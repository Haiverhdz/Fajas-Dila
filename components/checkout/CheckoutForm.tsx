"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Script from "next/script";
import { useCartStore, useCartSubtotal } from "@/lib/cart-store";
import { customerSchema } from "@/lib/checkout-schema";
import { SHIPPING_COST } from "@/lib/shipping";
import type { CustomerInfo, PaymentMethod } from "@/types/payment";
import PaymentMethodSelector from "./PaymentMethodSelector";
import WompiButton from "./WompiButton";
import AddiButton from "./AddiButton";
import styles from "./CheckoutForm.module.css";

const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

type WompiTransactionResult = { transaction: { id: string; status: string } };

declare global {
  interface Window {
    WidgetCheckout?: new (config: Record<string, unknown>) => {
      open: (callback: (result: WompiTransactionResult) => void) => void;
    };
  }
}

export default function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartSubtotal();
  const [method, setMethod] = useState<PaymentMethod>("wompi");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [wompiReady, setWompiReady] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CustomerInfo>();

  const cartPayload = items.map((item) => ({
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
  }));

  async function onSubmit(data: CustomerInfo) {
    const result = customerSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        setError(issue.path[0] as keyof CustomerInfo, { message: issue.message });
      });
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      if (method === "wompi") {
        await startWompi(result.data);
      } else {
        await startAddi(result.data);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function startWompi(customer: CustomerInfo) {
    if (!WOMPI_PUBLIC_KEY) {
      throw new Error("Wompi no está configurado. Agrega NEXT_PUBLIC_WOMPI_PUBLIC_KEY en .env.local.");
    }
    if (!wompiReady || !window.WidgetCheckout) {
      throw new Error("El widget de Wompi todavía se está cargando, intenta de nuevo en unos segundos.");
    }

    const response = await fetch("/api/wompi/create-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items: cartPayload }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "No se pudo iniciar el pago con Wompi.");

    const checkout = new window.WidgetCheckout({
      currency: payload.currency,
      amountInCents: payload.amountInCents,
      reference: payload.reference,
      publicKey: payload.publicKey,
      signature: { integrity: payload.signature },
      redirectUrl: payload.redirectUrl,
      customerData: payload.customerData,
      shippingAddress: payload.shippingAddress,
    });

    checkout.open((result) => {
      const status = result.transaction.status;
      const ref = payload.reference as string;
      if (status === "APPROVED") {
        clearCart();
        router.push(`/pago/exito?ref=${ref}`);
      } else if (status === "DECLINED" || status === "ERROR") {
        router.push(`/pago/error?ref=${ref}`);
      } else {
        clearCart();
        router.push(`/pago/pendiente?ref=${ref}`);
      }
    });
  }

  async function startAddi(customer: CustomerInfo) {
    const response = await fetch("/api/addi/create-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items: cartPayload }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "No se pudo iniciar el proceso con Addi.");
    window.location.assign(payload.redirectUrl);
  }

  return (
    <>
      {WOMPI_PUBLIC_KEY && (
        <Script
          src="https://checkout.wompi.co/widget.js"
          strategy="afterInteractive"
          onLoad={() => setWompiReady(true)}
        />
      )}
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className={styles.sectionTitle}>Tus datos</p>

        <div className={styles.field}>
          <label htmlFor="fullName">Nombre completo</label>
          <input id="fullName" autoComplete="name" {...register("fullName")} />
          {errors.fullName && <span className={styles.errorMsg}>{errors.fullName.message}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="documentId">Cédula</label>
            <input id="documentId" autoComplete="off" inputMode="numeric" {...register("documentId")} />
            {errors.documentId && <span className={styles.errorMsg}>{errors.documentId.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">Celular</label>
            <input id="phone" autoComplete="tel" inputMode="numeric" placeholder="3001234567" {...register("phone")} />
            {errors.phone && <span className={styles.errorMsg}>{errors.phone.message}</span>}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="address">Dirección</label>
          <input id="address" autoComplete="street-address" {...register("address")} />
          {errors.address && <span className={styles.errorMsg}>{errors.address.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="city">Ciudad</label>
          <input id="city" autoComplete="address-level2" {...register("city")} />
          {errors.city && <span className={styles.errorMsg}>{errors.city.message}</span>}
        </div>

        <p className={styles.sectionTitle}>Método de pago</p>
        <PaymentMethodSelector selected={method} onChange={setMethod} amount={subtotal + SHIPPING_COST} />

        {formError && <p className={styles.formError}>{formError}</p>}

        {method === "wompi" ? (
          <WompiButton loading={loading} disabled={items.length === 0} />
        ) : (
          <AddiButton loading={loading} disabled={items.length === 0} />
        )}
      </form>
    </>
  );
}
