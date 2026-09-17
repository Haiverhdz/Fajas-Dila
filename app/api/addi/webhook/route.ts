import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { mapAddiStatus } from "@/lib/addi";
import { updateOrderStatus } from "@/lib/order";

// El mecanismo exacto de firma de webhooks de Addi debe confirmarse
// contra la documentación oficial una vez se tenga acceso al panel de
// aliado. Este endpoint valida, si están presentes, un HMAC-SHA256 del
// cuerpo crudo vía el header `x-addi-signature` usando ADDI_CLIENT_SECRET
// como llave compartida — ajustar si Addi documenta un mecanismo distinto.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.ADDI_CLIENT_SECRET;
  const signatureHeader = request.headers.get("x-addi-signature");

  if (secret && signatureHeader) {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(signatureHeader);
    const isValid =
      expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }
  }

  // Forma del payload NO verificada contra la doc real de Addi (ver nota de
  // lib/addi.ts) — se asume que trae de vuelta el mismo `orderReference`
  // enviado en create-application, más un `status`. Ajustar cuando se
  // confirme el payload real.
  let payload: { orderReference?: string; status?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  if (payload.orderReference && payload.status) {
    try {
      await updateOrderStatus(payload.orderReference, mapAddiStatus(payload.status));
    } catch (error) {
      console.error("[addi webhook] updateOrderStatus", error);
      return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 500 });
    }
  }

  console.log("[addi webhook]", payload);

  return NextResponse.json({ received: true });
}
