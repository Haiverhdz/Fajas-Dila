# Fajas — Landing + Ecommerce

## Contexto del proyecto

Landing/ecommerce de fajas moldeadoras hecho con **Next.js**. Ya existe una base inicial: proyecto creado, imágenes de la faja cargadas en `public/images/` (o similar — verificar), y footer construido.

**Objetivo actual:** mostrar el producto (una sola faja por ahora) en una landing atractiva y profesional, con carrito funcional y pasarelas de pago **Wompi + Addi** configuradas. La arquitectura debe permitir agregar más productos en el futuro sin refactor mayor.

## Estado inicial

- ✅ Proyecto Next.js ya creado.
- ✅ Footer ya construido (**NO tocar salvo que se indique**).
- ✅ Imágenes de la faja ya cargadas en el proyecto.
- ⏳ Falta: header, hero, sección de producto, carrito, checkout con Wompi y Addi.

**Antes de escribir cualquier código: revisar la estructura actual del proyecto** (`tree src -L 3` o `ls`), identificar qué existe, qué convenciones ya se están usando (App Router vs Pages Router, TypeScript vs JavaScript, Tailwind vs CSS Modules, etc.) y respetarlas.

## Stack técnico

- **Framework:** Next.js (respetar el router ya configurado).
- **Lenguaje:** el que ya esté configurado (TypeScript preferible).
- **Estilos:** el que ya esté configurado (Tailwind CSS preferible).
- **UI Components:** shadcn/ui (agregar solo lo necesario).
- **Estado del carrito:** Zustand.
- **Formularios:** React Hook Form + Zod.
- **Iconos:** Lucide React.
- **Animaciones:** Framer Motion (con moderación).
- **Pasarelas de pago:**
  - **Wompi** (Colombia) — tarjetas, PSE, Nequi, Bancolombia. Docs: https://docs.wompi.co
  - **Addi** (Colombia) — compra ahora, paga después en cuotas. Docs: https://developers.addi.com
- **Hosting:** Vercel.

## Estilo visual y branding

- **Tono:** fresco, moderno, femenino pero no infantil. Confianza en la calidad.
- **Paleta base:** blanco (`#ffffff`) + off-white (`#faf7f5`).
- **Color vibrante primario:** proponer 3 opciones antes de decidir (coral `#ff6b6b`, fucsia `#ec4899`, turquesa `#14b8a6`).
- **Neutro oscuro:** negro suave (`#171717`) para textos.
- **Acento:** dorado suave o rosa nude para detalles premium.
- **Tipografía:** título con carácter (Bricolage Grotesque / Fraunces / Poppins Bold) + cuerpo limpio (Inter).
- **Fotografía:** las fotos del producto son el corazón visual. Grandes, con aire.
- **UI:** minimalista, transiciones suaves.

## Estructura de rutas sugerida

```
src/
  app/
    (marketing)/
      page.tsx                # landing
      productos/
        page.tsx              # (futuro) grid
        [slug]/page.tsx       # (futuro) detalle
    (checkout)/
      carrito/page.tsx
      checkout/page.tsx
      pago/exito/page.tsx
      pago/error/page.tsx
      pago/pendiente/page.tsx
    api/
      wompi/
        create-transaction/route.ts
        webhook/route.ts
      addi/
        create-application/route.ts
        webhook/route.ts
    layout.tsx
  components/
    ui/
    marketing/
      hero.tsx
      product-showcase.tsx
      benefits.tsx
      testimonials.tsx
    cart/
      cart-drawer.tsx
      cart-item.tsx
      cart-button.tsx
    checkout/
      checkout-form.tsx
      payment-method-selector.tsx
      wompi-button.tsx
      addi-button.tsx
  lib/
    products.ts
    cart-store.ts
    wompi.ts
    addi.ts
    utils.ts
  types/
    product.ts
    cart.ts
    payment.ts
```

## Modelo de datos: Producto

```ts
type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;              // en COP
  images: string[];
  sizes: string[];
  colors?: string[];
  features: string[];
  stock: number;
  featured: boolean;
};
```

Catálogo por ahora en `src/lib/products.ts` como array constante.

## Convenciones de código

- Respetar convenciones ya usadas por el proyecto.
- **Server Components por defecto**, `"use client"` solo donde sea necesario.
- **API Routes** para creación de transacciones de pago.
- **Nunca hardcodear precios ni textos de producto.**
- **NO tocar el footer existente.**
- **NO agregar dependencias** sin justificarlas.
- Commits: convencional (feat, fix, chore, refactor).

## Integración de Wompi

Wompi es la pasarela de Bancolombia. Cubre tarjetas de crédito/débito, PSE, Nequi y Bancolombia Transfer.

**Flujo:**
1. Usuario arma carrito → va al checkout.
2. Llena datos (nombre, cédula, email, teléfono, dirección).
3. Selecciona "Pagar con Wompi".
4. Backend (`/api/wompi/create-transaction`) genera referencia única y calcula la **firma de integridad** SHA256:
   ```
   integritySignature = SHA256(referencia + monto_en_centavos + moneda + secreto_integridad)
   ```
5. Frontend renderiza el **Widget o Web Checkout** de Wompi con:
   - `public-key`, `currency`, `amount-in-cents`, `reference`, `signature:integrity`, `redirect-url`.
6. Usuario paga en la UI de Wompi.
7. Wompi notifica al backend por **webhook** (`/api/wompi/webhook`) con eventos `transaction.updated`. **Validar firma del webhook.**
8. Redirección a `/pago/exito`, `/pago/error` o `/pago/pendiente`.

**El secreto de integridad NUNCA va en el frontend.**

## Integración de Addi

Addi es "compra ahora, paga después" en cuotas sin tarjeta de crédito. Excelente para aumentar conversión en tickets medios/altos.

**Flujo:**
1. Usuario selecciona "Pagar en cuotas con Addi" en el checkout.
2. Backend (`/api/addi/create-application`) crea una aplicación en Addi con los datos del carrito y del cliente.
3. Addi devuelve una URL para redirigir al cliente.
4. Cliente completa el proceso en Addi (validación de identidad, selección de cuotas).
5. Addi notifica al backend por **webhook** (`/api/addi/webhook`) con el resultado.
6. Redirección al sitio según el estado.

**Nota:** Addi requiere aprobación comercial previa (KYC) antes de estar operativo en producción.

## Selector de método de pago

En el checkout, ambos métodos aparecen como opciones independientes:

- 💳 **Pagar con Wompi** — tarjeta, PSE, Nequi, Bancolombia
- 🕒 **Pagar en cuotas con Addi** — sin tarjeta de crédito

Cada método tiene su propio componente (`wompi-button.tsx`, `addi-button.tsx`).

## Variables de entorno

