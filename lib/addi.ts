import { randomUUID } from "crypto";
import { products } from "@/lib/products";
import { getSiteUrl } from "@/lib/utils";
import type { CustomerInfo, OrderPricing, OrderStatus } from "@/types/payment";

// Integración con Addi ("compra ahora, paga después").
//
// --- Autenticación (OAuth/Auth0) ---
// CONFIRMADO por Addi directamente (soporte, vía el usuario): el servidor
// de auth y el `audience` son los MISMOS para sandbox y producción — no
// indican el ambiente y NO dependen de ADDI_ENV. Lo que sí diferencia el
// ambiente es el host de creación de transacción, más abajo.
const ADDI_AUTH_URL = "https://auth.addi.com";
const ADDI_AUTH_AUDIENCE = "https://api.addi.com";

// --- Host de la API de recursos (creación de la "online application") ---
// Este SÍ depende de ADDI_ENV — confirmado por la doc real que pegó el
// usuario y por Addi directamente:
//   - sandbox:    https://api.addi-staging.com
//   - producción: https://api.addi.com
const ADDI_API_BASE_URL =
  process.env.ADDI_ENV === "production" ? "https://api.addi.com" : "https://api.addi-staging.com";

export function isAddiConfigured(): boolean {
  return Boolean(
    process.env.ADDI_CLIENT_ID && process.env.ADDI_CLIENT_SECRET && process.env.ADDI_ALLY_SLUG
  );
}

