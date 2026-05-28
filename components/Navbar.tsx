"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      <div className={`${styles.navbarInner} container`}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo-dark.png"
            alt="DILA Diseño Latino"
            width={110}
            height={66}
            priority
          />
        </Link>

        {/* Nav links — desktop */}
        <nav aria-label="Navegación principal" className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Inicio</Link>
          <Link href="#productos" className={styles.navLink}>Productos</Link>
          <Link href="#beneficios" className={styles.navLink}>Beneficios</Link>
          <Link href="#contacto" className={styles.navLink}>Contacto</Link>
        </nav>

        {/* CTA + hamburger */}
        <div className={styles.navbarActions}>
          <Link href="#productos" className={styles.btnNavCta}>Ver fajas</Link>
          <button
            className={styles.hamburger}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span className={`${styles.bar} ${open ? styles.barTop : ""}`} />
            <span className={`${styles.bar} ${open ? styles.barMid : ""}`} />
            <span className={`${styles.bar} ${open ? styles.barBot : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!open}
      >
        <nav className={styles.mobileNav}>
          <Link href="/" className={styles.mobileLink} onClick={() => setOpen(false)}>Inicio</Link>
          <Link href="#productos" className={styles.mobileLink} onClick={() => setOpen(false)}>Productos</Link>
          <Link href="#beneficios" className={styles.mobileLink} onClick={() => setOpen(false)}>Beneficios</Link>
          <Link href="#contacto" className={styles.mobileLink} onClick={() => setOpen(false)}>Contacto</Link>
          <Link href="#productos" className={styles.btnMobileCta} onClick={() => setOpen(false)}>
            Ver fajas →
          </Link>
        </nav>
      </div>
    </header>
  );
}
