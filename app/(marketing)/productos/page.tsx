import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import { formatCOP } from "@/lib/utils";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Catálogo de fajas y prendas moldeadoras DILA. Alta compresión, tejido sin costuras y envío a toda Colombia.",
};

export default function ProductosPage() {
  return (
    <section className={styles.section}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.eyebrow}>Catálogo</span>
          <h1 className={styles.title}>Nuestras fajas moldeadoras</h1>
          <p className={styles.subtitle}>
            Prendas de alta compresión diseñadas para el uso diario: moldean sin
            marcarse bajo la ropa y se sienten cómodas todo el día.
          </p>
        </header>

        {products.length === 0 ? (
          <p className={styles.empty}>
            Pronto publicaremos nuevas prendas en el catálogo.
          </p>
        ) : (
          <ul className={styles.grid}>
            {products.map((product) => {
              const soldOut = product.stock <= 0;

              return (
                <li key={product.id}>
                  <Link
                    href={`/productos/${product.slug}`}
                    className={styles.card}
                  >
                    <div className={styles.imageWrap}>
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={600}
                        height={750}
                        className={styles.image}
                        sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 280px"
                      />
                      {soldOut ? (
                        <span className={`${styles.badge} ${styles.soldOut}`}>
                          Agotado
                        </span>
                      ) : (
                        product.featured && (
                          <span className={styles.badge}>Destacado</span>
                        )
                      )}
                    </div>

                    <div className={styles.body}>
                      <h2 className={styles.name}>{product.name}</h2>
                      <p className={styles.description}>{product.description}</p>

                      <div className={styles.footer}>
                        <span className={styles.price}>
                          {formatCOP(product.price)}
                        </span>
                        <span className={styles.cta}>
                          Ver detalle
                          <ArrowRight size={16} className={styles.ctaIcon} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