```
NEXT_PUBLIC_SITE_URL=

# Wompi
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
WOMPI_INTEGRITY_SECRET=
WOMPI_EVENTS_SECRET=

# Addi
ADDI_CLIENT_ID=
ADDI_CLIENT_SECRET=
ADDI_ALLY_SLUG=
ADDI_ENV=sandbox

# Contacto
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

**Las llaves reales se agregarán después**, cuando el usuario cree las cuentas en Wompi y Addi. El código debe:
- Crear `.env.local.example` con los nombres (sin valores).
- Manejar elegantemente el caso "credenciales no configuradas" en desarrollo (ej: mostrar aviso claro "Wompi no configurado — agrega `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` en `.env.local`" en vez de crashear).
- No inventar valores dummy que parezcan reales.

## Roadmap por fases

### Fase 1 — Landing profesional con producto destacado
- Header con logo, navegación mínima e ícono de carrito.
- Hero impactante con foto de la faja + CTA "Comprar ahora".
- Sección de producto con galería, descripción, selector de talla, "Agregar al carrito" (por ahora toast).
- Sección de beneficios (4 razones).
- Sección de reseñas (placeholders).
- FAQ.
- Footer ya existente (**NO tocar**).

### Fase 2 — Carrito funcional
- Cart drawer al agregar producto.
- Página `/carrito` con listado, cantidades, subtotal, botón "Ir a pagar".
- Estado persistente con Zustand + localStorage.
- Contador en el ícono del header.

### Fase 3 — Checkout + Wompi + Addi
- Página `/checkout` con formulario (React Hook Form + Zod).
- Cálculo de envío (fijo por ahora, ej: $15.000 dentro de Colombia).
- Selector de método de pago (Wompi / Addi).
- Integración con **Wompi**: crear transacción, firma, widget, webhook.
- Integración con **Addi**: crear aplicación, redirección, webhook.
- Páginas `/pago/exito`, `/pago/error`, `/pago/pendiente`.
- Email de confirmación con Resend (opcional).

## Cosas que NO hacer

- No tocar el footer existente.
- No romper lo que ya funciona.
- No agregar librerías pesadas de UI (Material UI, Chakra).
- No hardcodear textos ni precios.
- **Nunca exponer secretos de Wompi ni Addi en el frontend.**
- No implementar features de una fase futura hasta terminar la actual.
- No usar imágenes stock — usar las del proyecto.
- No inventar valores para las llaves de Wompi/Addi.

## Estado actual del desarrollo

**Última sesión:** 2026-09-16

**Milestones completados:** Fase 1 — Landing profesional con producto destacado. Fase 2 — Carrito funcional. Fase 3 — Checkout + Wompi + Addi (integración de código completa; pendiente activar con llaves reales). Catálogo multi-producto — grid `/productos` + detalle `/productos/[slug]`. Auditoría de metadata `localhost` en producción + JSON-LD `Product` para validación de Wompi/Addi.

Decisiones tomadas durante la Fase 1 (se desvían de algunas sugerencias iniciales del stack, respetando lo ya existente en el proyecto):

- El proyecto **no usa carpeta `src/`** — `app/`, `components/`, `lib/`, `types/` están en la raíz. El alias `@/*` apunta a `./*`.
- **Estilos: CSS Modules + variables CSS** (no Tailwind), siguiendo la convención ya establecida por `Navbar.tsx`/`Footer.tsx`. Tailwind sigue instalado pero sin uso activo.
- **No se usa shadcn/ui** (requiere Tailwind). Los componentes de UI (acordeón FAQ, botones, toast) son custom con CSS Modules.
- Marca del sitio: **DILA Diseño Latino** (se corrigió la inconsistencia con "FajasMed" que tenía el `<title>` original).
- Paleta aplicada: blanco `#ffffff` + off-white `#faf7f5` + turquesa `#14b8a6` (elegido entre 3 opciones) + negro suave `#171717`. Se reemplazó la paleta azul médico que existía en `globals.css`. El footer (`--clr-footer-bg`, `--clr-footer-txt`) no se tocó.
- Dependencias instaladas: `zustand`, `react-hook-form`, `zod`, `lucide-react`, `framer-motion`, `clsx`. No se instaló `tailwind-merge` (no aplica sin Tailwind).
- Producto único en catálogo: "Short Moldeador Alta Compresión", $89.900 COP, tallas S/M/L/XL — ver `lib/products.ts`.
- Se creó `.env.local.example` con las variables de Wompi/Addi (sin valores) y se ajustó `.gitignore` para permitir commitear ese archivo de ejemplo pese al patrón `.env*`.
- El footer **no se tocó** (confirmado sin diff). El anchor `#contacto` de Navbar/Footer no tiene sección propia todavía — no se creó una sección de contacto porque no estaba en el roadmap de Fase 1.

Decisiones y notas de la Fase 2:

- Store de carrito en `lib/cart-store.ts` (Zustand + `persist` en localStorage, clave `dila-cart`). Usa `skipHydration: true` + `useCartStore.persist.rehydrate()` en un `useEffect` de `Navbar.tsx` para evitar mismatch de SSR/CSR — si se agrega otro componente que necesite el carrito hidratado antes que el Navbar, hay que llamar `rehydrate()` ahí también.
- El drawer (`components/cart/CartDrawer.tsx`) vive en `app/layout.tsx` (renderizado siempre, controlado por `isOpen` del store) y usa `framer-motion` para la animación.
- "Agregar al carrito" en `ProductSection.tsx` ya no muestra un toast local (era el placeholder de Fase 1) — ahora hace `addItem()` real y abre el drawer.
- Página `/carrito` en `app/(checkout)/carrito/page.tsx` (route group `(checkout)` sin efecto en la URL). Por ahora Subtotal = Total, sin envío — el cálculo de envío fijo es explícitamente Fase 3.
- Botones "Ir a pagar" (drawer y página `/carrito`) apuntan a `/checkout`, que todavía no existe — se crea en Fase 3.
- Verificado end-to-end con Playwright headless (instalado temporalmente en el scratchpad, no quedó como dependencia del proyecto): agregar producto, validación de talla, contador del header, incrementar/decrementar cantidad, subtotal, persistencia tras reload, página `/carrito`, remover ítem. Sin errores de consola.

Decisiones y notas de la Fase 3:

- **Pricing recalculado siempre en el servidor**: `lib/order.ts` (`buildOrderPricing`) reconstruye precio, nombre y validez de talla/cantidad contra `lib/products.ts` a partir de `{ productId, size, quantity }` que manda el cliente — nunca se confía en precio/nombre enviado por el navegador. Envío fijo (`SHIPPING_COST = 15000` en `lib/shipping.ts`, separado de `lib/order.ts` porque este último importa `crypto` de Node y no puede ser importado desde componentes cliente).
- **Wompi** (`lib/wompi.ts` + `app/api/wompi/create-transaction` y `/webhook`): firma de integridad `SHA256(referencia + montoEnCentavos + moneda + WOMPI_INTEGRITY_SECRET)` y checksum de webhook verificados contra la documentación oficial de Wompi (docs.wompi.co) — coinciden exactamente con lo descrito en este archivo. El frontend (`CheckoutForm.tsx`) carga `https://checkout.wompi.co/widget.js` con `next/script` y abre el Widget Checkout (`WidgetCheckout`) solo si `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` está seteada; el resultado (`APPROVED`/`DECLINED`/`PENDING`) llega por el callback de `checkout.open()`, sin necesitar una página intermedia de redirect.
- **Addi** (`lib/addi.ts` + `app/api/addi/create-application` y `/webhook`): **scaffold sin verificar** — no fue posible acceder a la documentación real de la API de Addi (developers.addi.com no resuelve por DNS; el Swagger de `api-docs-sandbox.addi.com` requiere JS/acceso). El flujo OAuth2 client_credentials + `POST /v1/applications` implementado es la forma típica de una integración BNPL, pero los nombres exactos de endpoint/campos están señalados con comentarios `// TODO` / avisos en el código y **hay que confirmarlos contra la doc oficial** cuando el usuario tenga acceso aprobado (KYC) al panel de aliado, antes de ir a producción. Igual para la firma del webhook (`x-addi-signature` HMAC-SHA256 es una suposición razonable, no confirmada).
- **Validación de formulario sin `@hookform/resolvers`**: no se agregó esa dependencia (no estaba instalada y CLAUDE.md pide justificar nuevas dependencias). En su lugar, `CheckoutForm.tsx` usa React Hook Form solo para el registro/estado de campos y valida manualmente con `customerSchema.safeParse()` (definido en `lib/checkout-schema.ts`, reusado también si se agrega validación server-side en el futuro), usando `setError` de RHF para mostrar los mensajes de Zod.
- Campos del formulario: nombre completo, cédula, celular (regex `3\d{9}`), correo, dirección, ciudad. Ciudad se agregó (no estaba explícita en el roadmap) porque Wompi's `shippingAddress` y el envío nacional la necesitan.
- Un solo botón de envío por método de pago (`WompiButton.tsx` / `AddiButton.tsx`, ambos `type="submit"` dentro del mismo `<form>`) — la lógica de "abrir widget" / "llamar a la API y redirigir" vive en `CheckoutForm.tsx` porque necesita `handleSubmit`, `router` y el estado del carrito; los componentes de botón son presentacionales.
- Páginas `/pago/exito`, `/pago/error`, `/pago/pendiente` son wrappers finos (con `<Suspense>`, requerido por `useSearchParams`) de un único componente `components/checkout/PaymentStatus.tsx`. Éxito y pendiente limpian el carrito (`clearCart()`) al montar; error lo deja intacto para que el usuario pueda reintentar. Muestran la referencia (`?ref=`) si viene en la URL.
- No hay persistencia de órdenes (no hay DB en el proyecto todavía) — los webhooks de Wompi/Addi solo validan firma y hacen `console.log` con un `// TODO` indicando dónde conectar la actualización de estado del pedido cuando exista esa capa.
- Probado end-to-end con Playwright headless (scratchpad, no quedó como dependencia): agregar al carrito → checkout → validación de campos inválidos (6 mensajes de error correctos) → envío con Wompi/Addi sin credenciales muestra el mensaje "no configurado" (503) sin crashear → páginas `/pago/exito`, `/pago/error`, `/pago/pendiente` renderizan y muestran la referencia. `npm run build` y `eslint` pasan limpios.
- Nota de lint: el plugin `react-hooks` de `eslint-config-next` (Next 16 / React 19.2) bloquea asignar `window.location.href = ...` dentro de un componente ("Modifying a variable defined outside a component or hook"); se usó `window.location.assign(url)` en su lugar.

Decisiones y notas del catálogo multi-producto (fuera del roadmap de 3 fases, pedido después de la Fase 3):

- **`ProductSection.tsx` dejó de ser "la sección del producto destacado" y pasó a ser el bloque de producto reutilizable.** Ya no llama `getFeaturedProduct()` internamente; recibe `product: Product` como prop **requerida**, más dos props opcionales: `sectionId` (default `"productos"`, el ancla que usa el home) y `headingLevel` (`"h2"` por defecto, `"h1"` en las páginas de detalle, por SEO). La galería, el selector de talla, el `addItem()` + `openDrawer()` y los trust badges quedaron intactos — no se duplicó nada.
- Call sites actualizados: `app/page.tsx` pasa `getFeaturedProduct()`; `app/producto/short-moldeador-alta-compresion/page.tsx` (ruta legacy del commit de validación de Addi) ahora resuelve con `getProductBySlug()` + `notFound()` en vez de renderizar el componente sin props. **Esa URL se mantiene estable a propósito** porque puede estar registrada en el panel de Addi — el catálogo nuevo vive en `/productos/[slug]`, en paralelo.
- **Nuevo route group `(marketing)`** (antes no existía; el home sigue siendo `app/page.tsx` en la raíz, no se movió). Contiene `productos/page.tsx` (grid) y `productos/[slug]/page.tsx` (detalle), ambos Server Components — la interactividad vive solo dentro de `ProductSection`, que ya era `"use client"`.
- El grid usa `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`, así que absorbe 2, 3 o N productos sin tocar CSS. Cada card muestra badge "Destacado" (`featured`) o "Agotado" (`stock <= 0`), con "Agotado" teniendo prioridad.
- Detalle: `generateStaticParams()` pre-genera un route por producto de `lib/products.ts` (SSG, confirmado en el output de `next build`), `generateMetadata()` arma title/description/canonical/openGraph por producto, y slug inexistente → `notFound()` (404 verificado). Debajo del bloque de producto hay una sección "Sobre esta prenda" que por fin usa `longDescription` (hasta ahora el campo existía en el tipo pero no se renderizaba en ninguna parte) más un `<dl>` de specs (precio, tallas, colores si los hay, disponibilidad).
- **Navbar:** "Productos" y el CTA "Ver fajas" pasaron de `#productos` a `/productos`, en desktop y en el menú móvil (4 links en total). Los enlaces "Ver el short DILA" / "Seguir comprando" en `/carrito` y "Ver el short DILA" en `/checkout` (los que se muestran con el carrito vacío, o para seguir comprando) también se cambiaron de `/#productos` a `/productos`. La sección del home conserva el `id="productos"`, así que los anchors que quedan (CTA del `Hero`, y los del footer que no se tocan) siguen funcionando.
- Verificación: se inyectó temporalmente un segundo producto en `lib/products.ts`, se corrió `next build` + `next start` y se comprobó por HTTP que el grid lista ambos, que `generateStaticParams` emite las 2 rutas, que el detalle del producto nuevo renderiza `<h1>`, specs, "Agotado" y `longDescription`, y que un slug inválido da 404. Después se revirtió con `git checkout lib/products.ts` — **el array quedó con el único producto real**. `npm run build` y `eslint` pasan limpios. El footer sigue sin diff.

Auditoría de metadata en producción (localhost persistente) + JSON-LD para validación de Wompi/Addi:

- **Causa raíz confirmada del `localhost` en `canonical`/`og:url`/`og:image`:** `NEXT_PUBLIC_SITE_URL` se inyecta en el bundle en **build time**, no en runtime. El problema no era el código (que ya usaba `process.env.NEXT_PUBLIC_SITE_URL ?? fallback` correctamente), sino que un "Redeploy" en Vercel puede reutilizar el build cacheado (checkbox "Use existing Build Cache", marcado por defecto) y ese build cacheado nunca vuelve a leer variables de entorno nuevas — el bundle sigue con el valor con el que se compiló la primera vez. **Fix:** al cambiar una variable `NEXT_PUBLIC_*` en Vercel, hay que forzar un build nuevo sin cache (destildar "Use existing Build Cache" en el redeploy, o hacer un commit/push nuevo) — un simple "Redeploy" del mismo build no alcanza. Verificado localmente compilando con `next build` dos veces: con `NEXT_PUBLIC_SITE_URL` seteada el HTML generado usa `https://www.fajasdila.com` en `canonical`/`og:url`/`og:image`/`twitter:image`; sin la variable (simulando el build cacheado) cae al fallback, sin `localhost` en ningún caso.
- Se encontró (y revirtió) un intento de arreglo manual fuera de esta sesión: **`.env.local.example` tenía un valor real** (`NEXT_PUBLIC_SITE_URL=https://www.fajasdila.com`) hardcodeado en el working tree, sin commitear. Ese archivo **no lo lee Next.js en ningún momento** (ni en local ni en Vercel) — es solo una plantilla para que un dev copie a `.env.local` — así que editarlo no tenía ningún efecto real y violaba la convención explícita de este archivo ("sin valores"). Se revirtió con `git checkout` a su estado committeado (vacío).
- El fallback hardcodeado de `app/layout.tsx` (`?? "https://www.fajasdila.com"`, agregado en el commit `a752ccd` fuera de esta sesión) se mantuvo pero se extrajo a `lib/utils.ts` (`getSiteUrl()`), reusado también por el nuevo JSON-LD de producto — un solo lugar con esa lógica en vez de dos. **Ojo:** ese fallback es una red de seguridad para la metadata pública, no un reemplazo de confirmar que la variable de entorno realmente llega al build — si el build-cache de Vercel sigue sin recoger `NEXT_PUBLIC_SITE_URL`, el sitio *parece* correcto (porque el fallback coincide con el dominio real) pero la variable seguiría rota para cualquier otro uso futuro. Otras variables `NEXT_PUBLIC_*` sin fallback bondadoso (ej. `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`) **no** tienen esta red de seguridad — si el mismo problema de build-cache les pega, el Widget de Wompi mostraría "no configurado" en producción con la key ya seteada en Vercel. Recomendado confirmar en el dashboard de Vercel que el deployment activo se construyó *después* de guardar la variable.
- **JSON-LD `Product`** agregado en `app/(marketing)/productos/[slug]/page.tsx` (`buildProductJsonLd`), con los campos que pedía el mensaje de validación de Wompi/Addi (precio, disponibilidad, talla, color) — todos tomados de `lib/products.ts`, nada inventado: `name`, `description`, `sku` (= `product.id`), `image` (URLs absolutas — el JSON-LD no pasa por `metadataBase`, hay que armarlas a mano), `brand`, `size`, `color` (solo si el producto lo tiene), y `offers` (`price`, `priceCurrency: "COP"`, `availability` según `stock`, `url`). **No verificado contra un spec oficial de Wompi/Addi** (igual que la integración de Addi de la Fase 3): es Schema.org `Product` estándar según la petición genérica del mensaje de soporte, no una confirmación de que sea exactamente lo que su crawler valida.
- Confirmado que precio, tallas, colores y disponibilidad ya se renderizaban en el HTML servido por el servidor (no dependen de hidratación de cliente) — `ProductSection` es `"use client"` pero Next igual lo renderiza en el HTML inicial. Confirmado también que no existe `robots.txt` (ni en `public/` ni `app/robots.ts`) ni ningún `noindex` en el proyecto — nada bloquea el crawleo.
- Verificado con `npm run build` + `next start` simulando ambos escenarios (con y sin `NEXT_PUBLIC_SITE_URL`) — sin `localhost` en el HTML generado en ninguno de los dos casos. `eslint` limpio.

**Segunda ronda (misma sesión, después de que se commiteó/pusheó el fix anterior):** el usuario reportó que en producción el home ya mostraba el `canonical`/`og:url` correcto, pero `/productos/short-moldeador-alta-compresion` seguía mostrando `localhost:3000`. Se sospechó que `generateMetadata` de `app/(marketing)/productos/[slug]/page.tsx` tenía su propia lógica/fallback separado del de `layout.tsx`. **Auditoría exhaustiva descartó esto:** no existe `lib/seo.ts` ni ningún otro helper de metadata, no hay ningún `localhost` hardcodeado en el repo (`grep -rn "localhost"` solo encuentra el comentario de `lib/utils.ts` citado arriba), y `generateMetadata` de la página de producto usa rutas **relativas** (`canonical: "/productos/${slug}"`, `images: [{ url: product.images[0] }]`) — exactamente lo recomendado, dependiendo del mismo `metadataBase` de `layout.tsx` (vía `getSiteUrl()`), no una reconstrucción manual. Se repitió la verificación pedida (`NEXT_PUBLIC_SITE_URL=https://www.fajasdila.com npm run build && npm run start` + `curl` contra `/productos/short-moldeador-alta-compresion`): **0 ocurrencias de `localhost`**, `canonical`/`og:url`/`og:image` correctos. El commit con este código (`0c4637a`) ya estaba en `origin/main` al momento de la auditoría (confirmado con `git log`/`git branch -vv`) — es decir, **el código ya es correcto y ya está pusheado**; no se tocó nada más.

- **Conclusión: el síntoma reportado en la segunda ronda no es un bug de código.** Si vuelve a aparecer, antes de tocar `generateMetadata` otra vez hay que descartar, en este orden: (1) `curl` directo contra `https://www.fajasdila.com/productos/...` (no contra una herramienta de terceros) para ver el HTML real que sirve el dominio — si ya sale correcto, el problema es de caché de la herramienta de validación (el debugger de Facebook, el inspector de LinkedIn, o el validador de Wompi/Addi cachean por URL y no vuelven a leer la página hasta que se les pide "scrape again"/"refresh"); (2) si el `curl` directo *sigue* mostrando `localhost`, revisar en el dashboard de Vercel qué commit tiene asignado el deployment de Production activo — puede que no sea el más reciente de `main`.

**Tercera ronda (misma sesión):** el validador de Wompi/Addi rechazó `https://www.fajasdila.com/productos/short-moldeador-alta-compresion` con "Esta URL no cuenta con el formato correcto, intenta con otra." Se probó la URL en vivo directamente (`curl` contra producción, no contra el validador) y se encontró un **bug real y confirmado**: el JSON-LD `Product` (y potencialmente el `redirectUrl` de Wompi/Addi tras el pago) tenían un **espacio literal dentro de la URL** — `"offers":{"url":"https://www.fajasdila.com /productos/..."}` (con espacio antes de `/productos`), confirmado byte a byte con `od -c`. Causa raíz: la variable `NEXT_PUBLIC_SITE_URL` en Vercel casi con certeza tiene un **espacio al final** del valor — coincide exactamente con lo que se encontró sin commitear en `.env.local.example` (línea `NEXT_PUBLIC_SITE_URL=https://www.fajasdila.com` con un espacio de más al final, antes del salto de línea), probable copy-paste del mismo valor a ambos lados. El `canonical`/`og:url`/`og:image` no mostraban el problema porque pasan por `new URL()` (via `metadataBase`), que recorta espacios automáticamente por spec — pero `getSiteUrl()` devolvía el string crudo del env var, y el JSON-LD (y los `redirectUrl` de las rutas de Wompi/Addi) lo concatenan a mano sin pasar por `new URL()`.

- **Fix:** `lib/utils.ts` ahora exporta `sanitizeUrl()` (`.trim()` + recorta `/` finales), usado internamente por `getSiteUrl()` y también aplicado en `app/api/wompi/create-transaction/route.ts` y `app/api/addi/create-application/route.ts` (mismo patrón `process.env.NEXT_PUBLIC_SITE_URL ?? ...`, mismo riesgo — un espacio ahí rompería el `redirectUrl` post-pago, más grave que el JSON-LD). Se limpió también el espacio final en `.env.local.example`.
- **Verificado simulando el env var roto** (`NEXT_PUBLIC_SITE_URL="https://www.fajasdila.com " npm run build && npm run start`, con el espacio final tal como está probablemente en Vercel): el JSON-LD, canonical y og:* ya no tienen ningún espacio en ninguna URL. `eslint` limpio.
- **Pendiente de acción del usuario (no se puede hacer desde el código):** entrar al dashboard de Vercel → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` y confirmar/quitar el espacio al final del valor, luego redeploy sin build cache. El fix de código es una red de seguridad, pero limpiar el dato real en Vercel evita que el mismo problema aparezca en otras variables que no tienen esta protección (ej. `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`).
- **No confirmado:** si esto era exactamente lo que el validador de Wompi/Addi estaba rechazando (su formulario probablemente valida el string pegado antes de crawlear el contenido, así que puede ser un chequeo aparte, ej. contra el dominio exacto registrado en su KYC, con/sin `www.`). Se verificó que `https://fajasdila.com` (sin `www`) redirige con 301 a `https://www.fajasdila.com` — si el dominio registrado en Wompi/Addi es sin `www`, vale la pena probar pegando la URL sin `www` directamente. Recomendado contactar al soporte de Wompi/Addi para confirmar el formato exacto que esperan si el reintento sigue fallando después de este fix.

Open Graph Product namespace en la página de detalle (además del JSON-LD, no en vez de):

- Se agregó `og:type=product`, `product:price:amount`, `product:price:currency` y `product:availability` a `app/(marketing)/productos/[slug]/page.tsx`, pedidos por validadores BNPL (Addi, Klarna) que buscan específicamente esa convención en vez de (o además de) JSON-LD.
- **El Metadata API de Next no soporta esto de forma nativa** — dos hallazgos concretos, verificados leyendo el código fuente instalado en `node_modules/next/dist/lib/metadata/`: (1) el tipo `OpenGraph.type` solo acepta `article/book/music.*/profile/website/video.*` — no existe `"product"`; (2) el campo `other` de `Metadata` renderiza `<meta name="...">`, **no** `<meta property="...">`, que es lo que exige la spec de Open Graph — usarlo ahí habría producido tags que un crawler de OG no reconoce como tales.
- **Fix:** se quitó `type: "website"` del `openGraph` de esta página (dejarlo así habría emitido un `og:type=website` que pisa/duplica el nuevo), y se agregó un componente `ProductOpenGraphMeta` que renderiza `<meta property="og:type" content="product" />` + los 3 `product:*` como JSX crudo dentro del body de la página — React 19/Next 16 los hoistea automáticamente al `<head>` (mismo mecanismo que ya hace funcionar un `<title>` anidado). `price` y `stock` salen de `lib/products.ts`, nada inventado.
- Verificado con `next build && next start`: la página de producto tiene exactamente **un** `og:type` (`product`, sin duplicado) más los 3 `product:*`, el resto de OG (`og:title`/`og:url`/`og:image`) intacto, y el JSON-LD de Schema.org de la ronda anterior sigue presente sin cambios. El home (`app/layout.tsx`) se confirmó que sigue con `og:type=website` y sin ningún `product:*` — a propósito, porque no es una página de un solo producto.

## Fase 4 — Auth, persistencia de pedidos y dashboards (fuera del roadmap original, pedida después de la auditoría de metadata)

Primera vez del usuario con bases de datos/MySQL — cada paso se explicó en el chat, no solo se implementó.

**Paso 0-1 (conexión + esquema):** `lib/db.ts` exporta un `pool` de `mysql2/promise` (`createPool`, no `createConnection`) — una sola vez por proceso, reutilizado entre requests, en vez de abrir una conexión nueva por request (Railway tiene un límite de conexiones simultáneas). Lee `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` de `process.env`, con un chequeo al importar que tira un error legible si falta alguna. `lib/db/schema.sql` crea `users` (id, email UNIQUE, password_hash, name, phone, is_admin, created_at) y `orders` (id, reference UNIQUE, user_id FK nullable ON DELETE SET NULL, datos de cliente/envío, `items` JSON, subtotal/shipping_cost/total, payment_method ENUM, status ENUM, created_at, updated_at) — ambas `ENGINE=InnoDB` (requerido para el FK). MySQL real: Railway, host `*.proxy.rlwy.net` con puerto propio, Public Networking activado, base `railway`.
- **Casi se commitea un secreto real:** el usuario pegó las credenciales reales de Railway (incluida `DB_PASSWORD`) en `.env.local.example` — el archivo que el `.gitignore` excluye a propósito del patrón `.env*` para que SÍ se suba a git. Pasó **dos veces** en la misma sesión (una con el password inicial, otra al corregirlo). Se detectó antes de cualquier commit (`git status` solo mostraba cambios sin stage) y se corrigió moviendo los valores a `.env.local` (gitignored) y devolviendo `.env.local.example` a su plantilla vacía. **Si se repite: revisar inmediato con `git diff -- .env.local.example` antes de cualquier commit.**
- Verificado end-to-end con un script Node ad-hoc (`mysql2/promise`, no persistido) contra la base real: conexión, `SHOW TABLES`, `DESCRIBE` de ambas tablas — columnas y el FK (`Key: MUL` en `orders.user_id`) confirmados byte a byte contra el schema.

**Paso 2 (conectar pagos a la BD):** `lib/order.ts` ganó `saveOrder()` (INSERT en `orders` con status `'pending'`, se llama justo antes de contactar a Wompi/Addi en ambas rutas de `create-transaction`/`create-application`) y `updateOrderStatus()` (UPDATE por `reference`, usado en ambos webhooks reemplazando los `// TODO` viejos). `lib/wompi.ts` ganó `mapWompiStatus()` (APPROVED→approved, PENDING→pending, DECLINED/VOIDED/ERROR→declined). Si el INSERT falla, la ruta corta con 500 antes de llamar a la pasarela; si el UPDATE del webhook falla, se responde 500 a propósito (no 200) para que la pasarela reintente en vez de darlo por entregado con el pedido atascado en `pending`. Probado con una transacción de prueba real (llaves Wompi ficticias solo en memoria del proceso, nunca escritas a disco) + un webhook simulado con checksum válido calculado a mano: `pending` → `approved` confirmado en la tabla, luego limpiado.

