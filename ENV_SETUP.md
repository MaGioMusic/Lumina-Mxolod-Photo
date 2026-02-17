# Environment Setup (Required)

## 1) Database (Prisma)
Set `DATABASE_URL` in your environment.

Example:

`DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public`

Without this, `/api/properties` falls back to an empty list in non-configured environments.

## 2) Auth (NextAuth)
Set both:

- `NEXTAUTH_SECRET` (strong random secret)
- `NEXTAUTH_URL` (deployment URL, e.g. `https://your-domain.com`)

Without these, auth logs warnings and should not be considered production-ready.

## 3) Verification
After setting env vars:

1. `npm run prisma:generate`
2. `npm run build`
3. Open `/api/properties` and verify non-empty/expected data
