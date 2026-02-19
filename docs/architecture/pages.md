# Pages & Routes Inventory

Generated from `src/app/**` and UI navigation components.

## Public

- `/` — `src/app/(marketing)/page.tsx`
  - Navigation: Header main nav (`src/components/Header.tsx`), Footer quick links (`src/components/Footer.tsx`).
- `/about` — `src/app/(marketing)/about/page.tsx`
  - Navigation: Header “Pages” dropdown (`src/components/Header.tsx`), Footer quick links (`src/components/Footer.tsx`).
- `/blog` — `src/app/(marketing)/blog/page.tsx`
  - Navigation: Header main nav (`src/components/Header.tsx`).
- `/contact` — `src/app/(marketing)/contact/page.tsx`
  - Navigation: Header main nav (`src/components/Header.tsx`), Footer quick links (`src/components/Footer.tsx`), UnderConstruction CTA (`src/components/underConstruction.tsx`).
- `/roadmap` — `src/app/(marketing)/roadmap/page.tsx`
  - Navigation: Header main nav (`src/components/Header.tsx`).
- `/properties` — `src/app/(marketing)/properties/page.tsx`
  - Navigation: Header main nav + map/grid toggle (`src/components/Header.tsx`), Hero CTA/search (`src/components/HeroSection.tsx`), Footer services/quick links (`src/components/Footer.tsx`), AI open_page tool (`src/hooks/ai/usePropertySearch.ts`).
- `/properties/[id]` — `src/app/(marketing)/properties/[id]/page.tsx`
  - Navigation: Property cards (`src/app/(marketing)/properties/components/PropertyCard.tsx`), AI navigation tool (`src/hooks/ai/usePropertySearch.ts`).
- `/compare` — `src/app/(marketing)/compare/page.tsx`
  - Navigation: Sticky compare bar CTA (`src/components/StickyCompareBar.tsx`).
- `/favorites` — `src/app/(marketing)/favorites/page.tsx`
  - Navigation: Header favorites icon + menu action (`src/components/Header.tsx`).
- `/legal` — `src/app/(marketing)/legal/page.tsx`
  - Navigation: Header “Pages” dropdown (`src/components/Header.tsx`).
- `/guides` — `src/app/(marketing)/guides/page.tsx`
  - Navigation: Header “Pages” dropdown (`src/components/Header.tsx`).
- `/investors` — `src/app/(marketing)/investors/page.tsx`
  - Navigation: Header “Pages” dropdown + mobile link (`src/components/Header.tsx`).
- `/market-reports` — `src/app/(marketing)/market-reports/page.tsx`
  - Navigation: Header “Pages” dropdown (`src/components/Header.tsx`).
- `/neighborhoods` — `src/app/(marketing)/neighborhoods/page.tsx`
  - Navigation: Header “Pages” dropdown (`src/components/Header.tsx`).
- `/new-developments` — `src/app/(marketing)/new-developments/page.tsx`
  - Navigation: Header “Pages” dropdown (`src/components/Header.tsx`).
- `/calculators` — `src/app/(marketing)/calculators/page.tsx`
  - Navigation: Header “Pages” dropdown (`src/components/Header.tsx`).

## User

- `/profile` — `src/app/(dashboard)/profile/page.tsx`
  - Navigation: Header account menu → profile (`src/components/Header.tsx`), Profile sidebar (`src/app/(dashboard)/profile/components/profileNavigation.tsx`), legacy redirect (`src/app/(dashboard)/client/dashboard/page.tsx`).
- `/profile/appointments` — `src/app/(dashboard)/profile/appointments/page.tsx`
  - Navigation: Profile sidebar (`src/app/(dashboard)/profile/components/profileNavigation.tsx`).
- `/profile/inquiries` — `src/app/(dashboard)/profile/inquiries/page.tsx`
  - Navigation: Profile sidebar (`src/app/(dashboard)/profile/components/profileNavigation.tsx`).
