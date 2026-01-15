# Supabase RLS Overview (2025-11-15)

## Table Classification
- **Public marketing reads (SELECT open):** `properties`, `images`, `listings`, `property_analytics`, `agents`, `reviews`.
- **User-scoped data (auth.uid filters):** `favorites`, `appointments`, `inquiries`, `search_history`, `notifications`, `mortgage_calculations`, `user_preferences`, `users` (profile updates), `reviews` (write).
- **Organization-scoped data:** `properties` (mutations), `images` (mutations), `listings`, `transactions`, `organizations`, `organization_memberships`.
- **Service-role only:** `_prisma_migrations` (no RLS), `property_analytics` mutations, admin bypass policies on every managed table.

## Policy Highlights
- **Public visibility:** `Public read ...` policies keep marketing pages functional without auth.
- **End-user isolation:** `User owns ...` policies gate CRUD operations to `auth.uid()` while still letting the service role key perform background work.
- **Org-aware workflows:** membership-based policies ensure that only agents/admins belonging to the property’s `organization_id` can create or modify listings, properties, or transactions.
- **Service role bypass:** each business-critical table includes an explicit `auth.role() = 'service_role'` clause so server-side jobs (Prisma, edge functions) retain full access.

## Next Steps
- Expand policies once Supabase Auth is wired (e.g., invite flows, CRM leads).
- Add automated tests/monitors to ensure future migrations keep `rls_enabled = true`.