**Paso 3 (auth):** NextAuth v5 (`next-auth@beta`) + Credentials provider + `bcrypt` (justificados: NextAuth es el estándar de facto en App Router; bcrypt es hasheo de una vía estándar para passwords — nunca se guarda texto plano). `auth.ts` en la raíz (junto a `next.config.ts`, no hay `src/`) exporta `{ handlers, auth, signIn, signOut }`; `authorize()` compara con `bcrypt.compare` contra `users`. Sesión JWT con `id`/`isAdmin` inyectados vía los callbacks `jwt`/`session` (tipos extendidos en `types/next-auth.d.ts`). `app/(auth)/login` y `/registro` + `LoginForm.tsx`/`RegistroForm.tsx`: mismo patrón que `CheckoutForm.tsx` (RHF solo para registro de campos, `zod.safeParse()` manual, sin `@hookform/resolvers`). `app/api/auth/register/route.ts` valida, chequea email duplicado, hashea con `bcrypt.hash(password, 10)`, inserta.
- **Bug encontrado y corregido en el camino:** poner `await auth()` directo en `app/layout.tsx` (para pasarle la sesión al Navbar) volvía **dinámicas todas las páginas del sitio** — incluida `/productos/[slug]`, que estaba en SSG a propósito por la auditoría de metadata. Causa: `auth()` lee cookies, y Next propaga "esto es dinámico" hacia arriba en todo el árbol que envuelve el layout raíz. Fix: `<SessionProvider>` (de `next-auth/react`) envolviendo el layout, y el propio Navbar (ya `"use client"`) usa `useSession()` en vez de recibir la sesión como prop server-side. Confirmado en el output de `next build`: `○`/`●` de vuelta en home/productos/detalle tras el fix.
- `bcrypt` es el paquete nativo (compila un binding en la instalación) — funcionó en local, pero **no se pudo probar en el build real de Vercel**. Riesgo conocido pero infrecuente hoy en día; si falla ahí, la alternativa sin dependencias nativas es `bcryptjs`.
- Checkout: `create-transaction`/`create-application` hacen `await auth()` y pasan `session?.user?.id` a `saveOrder` — nunca un `userId` que mande el cliente. Sin sesión, sigue siendo `null` (invitado).
- Probado end-to-end real: registro → `bcrypt.hash` → login vía `/api/auth/callback/credentials` (con CSRF token) → sesión con `id`/`isAdmin` correctos → pedido creado con sesión activa quedó con `user_id` real en la tabla (no `null`).

