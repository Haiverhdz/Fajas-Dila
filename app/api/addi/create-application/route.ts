import { NextResponse } from "next/server";
import { buildOrderPricing, saveOrder, OrderValidationError } from "@/lib/order";
import { createAddiApplication, isAddiConfigured } from "@/lib/addi";
import { sanitizeUrl } from "@/lib/utils";
import { auth } from "@/auth";
import type { CustomerInfo, OrderItemInput } from "@/types/payment";

export async function POST(request: Request) {
  if (!isAddiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Addi no está configurado. Agrega ADDI_CLIENT_ID, ADDI_CLIENT_SECRET y ADDI_ALLY_SLUG en .env.local (requiere aprobación comercial previa).",
      },
      { status: 503 }
    );
  }

  let body: { customer?: CustomerInfo; items?: OrderItemInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  if (!body.customer || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Faltan datos del cliente o del carrito." }, { status: 400 });
  }

  let order;
  try {
    order = buildOrderPricing(body.items);
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  try {
    await saveOrder(order, body.customer, "addi", userId);
  } catch (error) {
    console.error("[addi] saveOrder", error);
    return NextResponse.json({ error: "No se pudo registrar el pedido. Intenta de nuevo." }, { status: 500 });
  }

  const siteUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin);

  try {
    const application = await createAddiApplication({
      customer: body.customer,
      order,
      redirectUrl: `${siteUrl}/pago/pendiente?ref=${order.reference}`,
    });
    return NextResponse.json(application);
  } catch (error) {
    console.error("[addi] create-application", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el proceso con Addi. Intenta de nuevo." },
      { status: 502 }
    );
  }
}
