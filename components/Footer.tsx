import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`${styles.footerInner} container`}>

        {/* Brand */}
        <div className={styles.footerBrand}>
          <Link href="/">
            <Image
              src="/logo-white.png"
              alt="DILA Diseño Latino"
              width={130}
              height={78}
              style={{ height: "52px", width: "auto" }}
            />
          </Link>
          <p className={styles.footerTagline}>
            Moldeadoras de uso diario.<br />Hecho en Colombia.
          </p>
        </div>

        {/* Productos */}
        <div className={styles.footerCol}>
          <p className={styles.footerHeading}>Productos</p>
          <Link href="#productos" className={styles.footerLink}>Faja Clásica</Link>
          <Link href="#productos" className={styles.footerLink}>Faja Premium</Link>
        </div>

        {/* Info */}
        <div className={styles.footerCol}>
          <p className={styles.footerHeading}>Información</p>
          <Link href="#beneficios" className={styles.footerLink}>Beneficios</Link>
          <Link href="#contacto" className={styles.footerLink}>Contacto</Link>
          <Link href="#" className={styles.footerLink}>Política de envíos</Link>
        </div>

        {/* Contacto */}
        <div className={styles.footerCol}>
          <p className={styles.footerHeading}>Contacto</p>
          <a
            href="https://wa.me/573000000000"
            className={`${styles.footerLink} ${styles.footerWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a href="mailto:info@dilalatino.co" className={styles.footerLink}>
            info@dilalatino.co
          </a>
        </div>
      </div>

      <div className={`${styles.footerBottom} container`}>
        <p className={styles.footerCopy}>© {year} DILA Diseño Latino. Todos los derechos reservados.</p>
        <p className={styles.footerCopy}>Medellín, Colombia</p>
      </div>
    </footer>
  );
}
