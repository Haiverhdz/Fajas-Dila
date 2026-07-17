import { Suspense } from "react";
import PaymentStatus from "@/components/checkout/PaymentStatus";

export default function PagoPendientePage() {
  return (
    <Suspense>
      <PaymentStatus variant="pending" />
    </Suspense>
  );
}
