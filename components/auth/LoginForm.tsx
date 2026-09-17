"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/auth-schema";
import styles from "./AuthForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>();

  async function onSubmit(data: LoginInput) {
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        setError(issue.path[0] as keyof LoginInput, { message: issue.message });
      });
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      const response = await signIn("credentials", {
        ...result.data,
        redirect: false,
      });

      if (response?.error) {
        setFormError("Correo o contraseña incorrectos.");
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
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
      </div>

      {formError && <p className={styles.formError}>{formError}</p>}

      <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>

      <p className={styles.altLink}>
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
      </p>
    </form>
  );
}
