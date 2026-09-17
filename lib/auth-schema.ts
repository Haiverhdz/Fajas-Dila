import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Ingresa tu nombre completo"),
    email: z.string().trim().email("Correo inválido"),
    phone: z
      .string()
      .trim()
      .regex(/^3\d{9}$/, "Celular inválido (10 dígitos, ej: 3001234567)"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;
