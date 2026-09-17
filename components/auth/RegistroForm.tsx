"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { registerSchema, type RegisterInput } from "@/lib/auth-schema";
import styles from "./AuthForm.module.css";

export default function RegistroForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>();

  async function onSubmit(data: RegisterInput) {
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        setError(issue.path[0] as keyof RegisterInput, { message: issue.message });
      });
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const payload = await response.json();
      if (!response.ok) {
        setFormError(payload.error ?? "No se pudo crear la cuenta.");
        return;
      }

      const signInResponse = await signIn("credentials", {
        email: result.data.email,
        password: result.data.password,
        redirect: false,
      });

      if (signInResponse?.error) {
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.field}>
        <label htmlFor="name">Nombre completo</label>
        <input id="name" autoComplete="name" {...register("name")} />
        {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">Celular</label>
        <input id="phone" autoComplete="tel" inputMode="numeric" placeholder="3001234567" {...register("phone")} />
        {errors.phone && <span className={styles.errorMsg}>{errors.phone.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword">Confirmar contraseña</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword.message}</span>}
      </div>

      {formError && <p className={styles.formError}>{formError}</p>}

      <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className={styles.altLink}>
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </form>
  );
}
