# AccesoriosMagi

Tienda online para el emprendimiento de Magali: catálogo, carrito, checkout con Mercado Pago, panel admin y WhatsApp.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Persistencia local en `data/store.json` (lista para desarrollo / MVP)
- Migraciones Supabase listas en `supabase/migrations/` para producción
- Mercado Pago Checkout Pro
- WhatsApp: [11 3578-7669](https://wa.me/5491135787669)

## Empezar

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Admin

- URL: `/admin/login`
- Contraseña por defecto: `magiadmin` (cambiá `ADMIN_PASSWORD` en `.env.local`)

## Variables de entorno

Ver `.env.example`:

- `NEXT_PUBLIC_WHATSAPP=5491135787669`
- `MP_ACCESS_TOKEN` — token de Mercado Pago (sin esto el checkout queda en modo demo)
- `NEXT_PUBLIC_SITE_URL` — URL pública (necesaria para back_urls y webhooks)
- Credenciales Supabase (opcionales por ahora)

## Deploy en Vercel

1. Subí el repo a GitHub / conectalo en Vercel
2. Configurá las env vars del `.env.example`
3. Webhook de Mercado Pago: `https://TU-DOMINIO/api/webhooks/mercadopago`

> En Vercel el filesystem es efímero: para producción conectá Supabase aplicando las migraciones y migrá el catálogo desde el admin o el seed SQL.
