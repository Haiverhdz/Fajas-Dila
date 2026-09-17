import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import styles from "@/components/auth/AuthForm.module.css";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div className={`${styles.page} container`}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <LoginForm />
      </div>
    </div>
  );
}
