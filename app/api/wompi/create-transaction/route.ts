import { NextResponse } from "next/server";
import { buildOrderPricing, OrderValidationError } from "@/lib/order";
import { buildIntegritySignature, isWompiConfigured } from "@/lib/wompi";
import { sanitizeUrl } from "@/lib/utils";
import type { CustomerInfo, OrderItemInput } from "@/types/payment";

export async function POST(request: Request) {
  if (!isWompiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Wompi no está configurado. Agrega NEXT_PUBLIC_WOMPI_PUBLIC_KEY y WOMPI_INTEGRITY_SECRET en .env.local.",
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

  const currency = "COP";
  const amountInCents = order.total * 100;
  const signature = buildIntegritySignature({ reference: order.reference, amountInCents, currency });
  const siteUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin);
  const { customer } = body;

  return NextResponse.json({
    publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
    currency,
    amountInCents,
    reference: order.reference,
    signature,
    redirectUrl: `${siteUrl}/pago/exito?ref=${order.reference}`,
    customerData: {
      email: customer.email,
      fullName: customer.fullName,
      phoneNumber: customer.phone,
      legalId: customer.documentId,
      legalIdType: "CC",
    },
    shippingAddress: {
      addressLine1: customer.address,
      city: customer.city,
      country: "CO",
      phoneNumber: customer.phone,
    },
    order,
  });
}
