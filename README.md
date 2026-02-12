# Casa Herenia y Pedro

SPA de alquiler vacacional. **Stack:** Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, Supabase, Framer Motion, next-intl, Vercel AI SDK, Resend.

## Requisitos

- Node.js 18.17+
- npm o yarn

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **OpenAI:** `OPENAI_API_KEY` (Chatbot Aura)
- **Resend:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- **iCal Airbnb:** `AIRBNB_ICAL_URL_1`, `AIRBNB_ICAL_URL_2`, `AIRBNB_ICAL_URL_PACK`
- **TripAdvisor (opcional):** `TRIPADVISOR_API_KEY`

## Scripts

- `npm run dev` — Desarrollo con Turbopack
- `npm run build` — Build producción
- `npm run start` — Servir build
- `npm run lint` — ESLint

## Estructura (scaffolding)

- `app/` — App Router: layout raíz, `[locale]` (es/en), `api/`
- `components/ui/` — BrandHeader y futuros componentes
- `lib/supabase/` — Cliente Supabase (browser + server)
- `stores/` — Zustand (booking-store)
- `types/` — Tipos DB (bookings, reviews, guests)
- `i18n/` — next-intl (request, routing)
- `messages/` — es.json, en.json

## Rutas

- `/es`, `/en` — Inicio y páginas con i18n
- `/api/ical` — Sincronización iCal Airbnb (placeholder)
- `/api/tripadvisor` — Proxy reseñas TripAdvisor (placeholder)
