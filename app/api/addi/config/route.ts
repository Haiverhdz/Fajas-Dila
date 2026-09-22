import { NextResponse } from "next/server";
import { getAllyConfig, isAddiConfigured } from "@/lib/addi";

// Proxy del endpoint público de configuración de Addi
// (channels-public-api.addi.com) — se consulta desde el servidor para no
// tener que exponer ADDI_ALLY_SLUG al cliente como NEXT_PUBLIC_*.
export async function GET(request: Request) {
  if (!isAddiConfigured()) {
    return NextResponse.json({ error: "Addi no está configurado." }, { status: 503 });
  }

  const amountParam = new URL(request.url).searchParams.get("amount");
  const amount = Number(amountParam);
  if (!amountParam || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Parámetro amount inválido." }, { status: 400 });
  }

  try {
    const config = await getAllyConfig(amount);
    return NextResponse.json(config);
  } catch (error) {
    console.error("[addi] config", error);
    return NextResponse.json({ error: "No se pudo consultar la configuración de Addi." }, { status: 502 });
  }
}
