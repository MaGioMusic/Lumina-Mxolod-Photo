# Lumina Estate Architecture Overview

## Tech Stack
- **Framework**: Next.js 15 App Router with React Server/Client Components
- **Language**: TypeScript (strict mode) with ESLint/Vitest planned for coverage
- **Styling**: Tailwind CSS v4 + custom design tokens, Framer Motion & GSAP for motion
- **Data**: Prisma ORM targeting PostgreSQL (Supabase-compatible) with mock fallback
- **Validation & Forms**: Zod schemas, React Hook Form
- **State & Context**: React Context (theme, auth, favorites, compare) + custom hooks
- **AI & Realtime**: OpenAI Realtime (WebRTC) for voice/chat, experimental Gemini module behind `NEXT_PUBLIC_ENABLE_GEMINI`
- **Tooling & Infra**: next-intl for i18n (ka/en/ru), Google Maps API + Leaflet fallback, MCP servers for automation hooks

## Subsystems

### Public Marketing & Property Search
- Landing (`/`), marketing sections (`/about`, `/market-reports`, `/guides`, etc.), property catalog (`/properties`, `/properties/[id]`), and feature pages (favorites, compare, investors).
- Emphasizes SEO-friendly localized routes, responsive layouts, and map/search experiences backed by mock data until Supabase is connected.

### Authenticated Dashboards & CRM (In Progress)
- Agent/client dashboards (`/agents/dashboard`, `/client/dashboard`), profile workspace (`/profile/**`), property owner tools (`/properties/[id]/dashboard`, `/properties/add`), and settings/logout flows.
- CRM analysis docs outline upcoming multi-tenant features: organizations, leads, deals, tasks, automation, and RLS enforcement once Supabase is wired.

### API Layer
- Next.js Route Handlers under `src/app/api/**` handle listings, favorites, appointments, inquiries, realtime token issuance, etc.
- Currently mixes Prisma-ready repos with mock data helpers; `/api/properties` auto-falls back to mock inventory when `DATABASE_URL` is absent.
- Feature flags (e.g., `NEXT_PUBLIC_ENABLE_GEMINI`) and dev-auth headers (`x-lumina-dev-user`) gate experimental endpoints.

### Database & Persistence Layer
- Defined in `prisma/schema.prisma`: core real-estate entities (Property, Agent, Appointment, Inquiry, Listing, etc.) plus preliminary Organization/OrganizationMembership models for future multi-tenancy.
- Target deployment is Supabase Postgres with Prisma migrations; RLS, soft-delete columns, and audit triggers are planned but not yet active.
- Mock data generators (`src/lib/mockProperties.ts`) support UI/UX work until Supabase provisioning completes.

### AI / Realtime / External Services
- OpenAI Realtime voice/chat powers the property assistant via `/api/realtime/token`.
- Experimental Gemini voice lives in `src/experimental/gemini/**`, only loaded when the feature flag is enabled.
- Google Maps & Leaflet provide geospatial visualization; future integrations include Supabase Edge Functions, automation tooling, and AI-driven CRM insights.

## Data Flow (Current High-Level)
```
(User / Browser)
      ↓
(Next.js 15 App Router: Marketing + Dashboard segments)
      ↓
(Route Handlers / Services: REST APIs, Realtime token, AI adapters)
      ↓
(Prisma Repositories → Postgres / Supabase) ───→ (External APIs: OpenAI, Google Maps, MCP)
```

## Planned / Pending Work
- **CRM Module**: Implement lead/contact/deal/task models, multi-tenant RLS, automation hooks, and dashboards per `docs/crm/analysis-2025-11-05.md`.
- **Supabase Integration**: Provision DATABASE_URL, run Prisma migrations, configure JWT claims + RLS helpers, and replace dev mock auth with Supabase Auth.
- **AI Enhancements**: Finalize Gemini toggle, expand AI toolset (set_filters, property navigation), and surface CRM insights via internal AI assistant.
- **Automation & Observability**: Introduce background jobs (e.g., reminders, materialized view refresh), Semgrep security scanning, and design-system compliance checks referenced in workspace rules.