- `/profile/listings` — `src/app/(dashboard)/profile/listings/page.tsx`
  - Navigation: Profile sidebar (`src/app/(dashboard)/profile/components/profileNavigation.tsx`).
- `/profile/saved-searches` — `src/app/(dashboard)/profile/saved-searches/page.tsx`
  - Navigation: Profile sidebar (`src/app/(dashboard)/profile/components/profileNavigation.tsx`).
- `/profile/documents` — `src/app/(dashboard)/profile/documents/page.tsx`
  - Navigation: Profile sidebar (`src/app/(dashboard)/profile/components/profileNavigation.tsx`).
- `/profile/activity` — `src/app/(dashboard)/profile/activity/page.tsx`
  - Navigation: Profile sidebar (`src/app/(dashboard)/profile/components/profileNavigation.tsx`).
- `/profile/performance` — `src/app/(dashboard)/profile/performance/page.tsx`
  - Navigation: Profile sidebar (`src/app/(dashboard)/profile/components/profileNavigation.tsx`).
- `/settings` — `src/app/(dashboard)/settings/page.tsx`
  - Navigation: Header account menu → settings (`src/components/Header.tsx`).
- `/logout` — `src/app/(dashboard)/logout/page.tsx`
  - Navigation: Header account menu → logout (`src/components/Header.tsx`).
- `/client/dashboard` — `src/app/(dashboard)/client/dashboard/page.tsx`
  - Behavior: redirects to `/profile`.

## Agent-CRM

- `/agents` — `src/app/(dashboard)/agents/page.tsx`
  - Navigation: Footer links (`src/components/Footer.tsx`), Agent side nav tabs (`src/app/(dashboard)/agents/components/AgentSideNav.tsx`).
- `/agents/dashboard` — `src/app/(dashboard)/agents/dashboard/page.tsx`
  - Navigation: Header account menu → agent dashboard (`src/components/Header.tsx`).
- `/agents/chat` — `src/app/(dashboard)/agents/chat/page.tsx`
  - Navigation: Header account menu → agent chat (`src/components/Header.tsx`).
- `/properties/[id]/dashboard` — `src/app/(dashboard)/properties/[id]/dashboard/page.tsx`
  - Navigation: unknown (not linked in UI); includes auth gating with a hardcoded `/login` redirect.

## Admin

- `/dashboard` — `src/app/dashboard/page.tsx`
  - Navigation: unknown (AppSidebar links are placeholders) (`src/components/app-sidebar.tsx`).
- `/dev/erd` — `src/app/dev/erd/page.tsx`
  - Navigation: unknown (dev-only entry point).

## Archived/Backup (not in App Router)

These are stored under `backup/experimental-20251019/**` and are not wired into `src/app` routing:
- `backup/experimental-20251019/app/admin/dashboard/page.tsx`
- `backup/experimental-20251019/app/admin/login/page.tsx`
- `backup/experimental-20251019/app/admin/properties/page.tsx`
- `backup/experimental-20251019/app/properties/*` (multiple test pages)
- `backup/experimental-20251019/app/test-glass/page.tsx`

## Broken Links / Missing Routes / Placeholders

- `/login` is referenced but has no route:
  - NextAuth sign-in page points to `/login` (`src/lib/auth/nextAuthOptions.ts`).
  - Property dashboard auth fallback routes to `/login` (`src/app/(dashboard)/properties/[id]/dashboard/page.tsx`).
- `#` placeholder URLs used in the AppSidebar (non-functional):
  - `src/components/app-sidebar.tsx` (`navMain`, `navSecondary`, `documents` use `url: '#'`).
  - `src/components/nav-secondary.tsx` explicitly disables `#` entries.
- “Coming soon” content inside Agent CRM tabs:
  - `src/app/(dashboard)/agents/page.tsx` (Settings/Projects/Offers/Agreements/Contacts/Brokers/Campaigns/Documents).
- “Concept preview / coming soon” text:
  - `src/app/(marketing)/neighborhoods/page.tsx`.
