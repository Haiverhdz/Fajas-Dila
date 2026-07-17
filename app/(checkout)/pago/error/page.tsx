import { Suspense } from "react";
import PaymentStatus from "@/components/checkout/PaymentStatus";

export default function PagoErrorPage() {
  return (
    <Suspense>
      <PaymentStatus variant="error" />
    </Suspense>
  );
}