**Paso 4 (`/cuenta`):** Server Component protegido con `auth()` + `redirect("/login")` si no hay sesión (confirmado con `curl`: 307 a `/login` sin cookie). Lista pedidos del usuario vía `getOrdersByUserId()` (nueva en `lib/order.ts`), más reciente primero, solo lectura: referencia, fecha, total, badge de estado (`components/orders/StatusBadge.tsx`, reutilizado también por el admin), método de pago, ítems. Se agregó un botón "Cerrar sesión" (`SignOutButton.tsx`) no pedido explícitamente en el roadmap, pero necesario — sin él no había ninguna forma de cerrar sesión en todo el sitio.

**Paso 5 (`/admin/pedidos`):** `app/(admin)/admin/layout.tsx` centraliza el guard (`auth()` + `session.user.isAdmin`) para todo `/admin/*` en vez de repetirlo por página — sin sesión → `/login`, con sesión pero sin ser admin → `/`. Tabla con todos los pedidos (`getAllOrders()`, filtro opcional por `status`), filtro por pestañas vía query string (`?status=`, links normales sin JS) y detalle completo en `/admin/pedidos/[reference]` (`getOrderByReference()`, 404 real si no existe). Probado marcando un usuario de prueba como admin directo en la base (mismo `UPDATE` que el usuario corre en Workbench) — **importante:** el JWT no revisa la base en cada request, así que cambiar `is_admin` de alguien con sesión activa no tiene efecto hasta que esa persona vuelva a iniciar sesión.

