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

**Milestones completados:** Fase 1 — Landing profesional con producto destacado. Fase 2 — Carrito funcional. Fase 3 — Checkout + Wompi + Addi (integración de código completa; pendiente activar con llaves reales). Catálogo multi-producto — grid `/productos` + detalle `/productos/[slug]`.

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

**Próximo paso al retomar:** conseguir llaves reales de Wompi (sandbox) y probar el Widget Checkout end-to-end con una transacción de prueba; cuando Addi apruebe el acceso de aliado, confirmar contra su documentación real los endpoints/payloads de `lib/addi.ts` y ajustar. Fuera de roadmap explícito pero pendiente a futuro: persistencia de órdenes (hoy los webhooks no tienen dónde escribir el estado del pedido) y email de confirmación con Resend (mencionado como opcional en Fase 3).
