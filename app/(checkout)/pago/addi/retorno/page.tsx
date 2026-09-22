import type { Metadata } from "next";
import { getOrderByReference } from "@/lib/order";
import AddiRetornoStatus from "@/components/checkout/AddiRetornoStatus";

export const metadata: Metadata = {
  title: "Resultado de tu pago con Addi",
};

type PageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function AddiRetornoPage({ searchParams }: PageProps) {
  const { ref } = await searchParams;
  const order = ref ? await getOrderByReference(ref) : null;

  return <AddiRetornoStatus status={order?.status ?? null} reference={ref ?? null} />;
}