**UPDATE para marcarse admin** (el usuario lo corre en Workbench, no se ejecuta desde el código):
```sql
UPDATE users SET is_admin = 1 WHERE email = 'correo@ejemplo.com';
```

---

## Integración de Addi — de scaffold sin verificar a documentación real (sesión posterior a la Fase 4)

El usuario consiguió credenciales de **sandbox** de Addi (`ADDI_CLIENT_ID`, `ADDI_CLIENT_SECRET`, `ADDI_ALLY_SLUG=inversionesdilasas-ecommerce`, `ADDI_ENV=sandbox`) y pidió verificar la integración end-to-end. Esto pasó en dos rondas dentro de la misma sesión: primero una verificación con lo que ya había en el código (scaffold sin confirmar de la Fase 3), después el usuario consiguió **documentación oficial real** de Addi y pidió reescribir la integración completa con eso como fuente de verdad.

### Ronda 1 — verificación del scaffold existente

- **Se encontró y verificó documentación pública real por primera vez**: `https://api-docs-sandbox.addi.com/auth/` es un Swagger público (developers.addi.com sigue sin resolver por DNS, pero esa URL sí). Confirmó que el código anterior tenía DOS problemas: (1) el host de autenticación estaba mal — no es `api-sandbox.addi.com`/`api.addi.com`, es un servicio Auth0 en `auth.addi-staging.com` (staging) / `auth.addi.com` (producción), un dominio completamente distinto al de la API de recursos; (2) faltaba un campo `audience` obligatorio en el body (`https://api.staging.addi.com` / `https://api.addi.com`), sin el cual Auth0 devuelve 403 "Service not enabled".
- Con esos dos fixes, la llamada real a `https://auth.addi-staging.com/oauth/token` con las credenciales del usuario devolvió **401 `access_denied`/`Unauthorized`** — la doc dice que ese código es "credenciales erróneas o server erróneo". Se probó también contra el host viejo (`api-sandbox.addi.com`) para comparar: SÍ resuelve y responde, pero con un formato de error totalmente distinto (`{"code":"000-401",...}`, no el de Auth0) — parece un gateway genérico, no el emisor de tokens real.
- **Hallazgo concreto para el usuario:** el `ADDI_CLIENT_SECRET` que puso en `.env.local` tiene **30 caracteres**; el ejemplo de secreto en la doc oficial de Addi tiene **65**. Verificado byte a byte con `od -c` que no es un problema de cómo se guardó (sin espacios ni caracteres invisibles) — es sospechoso de estar truncado al copiarlo del correo de credenciales. **Recomendado volver a copiarlo completo antes de reintentar**, en cuanto se retome esta verificación.
- Confirmado con logs temporales en el propio `npm run dev` (no un script aislado) que `ADDI_CLIENT_ID`/`ADDI_CLIENT_SECRET`/`ADDI_ALLY_SLUG`/`ADDI_ENV` sí cargan en runtime, y que el 503 "Addi no configurado" ya no aparece — el request llega hasta Addi real.

