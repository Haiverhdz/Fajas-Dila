import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().trim().min(3, "Ingresa tu nombre completo"),
  documentId: z
    .string()
    .trim()
    .min(5, "Cédula inválida")
    .max(15, "Cédula inválida")
    .regex(/^\d+$/, "Solo números"),
  email: z.string().trim().email("Correo inválido"),
  phone: z
    .string()
    .trim()
    .regex(/^3\d{9}$/, "Celular inválido (10 dígitos, ej: 3001234567)"),
  address: z.string().trim().min(5, "Ingresa una dirección válida"),
  city: z.string().trim().min(2, "Ingresa tu ciudad"),
});
