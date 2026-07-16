import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "faja-short-alta-compresion",
    slug: "short-moldeador-alta-compresion",
    name: "Short Moldeador Alta Compresión",
    description:
      "Short faja sin costuras que reduce tallas al instante y moldea cintura, abdomen y cadera con comodidad para uso diario.",
    longDescription:
      "Nuestro short moldeador está fabricado en tejido de alta compresión sin costuras, diseñado para acompañar tu cuerpo todo el día sin marcarse bajo la ropa. La cintura y las piernas llevan un acabado en encaje suave con banda de silicona antideslizante interior, que evita que la prenda se enrolle o se suba con el movimiento. Ideal para uso diario, después del parto o en el postoperatorio, bajo supervisión médica.",
    price: 89900,
    images: [
      "/images/faja-frente.webp",
      "/images/faja-frente-2.webp",
      "/images/faja-izquierda.webp",
      "/images/faja-cola.webp",
      "/images/costura-faja.webp",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Negro"],
    features: [
      "Tejido sin costuras de alta compresión",
      "Banda de silicona antideslizante interior",
      "Encaje suave en cintura y piernas",
      "Reduce tallas al instante",
      "Cómoda para uso diario, post-parto y post-quirúrgico",
    ],
    stock: 25,
    featured: true,
  },
];

export function getFeaturedProduct(): Product {
  return products[0];
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
