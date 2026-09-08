# Accesorios Tortugas Online

Tienda online conectada a Supabase + deploy en Vercel.

## URLs

| Dónde | Tienda | Admin (cargar productos) |
| --- | --- | --- |
| Local | http://localhost:3000 | http://localhost:3000/admin/login |
| Producción (Vercel) | https://proyect-magi.vercel.app | https://proyect-magi.vercel.app/admin/login |

Login admin (igual en las dos):
- Email: `vildozasara10@gmail.com`
- Contraseña: `Maitena1`

No hace falta un login distinto por URL: es el mismo usuario. Cada dominio guarda su propia sesión (cookie).

## Variables importantes en Vercel

- `NEXT_PUBLIC_SITE_URL=https://proyect-magi.vercel.app`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (obligatoria para guardar productos/fotos en producción)
- `MP_ACCESS_TOKEN` (Mercado Pago)

## Desarrollo local

```bash
cp .env.example .env.local
# completar keys
npm install
npm run dev
```
