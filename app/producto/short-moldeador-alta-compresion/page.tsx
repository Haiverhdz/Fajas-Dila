import type { Metadata } from "next";
import ProductSection from "@/components/marketing/ProductSection";

export const metadata: Metadata = {
  title: "Short Moldeador Alta Compresión",
  description:
    "Short faja sin costuras que reduce tallas al instante y moldea cintura, abdomen y cadera con comodidad para uso diario.",
};

export default function ProductoPage() {
  return <ProductSection />;
}
