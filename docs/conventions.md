# Conventions — Lumina Estate

> Single source of truth for naming, i18n, component patterns, and code style.
> When unsure, follow this file. When this file is wrong, update it before proceeding.

---

## 1. Naming

| Thing | Convention | Example |
|---|---|---|
| React component | PascalCase | `PropertyCard`, `AgentDashboard` |
| File (component) | PascalCase `.tsx` | `PropertyCard.tsx` |
| File (hook) | camelCase, prefix `use` | `usePropertySearch.ts` |
| File (util/lib) | camelCase | `formatPrice.ts` |
| Folder | lowercase-hyphen | `property-details/` |
| Constant | UPPER_SNAKE_CASE | `MAX_PROPERTY_IMAGES` |
| Function | camelCase, verb | `fetchProperties`, `handleSubmit` |
| TypeScript type/interface | PascalCase | `PropertyListItem`, `AgentProfile` |

---

## 2. i18n Rules (CRITICAL)

**Every user-visible string must go through `next-intl`. No exceptions.**

### Message file locations
```
messages/
  ka.json    ← Georgian (primary)
  en.json    ← English
  ru.json    ← Russian
```

### Usage in components
```tsx
// ✅ CORRECT
import { useTranslations } from 'next-intl';
const t = useTranslations('PropertyCard');
return <h2>{t('title')}</h2>;

// ❌ WRONG — hardcoded string
return <h2>იყიდება</h2>;
return <h2>For Sale</h2>;
```

### Adding a new string
1. Add key to ALL THREE message files (`ka.json`, `en.json`, `ru.json`)
2. Use the same key in all files
3. Namespace by component/page: `"PropertyCard.title"`, `"Header.search"`

### Key naming convention
```
"[Namespace].[key]": "value"

Examples:
"PropertyCard.forSale": "იყიდება"
"PropertyCard.forSale": "For Sale"  (en.json)
"Filters.priceRange": "ფასის დიაპაზონი"
```

---

## 3. Component Patterns

### Standard component structure
```tsx
'use client'; // only if needed

import { useTranslations } from 'next-intl';

interface Props {
  // always define props interface
}

export function ComponentName({ prop1, prop2 }: Props) {
  const t = useTranslations('Namespace');

  // hooks first
  // then derived state
  // then handlers
  // then render

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Rules
- **Default export** for pages, **named export** for components
- **TypeScript interfaces** for all props — no implicit `any`
- **Loading states** with skeleton screens (not blank divs)
- **Error boundaries** around components that can fail
- **useEffect cleanup** — always return cleanup function

---

## 4. Directory Structure

```
src/
├── app/               # Next.js App Router pages & layouts
│   ├── (marketing)/   # Public pages (/, /properties, /about, ...)
│   ├── api/           # Route Handlers
│   └── [auth]/        # Auth flows
├── components/        # Reusable UI components (shared)
├── contexts/          # React Context providers (use sparingly)
├── hooks/             # Custom React hooks
├── lib/               # Utilities, configs, helpers
└── types/             # TypeScript types (shared)
```

- Page-specific components → `src/app/(marketing)/properties/components/`
- Shared UI → `src/components/`
- Do **not** create components at the root of `src/`

---

## 5. Tech Stack Quick Reference

| Concern | Tool |
|---|---|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion (primary), GSAP (complex only) |
| Icons | Phosphor Icons (primary) |
| Maps | Google Maps API (primary), Leaflet (fallback) |
| Forms | React Hook Form + Zod |
| i18n | next-intl |
| State | React Context (global) + useState/useReducer (local) |
| DB | Prisma + Supabase Postgres |
| ORM | Prisma (never write raw SQL in components) |

---

## 6. API Route Conventions

```
GET  /api/properties         → list (paginated)
GET  /api/properties/[id]    → single item
POST /api/properties         → create
PUT  /api/properties/[id]    → update
DEL  /api/properties/[id]    → soft delete (set deletedAt)
```

- **Always** return `{ data, error }` shape
- **Always** validate input with Zod
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to client
- **Always** await `params` in dynamic routes (Next.js 15 requirement)

```ts
// ✅ Correct (Next.js 15)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  ...
}
```

---

## 7. Git & PR Conventions

```
feat: add property price filter
fix: correct i18n key in PropertyCard
chore: move flows.md to docs/architecture/
refactor: extract useMapMarkers hook
```

- One PR per task
- PR title = conventional commit format
- Link to task file in PR description: `Closes: docs/tasks/active/<task>.md`
- `npm run build` must pass before opening PR

---

*Last updated: 2026-02-19 | Maintained by: Oraculus 🔮*
