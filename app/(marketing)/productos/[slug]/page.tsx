import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductSection from "@/components/marketing/ProductSection";
import { products, getProductBySlug } from "@/lib/products";
import { formatCOP, getSiteUrl } from "@/lib/utils";
import type { Product } from "@/types/product";
import styles from "./page.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      url: `/productos/${product.slug}`,
      images: [{ url: product.images[0], width: 1080, height: 1350 }],
    },
  };
}

/**
 * Datos estructurados Schema.org Product — solo campos que existen en
 * `lib/products.ts`, nada inventado. Lo piden los validadores de Wompi/Addi
 * (precio, disponibilidad, talla/color) y ayuda al rich snippet de Google.
 * Los `image` van como URL absoluta porque JSON-LD no pasa por
 * `metadataBase` (eso es exclusivo del Metadata API de Next).
 */
function buildProductJsonLd(product: Product) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    image: product.images.map((image) => `${siteUrl}${image}`),
    brand: { "@type": "Brand", name: "DILA Diseño Latino" },
    size: product.sizes.join(", "),
    ...(product.colors && product.colors.length > 0
      ? { color: product.colors.join(", ") }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/productos/${product.slug}`,
      priceCurrency: "COP",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProductJsonLd(product)),
        }}
      />

      <div className={styles.breadcrumb}>
        <div className="container">
          <Link href="/productos" className={styles.backLink}>
            <ArrowLeft size={16} />
            Volver al catálogo
          </Link>
        </div>
      </div>

      <ProductSection
        product={product}
        sectionId="producto"
        headingLevel="h1"
      />

      <section className={styles.details}>
        <div className={`${styles.detailsGrid} container`}>
          <div>
            <h2 className={styles.detailsTitle}>Sobre esta prenda</h2>
            <p className={styles.longDescription}>{product.longDescription}</p>
          </div>

          <dl className={styles.specs}>
            <div className={styles.specRow}>
              <dt className={styles.specLabel}>Precio</dt>
              <dd className={styles.specValue}>{formatCOP(product.price)}</dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specLabel}>Tallas</dt>
              <dd className={styles.specValue}>{product.sizes.join(" · ")}</dd>
            </div>
            {product.colors && product.colors.length > 0 && (
              <div className={styles.specRow}>
                <dt className={styles.specLabel}>Colores</dt>
                <dd className={styles.specValue}>
                  {product.colors.join(" · ")}
                </dd>
              </div>
            )}
            <div className={styles.specRow}>
              <dt className={styles.specLabel}>Disponibilidad</dt>
              <dd className={styles.specValue}>
                {product.stock > 0 ? "En stock" : "Agotado"}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
