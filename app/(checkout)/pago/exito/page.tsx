import { Suspense } from "react";
import PaymentStatus from "@/components/checkout/PaymentStatus";

export default function PagoExitoPage() {
  return (
    <Suspense>
      <PaymentStatus variant="success" />
    </Suspense>
  );
}