### Ronda 2 — reescritura completa contra documentación oficial que pegó el usuario

El usuario interrumpió la Ronda 1 (a mitad de una prueba con Playwright) para pasar documentación oficial nueva y pidió tratarla como fuente de verdad, reemplazando cualquier suposición anterior. Cambios reales, todos verificados:

- **Nuevo `getAllyConfig()` en `lib/addi.ts`**: `GET https://channels-public-api.addi.com/allies/{ADDI_ALLY_SLUG}/config?requestedamount={monto}` — público, sin auth. Devuelve `minAmount`/`maxAmount`/`isActiveAlly`/`isActivePayNow` y `policy.discount` (informativo, **nunca se resta del monto real enviado a Addi**). **Probado con una llamada real**: con el `ally_slug` del usuario devolvió `{"minAmount":50000,"maxAmount":3000000,"discount":0,"isActiveAlly":true,"isActivePayNow":false}` — confirma que el `ally_slug` es correcto y que el problema de la Ronda 1 es específicamente del flujo OAuth, no de la cuenta.
- Nuevo endpoint propio `app/api/addi/config/route.ts` (proxy del anterior, para no exponer `ADDI_ALLY_SLUG` como `NEXT_PUBLIC_*`) consumido desde `PaymentMethodSelector.tsx`: si el monto está fuera de rango o `isActiveAlly` es `false`, el radio de Addi se deshabilita (no se oculta) y muestra un disclaimer con el rango en pesos; si hay descuento, se muestra como badge visual. **El mismo chequeo se repite server-side** en `app/api/addi/create-application/route.ts` (nunca confiar en que el cliente ya validó el rango) — devuelve 400 si está fuera de rango, 502 si `getAllyConfig()` falla.
- **Token nuevo por transacción**: ya era así (no había caché de módulo) — se dejó documentado explícitamente en el código para que quede claro que es a propósito, no un descuido.
- **`order.reference` único por intento**: ya lo era (`generateOrderReference()` se llama de cero en cada `buildOrderPricing()`, incluso si el cliente reintenta con el mismo carrito) — no fue necesario tocar `lib/order.ts`.
- **Respuesta 301 sin body**: `createAddiApplication()` ahora usa `fetch(..., { redirect: "manual" })` y lee la URL de redirección del header `Location`, no de un JSON. `callbackUrl` (`{siteUrl}/api/addi/webhook?ref={reference}`) y `redirectionUrl` (`{siteUrl}/pago/addi/retorno?ref={reference}`) se construyen dinámicamente por transacción y van dentro del body, tal como confirmó el usuario.
- **Nueva página `/pago/addi/retorno`** (`app/(checkout)/pago/addi/retorno/page.tsx` + `AddiRetornoStatus.tsx`): Server Component que consulta `getOrderByReference()` por el `?ref=` y muestra contenido según el status real guardado en la base (el webhook debería haber llegado antes que el cliente sea redirigido, según la doc). **Nota:** el mensaje del usuario que pedía esto se cortó a mitad de frase ("...el status ya debería—") — se implementó una versión razonable (mapeo de los 4 estados de Addi + `pending`/`in_process` como fallback "todavía confirmando", sin polling automático) pero **queda pendiente que el usuario confirme si el comportamiento esperado es otro** (ej. si necesita refrescar solo o reintentar la consulta).
- **Webhook reescrito** (`app/api/addi/webhook/route.ts`): Basic Auth con `ADDI_WEBHOOK_USER`/`ADDI_WEBHOOK_PASSWORD` (credenciales separadas de `ADDI_CLIENT_ID`/`SECRET`, "Credenciales de notificación" del panel de aliado — el usuario las va a conseguir y pasar) reemplaza el guess anterior de HMAC vía `x-addi-signature`, que nunca estuvo verificado. **Falla cerrado**: sin esas dos env vars configuradas, responde 401 en vez de aceptar notificaciones sin autenticar (a diferencia del resto de la integración, que falla "elegante" — se decidió así porque este endpoint escribe estado de pedidos, y aceptar POSTs sin auth por defecto sería un hueco de seguridad real). La `reference` se lee de `?ref=` en la query string (no del body — así se construyó `callbackUrl`), y el endpoint responde 200 con **exactamente el mismo body JSON que recibió** (confirmado con `curl`: el eco es byte-idéntico). `updateOrderStatus()` es un `UPDATE ... WHERE reference = ?`, idempotente por diseño — verificado enviando el mismo webhook dos veces: una sola fila, mismo resultado final, sin duplicar.
- **`OrderStatus` y el ENUM de `orders.status`** ganaron `'rejected'` y `'abandoned'` (estados reales de Addi, confirmados por el usuario: `approved | rejected | declined | abandoned`). `'in_process'` se mantiene para Wompi (Addi no lo usa). `lib/db/schema.sql` ya quedó actualizado para instalaciones nuevas; para la base ya existente se dejó `lib/db/migrations/001_add_addi_statuses.sql` con el `ALTER TABLE` exacto — **no se ejecutó**, el usuario lo corre en Workbench. `mapAddiStatus()` y `StatusBadge`/`STATUS_LABELS` (`/cuenta` y `/admin/pedidos`) se actualizaron para los dos estados nuevos.
- `approvedAmount` (debería ser `0` salvo cuando `status === 'approved'`, en cuyo caso = monto solicitado, sin aprobaciones parciales): se agregó como validación de solo-log (`console.warn` si no cuadra) — no hay columna en `orders` para persistirlo, no se agregó una sin que el usuario la pida.
- Verificado con Playwright (Chromium instalado temporalmente en el scratchpad de la sesión, no quedó como dependencia — la versión más nueva de Playwright no soporta macOS 13/Ventura, se usó `playwright@1.45.0`) el flujo completo carrito → checkout → llenar formulario → seleccionar Addi (sin disclaimer, porque $145.000 está dentro del rango $50.000–$3.000.000) → enviar: el mensaje ya NO es "Addi no configurado" (503), es "No se pudo iniciar el proceso con Addi" (502) — exactamente lo esperado dado que el problema real es el 401 de credenciales de la Ronda 1, no un problema de configuración ni del código nuevo.

