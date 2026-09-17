import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { registerSchema } from "@/lib/auth-schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const { name, email, phone, password } = result.data;

  const [existing] = await pool.query<RowDataPacket[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query("INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)", [
    email,
    passwordHash,
    name,
    phone,
  ]);

  return NextResponse.json({ ok: true });
}
