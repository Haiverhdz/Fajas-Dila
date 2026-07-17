import { NextResponse } from "next/server";
import { verifyWebhookChecksum } from "@/lib/wompi";

export async function POST(request: Request) {
  let payload: {
    event?: string;
    data?: { transaction?: { reference?: string; status?: string } };
    signature?: { properties: string[]; checksum: string };
    timestamp?: number;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  if (!payload.data || !payload.signature || !payload.timestamp) {
    return NextResponse.json({ error: "Payload incompleto." }, { status: 400 });
  }

  const isValid = verifyWebhookChecksum({
    data: payload.data,
    signature: payload.signature,
    timestamp: payload.timestamp,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  const transaction = payload.data.transaction;
  if (payload.event === "transaction.updated" && transaction) {
    // TODO: cuando exista persistencia de órdenes, actualizar el estado
    // del pedido (transaction.reference) según transaction.status
    // (APPROVED | DECLINED | VOIDED | ERROR | PENDING).
    console.log(`[wompi webhook] ${transaction.reference} -> ${transaction.status}`);
  }

  return NextResponse.json({ received: true });
}
