import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

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

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  // TODO: cuando exista persistencia de órdenes, actualizar el estado del
  // pedido según el payload de Addi.
  console.log("[addi webhook]", payload);

  return NextResponse.json({ received: true });
}
