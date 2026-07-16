"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getFeaturedProduct } from "@/lib/products";
import { useCartStore } from "@/lib/cart-store";
import { formatCOP } from "@/lib/utils";
import styles from "./ProductSection.module.css";

const imageAlts: Record<string, string> = {
  "/images/faja-frente.webp": "Short moldeador DILA, vista de frente",
  "/images/faja-frente-2.webp": "Short moldeador DILA, vista de frente alternativa",
  "/images/faja-izquierda.webp": "Short moldeador DILA, vista lateral",
  "/images/faja-cola.webp": "Short moldeador DILA, vista trasera",
  "/images/costura-faja.webp": "Detalle de la banda de silicona antideslizante",
};

const trustBadges = [
  { icon: Truck, label: "Envío a toda Colombia" },
  { icon: RotateCcw, label: "Cambios en 8 días" },
  { icon: ShieldCheck, label: "Pago 100% seguro" },
];

export default function ProductSection() {
  const product = getFeaturedProduct();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size: selectedSize,
    });
    openDrawer();
  }

  return (
    <section id="productos" className={styles.section}>
      <div className={`${styles.grid} container`}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrap}>
            <Image
              src={product.images[activeImage]}
              alt={imageAlts[product.images[activeImage]] ?? product.name}
              width={900}
              height={1125}
              className={styles.mainImage}
            />
          </div>
          <div className={styles.thumbRow}>
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={`${styles.thumb} ${
                  index === activeImage ? styles.thumbActive : ""
                }`}
                onClick={() => setActiveImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={imageAlts[image] ?? product.name}
                  width={200}
                  height={200}
                  className={styles.thumbImage}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div>
            <h2 className={styles.name}>{product.name}</h2>
            <p className={styles.price}>{formatCOP(product.price)}</p>
          </div>

          <p className={styles.description}>{product.description}</p>

          <ul className={styles.features}>
            {product.features.map((feature) => (
              <li key={feature} className={styles.featureItem}>
                <Check size={16} className={styles.featureIcon} />
                {feature}
              </li>
            ))}
          </ul>

          <div className={styles.sizeBlock}>
            <span className={styles.sizeLabel}>Talla</span>
            <div className={styles.sizeOptions}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`${styles.sizeButton} ${
                    size === selectedSize ? styles.sizeButtonActive : ""
                  }`}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && (
              <span className={styles.sizeError}>
                Selecciona una talla antes de continuar.
              </span>
            )}
          </div>

          <button
            type="button"
            className={`${styles.addToCart} btn-primary`}
            onClick={handleAddToCart}
          >
            Agregar al carrito
          </button>

          <div className={styles.trustRow}>
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className={styles.trustItem}>
                <Icon size={22} className={styles.trustIcon} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