### Ronda 3 — credenciales nuevas + endpoint de creación de transacción confirmado

El usuario pasó un `client_id`/`client_secret` nuevos ("los reales", distintos a los de la Ronda 1) y la URL de docs de auth que había prometido: `https://api-docs.addi-staging.com/auth/#/authentication`.

- **La doc de auth es idéntica a la ya verificada en la Ronda 1** (diff línea por línea del spec descargado: mismos hosts `auth.addi-staging.com`/`auth.addi.com`, mismo `audience`). No hubo que tocar nada de la autenticación.
- **Hallazgo importante con las credenciales nuevas**: contra `auth.addi-staging.com` (staging), Auth0 devuelve un error específico — `"Invalid domain 'auth.addi-staging.com' for client_id '...'"`. Probando el mismo par contra `auth.addi.com` (producción) con `audience: https://api.addi.com`, **sí autenticó y devolvió un `access_token` real**. Es decir: **este `client_id`/`client_secret` están registrados en Addi solo para el ambiente de PRODUCCIÓN**, no para staging, aunque el usuario dijo que se los dieron "para prueba". Se le mostró esto al usuario antes de seguir; su respuesta fue "me pasaron estas para prueba" — se tomó como confirmación de seguir tratándolas como credenciales de prueba autorizadas por Addi, pero **la inconsistencia queda documentada y sin resolver**: no se sabe si así es como Addi configura sandbox para este aliado, o si le dieron el par equivocado.
- **Endpoint de creación de transacción CONFIRMADO** contra la doc real que pegó el usuario (`.../integration/#/online%20application/createOnlineLoanApplication`): `POST /v1/online-applications` en un host TERCERO, distinto tanto del de auth como del `audience` — `https://api.addi-staging.com` (staging) / `https://api.addi.com` (producción). Body confirmado: `orderId` (UUID por intento — se genera con `randomUUID()`, distinto de nuestra `reference` interna, que se usa solo en `callbackUrl`/`redirectionUrl`/nuestra BD), `totalAmount`/`shippingAmount`/`totalTaxesAmount` como **string** con un decimal, `items[].quantity` también string, `callbackUrl`/`redirectionUrl` **anidados** dentro de `allyUrlRedirection` junto con un `logoUrl` obligatorio, y `pickUpAddress` requerido (se reusa la misma dirección de envío, porque el checkout no tiene recogida en tienda física). Respuesta confirmada: HTTP 301 sin body, URL en `Location` — ya implementado con `redirect: "manual"`.
- **Mapeos con aproximaciones honestas, no inventadas** (documentadas en comentarios de `lib/addi.ts`):
  - `firstName`/`lastName`: el checkout solo pide "nombre completo" — se parte por la primera palabra (nombre) vs. el resto (apellido). Funciona para "Juan Pérez", es una aproximación para nombres compuestos de 3+ palabras. Solución real a futuro: separar el campo en el formulario.
  - `totalTaxesAmount`: `"0.0"` — `lib/order.ts` no desglosa impuestos (los precios ya incluyen IVA), no se inventó un valor.
  - `pictureUrl`/`category`/`brand`: se usa la imagen real del producto (`lib/products.ts`) con la URL absoluta del sitio, `category: "ropa"` (descripción real del producto, no un placeholder) y `brand: "DILA Diseño Latino"` (la marca real de la tienda).
  - `geoLocation`: el checkout no pide permiso de ubicación al navegador — se usan coordenadas fijas de Bogotá como placeholder, marcado con un `TODO` explícito en el código porque si Addi usa esto para scoring de riesgo/fraude, un valor fijo podría afectar aprobaciones reales.
