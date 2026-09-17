import type { CustomerInfo, OrderPricing, OrderStatus } from "@/types/payment";

// Integración con Addi ("compra ahora, paga después").
// Docs: https://developers.addi.com — el panel de aliado y el sandbox
// requieren aprobación comercial previa (KYC), a la que este proyecto
// todavía no tiene acceso. La forma general de abajo (OAuth2
// client_credentials + creación de una "application") es la habitual en
// integraciones BNPL, pero los nombres exactos de endpoints y campos NO
// pudieron verificarse contra la documentación real. Antes de ir a
// producción, confirmar cada endpoint/payload contra
// https://api-docs-sandbox.addi.com y ajustar aquí.

const ADDI_BASE_URL =
  process.env.ADDI_ENV === "production" ? "https://api.addi.com" : "https://api-sandbox.addi.com";

export function isAddiConfigured(): boolean {
  return Boolean(
    process.env.ADDI_CLIENT_ID && process.env.ADDI_CLIENT_SECRET && process.env.ADDI_ALLY_SLUG
  );
}

async function getAccessToken(): Promise<string> {
  const response = await fetch(`${ADDI_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.ADDI_CLIENT_ID,
      client_secret: process.env.ADDI_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo autenticar con Addi (${response.status}).`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createAddiApplication(params: {
  customer: CustomerInfo;
  order: OrderPricing;
  redirectUrl: string;
}): Promise<{ applicationId: string; redirectUrl: string }> {
  const token = await getAccessToken();

  const response = await fetch(`${ADDI_BASE_URL}/v1/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      allySlug: process.env.ADDI_ALLY_SLUG,
      orderReference: params.order.reference,
      amount: params.order.total,
      currency: params.order.currency,
      redirectUrl: params.redirectUrl,
      customer: {
        fullName: params.customer.fullName,
        email: params.customer.email,
        phone: params.customer.phone,
        documentId: params.customer.documentId,
      },
      items: params.order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Addi rechazó la solicitud (${response.status}).`);
  }

  const data = (await response.json()) as { id: string; redirectUrl?: string; checkoutUrl?: string };
  const applicationRedirectUrl = data.redirectUrl ?? data.checkoutUrl;
  if (!applicationRedirectUrl) {
    throw new Error("Addi no devolvió una URL de redirección.");
  }

  return { applicationId: data.id, redirectUrl: applicationRedirectUrl };
}

// NO verificado contra la doc real de Addi (igual que el resto de este
// archivo — ver nota arriba). Mapeo conservador: cualquier estado que no
// reconozcamos cae en 'in_process' en vez de asumir aprobado/rechazado.
// Ajustar los nombres de estado exactos cuando se confirme el payload real
// del webhook de Addi.
export function mapAddiStatus(status: string): OrderStatus {
  switch (status.toLowerCase()) {
    case "approved":
    case "disbursed":
    case "active":
      return "approved";
    case "rejected":
    case "declined":
    case "expired":
    case "cancelled":
      return "declined";
    case "pending":
    case "in_review":
      return "pending";
    default:
      return "in_process";
  }
}
