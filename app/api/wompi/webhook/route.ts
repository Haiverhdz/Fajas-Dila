import { NextResponse } from "next/server";
import { mapWompiStatus, verifyWebhookChecksum } from "@/lib/wompi";
import { updateOrderStatus } from "@/lib/order";

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
  if (payload.event === "transaction.updated" && transaction?.reference && transaction.status) {
    try {
      await updateOrderStatus(transaction.reference, mapWompiStatus(transaction.status));
    } catch (error) {
      console.error("[wompi webhook] updateOrderStatus", error);
      // 500 para que Wompi reintente el webhook más tarde en vez de darlo
      // por entregado con el pedido todavía en 'pending'.
      return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 500 });
    }
    console.log(`[wompi webhook] ${transaction.reference} -> ${transaction.status}`);
  }

  return NextResponse.json({ received: true });
}
