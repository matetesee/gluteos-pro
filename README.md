# Glúteos Pro — Quiz Funnel

Quiz funnel de venta para un programa de entrenamiento de glúteos (nicho fitness femenino),
reconstruido a partir del ángulo de mercado, la estructura y el diseño de
[gluteosappbrazil.site](https://gluteosappbrazil.site) — mismo flujo de portada + 13 preguntas
+ perfil + coach + gate de video + oferta con bonos y garantía, misma paleta blanco/rosa,
mismo layout paso a paso — pero como código propio, sobre el motor config-driven ya usado en
`calistenia-pro`.

## Qué NO se copió tal cual del sitio analizado (y por qué)

- **"Coach Luca" (nombre, foto, credenciales y cifras de seguidores).** El sitio original
  presenta a una persona real/con identidad propia como autoridad del método. Reusar su
  nombre, foto y cifras para avalar un producto distinto sería suplantación de identidad y
  un testimonio falso. En su lugar, esta versión usa una persona ficticia propia
  (`CONFIG.COACH_NAME` / `CONFIG.COACH_TITLE` en `index.html`, ver función `renderCoach()`),
  sin foto (ícono genérico).
- **Fotos de "antes/después" (resultados reales).** Las imágenes `ba1`–`ba6` del sitio
  original son fotos personales (selfies de espejo, ambientes domésticos) de personas
  identificables — muy probablemente sin licencia para que terceros las reusen como prueba
  social de un producto distinto. No se incluyeron. La sección de autoridad/testimonios de
  esta versión usa texto (testimonios redactados propios) en vez de fotos de esas personas.
- **Logo y nombre de marca originales.** Se usa una marca propia, "Glúteos Pro" (mismo patrón
  de naming que `calistenia-pro`), no "Método Glúteos Brasileños" (nombre y copyright del
  sitio analizado).
- **Snippet de Utmify ofuscado de `calistenia-pro`.** Ese `<script>` (base64+XOR) apunta a la
  cuenta de Utmify de ESE proyecto puntual y no pudimos verificar su contenido de forma
  segura, así que no se copió. Queda un comentario placeholder en el `<head>` de
  `index.html` para pegar ahí el snippet real (sin ofuscar) cuando tengan la cuenta de
  Utmify de esta marca.

Lo demás (flujo de 13 preguntas, copy de la oferta, precio $97→$9.90, bonos, FAQ, gate de
video) sigue de cerca la estructura del sitio analizado.

## Estructura
- `index.html` — el quiz completo (motor config-driven, 1 solo archivo, vanilla JS, sin frameworks).
- `server.js` — servidor estático minimalista (sin dependencias) para producción / Railway.
- `package.json` — script `start` que corre `server.js`.
- `images/demo.webp` — la misma foto de demostración del ejercicio (con la flecha "solo hay
  que activar esta zona") del sitio original. Es un gráfico instructivo genérico, no una foto
  personal de nadie, así que se reusó tal cual.
- `images/hero.jpg` — foto de stock libre de derechos (Pexels, uso comercial libre) para la
  página de venta; no es una foto del sitio original.

## Correr en local

```bash
npm start
```

Abrí `http://localhost:3000`.

## Pendiente antes de vender de verdad
- **Checkout real:** el botón "QUIERO MI TRANSFORMACIÓN AHORA" apunta a `#` (placeholder).
  Conectá `STORE` en el bloque `CONFIG` de `index.html` (Shopify, Stripe, etc.) cuando tengas
  la tienda lista.
- **Video de venta (VSL):** todavía no hay video real — se ve un placeholder con botón
  "Pasar sin video →" que lleva directo a la oferta (función `renderVideoGate()` en
  `index.html`). Cuando tengan el video, reemplazá el bloque `sp-video-box` por el embed real.
- **Meta Pixel / Utmify:** todavía no conectados (ver placeholders en el `<head>`). Cuando
  tengan el Pixel ID, agregá el snippet estándar y seteá `META_PIXEL_ID` +
  `META_ACCESS_TOKEN` como variables de entorno en Railway para activar también el envío
  server-side (Conversions API) ya armado en `server.js`.
- **Coach e imágenes:** `CONFIG.COACH_NAME` / `CONFIG.COACH_TITLE` y la foto de portada
  (`IMG.sale_hero`) son genéricos/de stock — si quieren una identidad de marca más elaborada,
  conseguí o generá fotos propias (no reusar las de gluteosappbrazil.site).
- **Precio:** el plan único ($9.90, antes $97) replica el del funnel analizado — ajustalo si
  cambia.

## Editar el quiz
Todo el contenido (marca, precio, pasos del quiz, testimonios, bonos, FAQ) vive en el bloque
`CONFIG` dentro de `index.html`. No hace falta tocar el resto del motor.

## Deploy en Railway
1. Entrá a [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Elegí este repositorio.
3. Railway detecta Node automáticamente (via `package.json`) y corre `npm start`.
4. Cada push a `main` dispara un nuevo deploy automático.