- **No se probó la llamada real a `/v1/online-applications`** — con `ADDI_ENV=sandbox` (como está el proyecto), el request falla antes, en el paso de auth (mismo error `Invalid domain` de arriba), así que no hay forma de probar este endpoint específico sin cambiar a `ADDI_ENV=production` con datos de un pedido real — y eso no se hizo sin luz verde explícita del usuario, porque implicaría crear una solicitud de crédito real en el sistema en vivo de Addi. Sí se armó y se le mostró al usuario el payload JSON exacto que se enviaría (con datos de ejemplo, generado con un script que replica la lógica de `lib/addi.ts` sin llamar a la red), y se confirmó con una llamada real a través de la app (`ADDI_ENV=sandbox`, sin tocar producción) que el nuevo código llega correctamente hasta `getAccessToken()` y falla en el mismo punto de siempre — no se introdujo ninguna regresión.
- **Sigue pendiente, explícitamente marcado como TODO en el código** (el usuario los va a pegar del mismo Swagger que ya tiene abierto): el schema exacto de `OnlineLoanApplicationCallbackRequest` (lo que Addi manda a nuestro webhook) y `CallbackInformationResponse` (lo que Addi espera de vuelta) — el nombre de este último sugiere que podría NO ser un simple eco del body, lo cual contradiría la instrucción anterior de "responder con el mismo body recibido"; el webhook actual sigue haciendo eco hasta que se confirme lo contrario.
- El usuario también mencionó al final de un mensaje anterior una doc de "cancelación de aplicación online" sin dar contexto de para qué la necesita — no se implementó nada al respecto todavía.

### Qué queda pendiente (no asumir que sandbox = producción sin volver a probar)

1. **La inconsistencia sandbox/producción de las credenciales actuales** (ver Ronda 3) sigue sin resolver — confirmar con Addi si es intencional.
2. **No se ha probado una sola vez la llamada real a `/v1/online-applications`** — todo lo de `createAddiApplication()` está implementado contra la doc oficial pero nunca ejecutado contra el servidor real de Addi.
3. **`OnlineLoanApplicationCallbackRequest`/`CallbackInformationResponse`**: schema del webhook real pendiente de confirmar — ver TODO en `app/api/addi/webhook/route.ts`.
4. **`ADDI_WEBHOOK_USER`/`ADDI_WEBHOOK_PASSWORD`**: el usuario todavía no las consigue del panel de aliado — sin ellas, el webhook real de Addi va a recibir 401 de nuestro lado.
5. **`ALTER TABLE` de `lib/db/migrations/001_add_addi_statuses.sql`**: no se corrió — pendiente en Workbench.
6. **Página `/pago/addi/retorno`**: implementada con una interpretación razonable de una instrucción que se cortó a mitad de frase en la Ronda 2 — confirmar con el usuario si el comportamiento es el esperado.
7. **Cancelación de aplicación online**: mencionada sin contexto — no implementada.
8. **Nunca se probó con `ADDI_ENV=production` de forma consciente/autorizada** — antes de ir a producción de verdad, repetir esta misma verificación (auth, config, creación de aplicación, webhook) confirmando explícitamente con el usuario cada vez que una llamada vaya a tocar el sistema en vivo de Addi.

### Ronda 4 — auth unificado confirmado por Addi + primera llamada real a staging + hallazgo de `.env` con `$`/`#`

Addi le confirmó al usuario (soporte, no doc pública) que **el servidor de auth y el `audience` (`auth.addi.com` + `https://api.addi.com`) son los mismos para sandbox y producción** — no dependen de `ADDI_ENV`. Lo único que distingue el ambiente es el host de `/v1/online-applications` (`api.addi-staging.com` vs `api.addi.com`), que ya estaba bien implementado. Se simplificó `lib/addi.ts`: `ADDI_AUTH_URL`/`ADDI_AUTH_AUDIENCE` ahora son constantes fijas, sin rama por `ADDI_ENV`.

- **Confusión de credenciales resuelta (parcialmente):** el usuario cree que el par `4xUdl0MQ...`/secret de 30 caracteres es "el de prueba" y `m4ZpTlv2...`/secret de 64 caracteres es "el real (producción)". Técnicamente eso no aplica — como el auth es unificado, ningún par de credenciales es intrínsecamente "de sandbox" o "de producción"; el ambiente lo determina el host que llamamos nosotros. Y en la práctica, **el par `4xUdl0MQ...` nunca autenticó ni una sola vez** en ningún test (siempre 401, contra cualquier host) — es casi seguro que su secret está incompleto. El único par funcional es `m4ZpTlv2...`.
- **Bug real encontrado en `.env.local`, no específico de Addi:** el usuario pegó `ADDI_WEBHOOK_PASSWORD` con `$` y `#` sin comillas. `@next/env` (el cargador de env de Next.js) trata `$NOMBRE` como interpolación de otra variable (la reemplaza por `""` si no existe) y `#` como inicio de comentario fuera de comillas — la contraseña real de 32 caracteres se cargaba como `d^bjzzZWh@`, 10 caracteres, silenciosamente. **Fix:** envolver en comillas simples Y escapar el `$` como `\$` — confirmado con `@next/env`'s `loadEnvConfig()` directamente (no una simulación) que así carga byte a byte igual al valor real. **Cualquier secreto futuro con `$`, `#`, comillas o backslash necesita este mismo tratamiento** en `.env.local`/Vercel.
- **Primera llamada real a `POST https://api.addi-staging.com/v1/online-applications`** (mostrando la URL exacta al usuario antes de cada disparo, con su confirmación explícita en cada paso): el token se obtiene bien (200, `aud: https://api.addi.com` confirmado decodificando el JWT), pero el host de staging responde **401** con un formato de error genérico de gateway (`{"code":"000-401","message":"La solicitud carece de credenciales válidas de autenticación"}`), no el formato de error de Auth0. Como diagnóstico de bajo riesgo (mismo host de staging ya aprobado, solo cambiando el `audience` del token) se probó pedir un token con `audience: https://api.staging.addi.com` (el valor documentado originalmente en el Swagger de auth, antes de que el usuario confirmara que era unificado) — Auth0 respondió `403 "Service not enabled within domain: https://api.staging.addi.com"`, es decir, **este client_id ni siquiera está habilitado para ese audience alterno**.
- **Conclusión de esta ronda:** el host de staging de `/v1/online-applications` parece rechazar un token cuyo `aud` es `https://api.addi.com` (el único que este client_id puede obtener), y no hay forma de pedir un token con otro `aud` porque Auth0 lo rechaza como "servicio no habilitado". Esto huele a algo del lado de Addi (el ambiente sandbox de este aliado no está del todo aprovisionado, o el client_id necesita habilitarse también para el audience de staging) — no es algo resoluble solo con cambios de código. **Recomendado preguntarle directamente a Addi**: por qué `api.addi-staging.com` rechaza un token con `aud: https://api.addi.com` si ese es el único audience habilitado para este client_id.

**Próximo paso al retomar:** (1) llevarle a Addi el hallazgo exacto de arriba (el 401 genérico de `api.addi-staging.com` + el 403 "Service not enabled" al pedir el audience alterno) para que confirmen si falta aprovisionar algo en su lado; (2) que el usuario pegue `OnlineLoanApplicationCallbackRequest`/`CallbackInformationResponse` del Swagger de integración; (3) correr `lib/db/migrations/001_add_addi_statuses.sql` en Workbench (`ADDI_WEBHOOK_USER`/`PASSWORD` ya están en `.env.local`, con el fix de escapado). Fuera de esto, sigue pendiente de la ronda de metadata anterior: confirmar en Vercel que `NEXT_PUBLIC_SITE_URL` no tiene espacios y que el deployment activo se construyó después de cualquier cambio a esa variable, conseguir llaves reales de Wompi (sandbox) y probar el Widget Checkout end-to-end, y (fuera de roadmap) email de confirmación con Resend.
