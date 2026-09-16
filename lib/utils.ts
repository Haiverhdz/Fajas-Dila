/**
 * Recorta espacios accidentales (copy-paste desde el dashboard de Vercel,
 * un `.env` mal guardado, etc.) y la barra final, para que nunca se cuele un
 * espacio o un `//` duplicado al concatenar una ruta después. Se detectó en
 * producción un `NEXT_PUBLIC_SITE_URL` con un espacio al final que colaba
 * `"https://www.fajasdila.com /productos/..."` (espacio literal) en el
 * JSON-LD — ver nota en CLAUDE.md.
 */
export function sanitizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * URL pública del sitio, usada para metadataBase, OG/Twitter images y JSON-LD.
 * Único lugar con el fallback de producción — si `NEXT_PUBLIC_SITE_URL` no
 * llegó al build (build cacheado en Vercel, variable mal escrita, etc.) esto
 * evita que el sitio publique `localhost` en metadata pública, pero NO
 * reemplaza confirmar que la variable de entorno realmente está llegando al
 * build — ver nota en CLAUDE.md.
 */
export function getSiteUrl(): string {
  return sanitizeUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fajasdila.com");
}

export function formatCOP(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
