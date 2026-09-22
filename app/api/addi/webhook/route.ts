import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { mapAddiStatus } from "@/lib/addi";
import { updateOrderStatus } from "@/lib/order";
import type { AddiRawStatus } from "@/types/payment";

// Autenticación confirmada por el usuario: Basic Auth con credenciales
// separadas del client_id/client_secret de la API (se obtienen en el panel
// de aliado, sección "Credenciales de notificación"). Reemplaza el guess
// anterior de HMAC vía `x-addi-signature`, que nunca estuvo verificado.
function isAuthorized(request: Request): boolean {
  const user = process.env.ADDI_WEBHOOK_USER;
  const password = process.env.ADDI_WEBHOOK_PASSWORD;
  if (!user || !password) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(header);
  return (
    expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(request: Request) {
  // Falla cerrado: sin ADDI_WEBHOOK_USER/PASSWORD configurados, se rechaza
  // en vez de aceptar notificaciones sin autenticar (esto actualiza el
  // estado de pedidos — no queremos que cualquiera pueda marcar uno como
  // 'approved' con un POST directo).
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const rawBody = await request.text();

  // `status`: confirmado contra la doc oficial de Addi, son exactamente
  // estos 6 valores (ver AddiRawStatus / mapAddiStatus en lib/addi.ts):
  // APPROVED, PENDING, REJECTED, ABANDONED, DECLINED, INTERNAL_ERROR.
  //
  // PENDIENTE DE CONFIRMAR: el resto del schema exacto de lo que Addi
  // envía aquí (`OnlineLoanApplicationCallbackRequest`) y de la respuesta
  // que espera (`CallbackInformationResponse`) — el usuario los va a
  // pegar. Por ahora se asume además `approvedAmount` y se responde con el
  // mismo body recibido, tal como se pidió explícitamente — pero ojo,
  // `CallbackInformationResponse` como nombre de schema sugiere que la
  // respuesta esperada podría tener una forma propia distinta de un eco;
  // si es así, hay que ajustar el `return` de abajo. La referencia del
  // pedido llega por query string (`?ref=`), no por el body — así se
  // construyó el `callbackUrl` en createAddiApplication().
  let payload: { status?: AddiRawStatus; approvedAmount?: number };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const reference = new URL(request.url).searchParams.get("ref");

  if (reference && payload.status) {
    const status = mapAddiStatus(payload.status);

    // approvedAmount solo debería ser != 0 cuando status === 'approved', y
    // en ese caso debería ser exactamente el monto solicitado (Addi no
    // hace aprobaciones parciales). Se deja como validación de solo-log
    // por ahora — no hay una columna en `orders` para guardar este valor.
    if (status === "approved" && payload.approvedAmount === 0) {
      console.warn(`[addi webhook] ${reference}: status approved pero approvedAmount es 0`);
    }

    try {
      // updateOrderStatus es un UPDATE ... WHERE reference = ?, idempotente
      // por diseño: los reintentos de Addi (cada 30 min hasta 24h) pueden
      // repetir este mismo UPDATE sin duplicar ni romper nada. Se guarda
      // también el status crudo de Addi (addi_status), separado de
      // nuestro status normalizado.
      await updateOrderStatus(reference, status, payload.status);
    } catch (error) {
      console.error("[addi webhook] updateOrderStatus", error);
      return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 500 });
    }
  } else {
    console.warn("[addi webhook] payload sin ref (query string) o sin status reconocible", {
      reference,
      payload,
    });
  }

  // Addi exige responder 200 con EXACTAMENTE el mismo body recibido para
  // marcar la notificación como entregada — no un `{ received: true }`
  // propio.
  return new NextResponse(rawBody, { status: 200, headers: { "Content-Type": "application/json" } });
}
