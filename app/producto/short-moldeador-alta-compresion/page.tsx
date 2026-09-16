import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductSection from "@/components/marketing/ProductSection";
import { getProductBySlug } from "@/lib/products";

/**
 * Ruta legacy registrada para la validación de Addi.
 * El catálogo vive en `/productos/[slug]`; esta URL se mantiene estable.
 */
const SLUG = "short-moldeador-alta-compresion";

export const metadata: Metadata = {
  title: "Short Moldeador Alta Compresión",
  description:
    "Short faja sin costuras que reduce tallas al instante y moldea cintura, abdomen y cadera con comodidad para uso diario.",
};

export default function ProductoPage() {
  const product = getProductBySlug(SLUG);

  if (!product) {
    notFound();
  }

  return (
    <ProductSection product={product} sectionId="producto" headingLevel="h1" />
  );
}