// Un token nuevo por cada intento de transacción (a propósito: Addi indicó
// que reusar un token entre transacciones simultáneas puede causar errores
// de expiración cruzada). No hay caché a nivel de módulo — cada llamada a
// createAddiApplication() invoca esto de cero.
async function getAccessToken(): Promise<string> {
  const response = await fetch(`${ADDI_AUTH_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audience: ADDI_AUTH_AUDIENCE,
      grant_type: "client_credentials",
      client_id: process.env.ADDI_CLIENT_ID,
      client_secret: process.env.ADDI_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`No se pudo autenticar con Addi (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

// --- Configuración del aliado (monto mínimo/máximo, descuento, estado) ---
// Verificado con el ejemplo de respuesta que pegó el usuario. Es un
// endpoint público (host "channels-public-api"), sin autenticación.
export type AddiAllyConfig = {
  minAmount: number;
  maxAmount: number;
  /** Descuento informativo (0.2 = 20%). SOLO visual — nunca se resta del monto real enviado a Addi. */
  discount: number;
  isActiveAlly: boolean;
  isActivePayNow: boolean;
};

export async function getAllyConfig(requestedAmount: number): Promise<AddiAllyConfig> {
  const allySlug = process.env.ADDI_ALLY_SLUG;
  if (!allySlug) {
    throw new Error("ADDI_ALLY_SLUG no está configurado.");
  }

  const url = `https://channels-public-api.addi.com/allies/${allySlug}/config?requestedamount=${Math.round(requestedAmount)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`No se pudo consultar la configuración de Addi (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    minAmount: number;
    maxAmount: number;
    policy?: { discount?: number };
    isActiveAlly: boolean;
    isActivePayNow: boolean;
  };

  return {
    minAmount: data.minAmount,
    maxAmount: data.maxAmount,
    discount: data.policy?.discount ?? 0,
    isActiveAlly: data.isActiveAlly,
    isActivePayNow: data.isActivePayNow,
  };
}

// Nuestro formulario de checkout solo pide "nombre completo" (un campo),
// pero Addi separa firstName/lastName. Heurística: la primera palabra es
// el nombre, el resto es el apellido — funciona para la mayoría de
// nombres colombianos ("Juan Pérez") pero es una aproximación para
// nombres compuestos de varias palabras ("Juan Carlos Pérez Gómez" →
// firstName "Juan", lastName "Carlos Pérez Gómez"). Si Addi necesita más
// precisión, la solución real es agregar campos separados al formulario.
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? fullName,
    lastName: parts.slice(1).join(" ") || parts[0] || fullName,
  };
}

// --- Creación de la "online application" (transacción de crédito) ---
// CONFIRMADO por la doc oficial que pegó el usuario
// (https://api-docs.addi-staging.com/integration/#/online%20application/createOnlineLoanApplication):
//   - POST /v1/online-applications, Bearer token del paso de auth.
//   - Responde HTTP 301 SIN body, con la URL de Addi en el header
//     `Location` — de ahí el `redirect: "manual"`.
//   - totalAmount/shippingAmount/totalTaxesAmount van como STRING.
//   - `items[].quantity` también STRING; `unitPrice`/`tax` numéricos.
//   - `callbackUrl`/`redirectionUrl` van ANIDADOS dentro de
//     `allyUrlRedirection`, junto con un `logoUrl` obligatorio.
//   - `pickUpAddress` es requerido en el ejemplo de la doc — como el
//     checkout no distingue recogida en tienda, se reusa la misma
//     dirección que shipping/billing (no hay una tienda física separada
//     que ofrecer).
//
// PENDIENTE DE CONFIRMAR (el usuario los va a pegar del mismo Swagger):
//   - El schema exacto de lo que Addi envía a nuestro callbackUrl
//     (`OnlineLoanApplicationCallbackRequest`) y de la respuesta esperada
//     (`CallbackInformationResponse`) — ver el TODO en el webhook
//     (app/api/addi/webhook/route.ts). Ojo: esto podría contradecir la
//     instrucción anterior de "responder con el mismo body recibido" si
//     `CallbackInformationResponse` resulta ser una forma distinta — no
//     se cambió el webhook todavía, a la espera de esa confirmación.
export async function createAddiApplication(params: {
  customer: CustomerInfo;
  order: OrderPricing;
  siteUrl: string;
}): Promise<{ redirectUrl: string }> {
  const token = await getAccessToken();
  const { customer, order } = params;

  const callbackUrl = `${params.siteUrl}/api/addi/webhook?ref=${order.reference}`;
  const redirectionUrl = `${params.siteUrl}/pago/addi/retorno?ref=${order.reference}`;
  const { firstName, lastName } = splitFullName(customer.fullName);

  const address = {
    lineOne: customer.address,
    city: customer.city,
    country: "CO",
  };

  const response = await fetch(`${ADDI_API_BASE_URL}/v1/online-applications`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      // orderId: un UUID por intento de compra, exigido por Addi — no es
      // lo mismo que nuestra `reference` (esa la usamos nosotros para
      // identificar el pedido en callbackUrl/redirectionUrl y en la BD).
      orderId: randomUUID(),
      totalAmount: order.total.toFixed(1),
      shippingAmount: order.shipping.toFixed(1),
      // No desglosamos impuestos por separado en lib/order.ts (los precios
      // ya incluyen IVA) — se envía "0.0" en vez de inventar un valor.
      totalTaxesAmount: "0.0",
      currency: order.currency,
      items: order.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          sku: item.productId,
          name: item.name,
          quantity: String(item.quantity),
          unitPrice: item.price,
          tax: 0,
          pictureUrl: product ? `${getSiteUrl()}${product.images[0]}` : undefined,
          category: "ropa",
          brand: "DILA Diseño Latino",
        };
      }),
      client: {
        idType: "CC",
        idNumber: customer.documentId,
        firstName,
        lastName,
        email: customer.email,
        cellphone: customer.phone,
        cellphoneCountryCode: "+57",
        address,
      },
      shippingAddress: address,
      billingAddress: address,
      pickUpAddress: address,
      allyUrlRedirection: {
        logoUrl: `${getSiteUrl()}/logo-dark.png`,
        callbackUrl,
        redirectionUrl,
      },
      // TODO: no recolectamos geolocalización real del cliente en el
      // checkout (requeriría pedir permiso de ubicación en el navegador).
      // Se usan coordenadas de Bogotá como placeholder — si Addi usa esto
      // para scoring de riesgo/fraude, confirmar con ellos si es aceptable
      // o si hay que implementar geolocalización real del navegador antes
      // de ir a producción.
      geoLocation: { latitude: "4.624335", longitude: "-74.063644" },
    }),
  });

  if (response.status === 301) {
    const location = response.headers.get("location");
    if (!location) {
      throw new Error("Addi respondió 301 pero sin header Location.");
    }
    return { redirectUrl: location };
  }

  const body = await response.text().catch(() => "");
  throw new Error(`Addi no devolvió el redirect 301 esperado (status ${response.status}): ${body}`);
}

// Estados reales confirmados por el usuario (documentación oficial de
// Addi): approved, rejected, declined, abandoned. 'pending' e 'in_process'
// se mantienen en el enum para el estado inicial y para Wompi
// respectivamente, no son estados que Addi vaya a enviar.
export function mapAddiStatus(status: string): OrderStatus {
  switch (status.toLowerCase()) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "declined":
      return "declined";
    case "abandoned":
      return "abandoned";
    default:
      // No debería pasar según la doc — se deja como 'in_process' (no se
      // asume aprobado ni rechazado) y queda registrado en logs por quien
      // llame a esta función.
      return "in_process";
  }
}
