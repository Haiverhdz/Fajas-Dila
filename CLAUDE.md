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

**Última sesión:** 2026-07-15

**Milestones completados:** Fase 1 — Landing profesional con producto destacado. Fase 2 — Carrito funcional.

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

**Próximo paso al retomar:** ejecutar la Fase 3 — Checkout + Wompi + Addi (formulario con React Hook Form + Zod, envío fijo, selector de método de pago, integración Wompi/Addi, páginas de resultado de pago). Las llaves de Wompi/Addi todavía no existen — usar `.env.local.example` como referencia y manejar el caso "no configurado" sin crashear.
