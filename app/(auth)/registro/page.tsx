import type { Metadata } from "next";
import RegistroForm from "@/components/auth/RegistroForm";
import styles from "@/components/auth/AuthForm.module.css";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegistroPage() {
  return (
    <div className={`${styles.page} container`}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <RegistroForm />
      </div>
    </div>
  );
}
