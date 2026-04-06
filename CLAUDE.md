@AGENTS.md

# Only — Content Subscription Platform

## Producto

Plataforma de suscripción de contenido (tipo OnlyFans) para el mercado argentino. Creadores suben fotos/videos, fans pagan suscripción mensual en pesos via MercadoPago. Split instantáneo 95% creador / 5% plataforma.

## Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Runtime | React + React Compiler | 19.2.4 |
| Lenguaje | TypeScript (strict) | ^5 |
| Styling | Tailwind CSS | v4 |
| UI Components | shadcn/ui | — |
| Auth | NextAuth.js (Auth.js) v5 | beta |
| Base de datos | Neon PostgreSQL (Vercel Marketplace) | — |
| ORM | Drizzle | — |
| Storage fotos | Vercel Blob (private) | — |
| Video streaming | Cloudflare Stream | — |
| Email transaccional | Resend (Vercel Marketplace) | — |
| Push notifications | Web Push API nativa (VAPID) | — |
| Pagos locales | MercadoPago Marketplace | — |
| Deploy | Vercel (CI via GitHub Actions) | — |

## Estructura del Proyecto

```
src/
├── app/                    # App Router - rutas y páginas
│   ├── (auth)/             # Grupo: login, registro, verificación
│   ├── (platform)/         # Grupo: app autenticada
│   │   ├── @[username]/    # Perfil público del creador
│   │   ├── dashboard/      # Dashboard del creador
│   │   ├── upload/         # Subida de contenido
│   │   └── settings/       # Configuración de cuenta
│   ├── api/                # Route Handlers
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── webhooks/       # MercadoPago webhooks
│   │   └── upload/         # Upload endpoints (R2, Stream)
│   ├── actions/            # Server Actions
│   ├── manifest.ts         # PWA manifest (nativo Next.js)
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Tailwind + global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Feature components
├── lib/
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema
│   │   ├── index.ts        # DB connection
│   │   └── migrations/     # Drizzle migrations
│   ├── auth.ts             # NextAuth config
│   ├── blob.ts             # Vercel Blob client (private store)
│   ├── stream.ts           # Cloudflare Stream client
│   ├── mercadopago.ts      # MercadoPago Marketplace client
│   ├── resend.ts           # Email client
│   └── web-push.ts         # VAPID + push notifications
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript type definitions
```

## Patrones y Convenciones

### General

- Path alias: `@/*` mapea a `./src/*`
- React Compiler está habilitado — NO usar `useMemo`, `useCallback`, `React.memo` manualmente
- Mobile-first: diseñar siempre para celular primero
- Idioma del código: inglés. Idioma de UI: español. URLs en inglés (e.g. /sign-in, /sign-up, /dashboard)

### Server vs Client Components

- Por defecto todo es Server Component
- Usar `'use client'` SOLO cuando se necesita interactividad (useState, useEffect, event handlers)
- Nunca hacer fetch de datos en Client Components — pasar data como props desde Server Components
- Consultar `node_modules/next/dist/docs/` antes de usar cualquier API de Next.js

### Data Fetching

- Server Components para queries directas a DB via Drizzle
- Server Actions para mutaciones (formularios, uploads, etc.)
- Route Handlers solo para webhooks externos (MercadoPago) y endpoints que necesitan request/response raw

### Auth (NextAuth v5)

- Providers: Google OAuth, Twitter/X OAuth, Credentials (email + password)
- NO usar Clerk — decisión explícita del proyecto, usar NextAuth siempre
- Instagram OAuth NO funciona (Basic Display API deprecada dic 2024)
- No hay roles (fan/creator) — todos son usuarios
- Sesiones JWT con duración 30 días
- Protección de rutas via proxy.ts (Next.js 16) con getToken() de next-auth/jwt
- Sin auth → redirige a /sign-in. Con auth en /sign-in o /sign-up → redirige a /

### Base de Datos (Neon + Drizzle)

- Schema definido en `src/lib/db/schema.ts`
- Migraciones con `drizzle-kit`
- Usar transacciones para operaciones que involucren múltiples tablas
- Todas las queries tipadas con Drizzle — NO usar SQL raw salvo que sea estrictamente necesario

### Storage y Contenido

- **Fotos**: upload → compresión con Sharp → WebP → Vercel Blob (private store)
- **Videos**: upload → Cloudflare Stream → transcoding HLS automático
- **Signed URLs**: siempre con expiración de 1 hora — el contenido nunca es accesible por URL directa
- **Thumbnails blur**: generados al subir para mostrar como preview con candado en perfiles no suscritos
- Límites: fotos max 20MB (jpg/png/webp), videos max 2GB (mp4/mov)

### Pagos (MercadoPago Marketplace)

- Split automático instantáneo: 95% al MP del creador, 5% a la plataforma
- Sin botón de retiro — la plata va directo al MP del creador
- Métodos de pago: tarjeta crédito/débito, saldo MP, cuotas
- Webhooks para renovación automática cada 30 días y cancelación
- Al cancelar, el fan mantiene acceso hasta que vence el período

### PWA (Nativa Next.js)

- `app/manifest.ts` para web app manifest — NO usar librerías externas
- Service Worker manual en `public/sw.js`
- Push notifications con Web Push API + VAPID keys — NO usar Firebase
- Instalable en iOS (Safari) y Android (Chrome)

### Styling y Componentes

- Tailwind CSS v4
- shadcn/ui (style: base-nova, primitivas: @base-ui/react) — NO usar Radix, NO usar new-york style
- Instalar componentes con `npx shadcn@latest add <component>`
- TODOS los componentes de UI deben ser de shadcn — nunca crear componentes custom si shadcn tiene uno
- Mobile-first siempre: empezar con diseño mobile, escalar con breakpoints
- Iconos: lucide-react

### Contenido Bloqueado (Patrón Core)

- Perfil sin suscripción: thumbnails con blur CSS + icono candado overlay
- Perfil con suscripción: contenido desbloqueado, sin blur
- La lógica de acceso se resuelve server-side — nunca confiar en el cliente para ocultar contenido
- Las URLs de contenido son siempre signed con expiración

## Lo que NO entra en el MVP

- PPV (pay per view)
- Tips / propinas
- Mensajes directos (DM)
- Live streaming
- Mass messaging
- Analytics avanzados
- Discovery / búsqueda / For You page
- Pagos internacionales (Epoch — se integra post-MVP)
- App nativa iOS/Android

## CI/CD

- GitHub Actions: push a `main` → build → deploy producción a Vercel
- Workflow en `.github/workflows/deploy.yml`
- Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
