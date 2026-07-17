import { createHash } from "crypto";

export function isWompiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY && process.env.WOMPI_INTEGRITY_SECRET);
}

// https://docs.wompi.co/docs/colombia/firma-integridad/
// integritySignature = SHA256(referencia + montoEnCentavos + moneda + secretoIntegridad)
export function buildIntegritySignature(params: {
  reference: string;
  amountInCents: number;
  currency: string;
}): string {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) {
    throw new Error("WOMPI_INTEGRITY_SECRET no está configurado.");
  }
  const raw = `${params.reference}${params.amountInCents}${params.currency}${secret}`;
  return createHash("sha256").update(raw).digest("hex");
}

type WompiWebhookPayload = {
  data: Record<string, unknown>;
  signature: { properties: string[]; checksum: string };
  timestamp: number;
};

// https://docs.wompi.co/docs/colombia/eventos/
// checksum = SHA256(valores_de_signature.properties_concatenados + timestamp + eventsSecret)
export function verifyWebhookChecksum(payload: WompiWebhookPayload): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) return false;

  const values = payload.signature.properties.map((path) => {
    const value = path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
      return undefined;
    }, payload.data);
    return String(value ?? "");
  });

  const raw = `${values.join("")}${payload.timestamp}${secret}`;
  const expected = createHash("sha256").update(raw).digest("hex");
  return expected.toLowerCase() === payload.signature.checksum.toLowerCase();
}
