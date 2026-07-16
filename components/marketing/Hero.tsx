"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.heroInner} container`}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className={styles.heroTitle}>Tu silueta, sin esfuerzo</h1>
          <p className={styles.heroSubtitle}>
            Short moldeador de alta compresión que reduce tallas al instante
            y se siente cómodo todo el día.
          </p>
          <a href="#productos" className={`${styles.heroCta} btn-primary`}>
            Comprar ahora
          </a>
        </motion.div>

        <motion.div
          className={styles.heroImageWrap}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          <Image
            src="/images/faja-frente-2.webp"
            alt="Modelo usando el short moldeador DILA"
            width={900}
            height={1125}
            priority
            className={styles.heroImage}
          />
        </motion.div>
      </div>
    </section>
  );
}
