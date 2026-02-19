# Core User Flows (UI‑derived)

Each flow lists the primary UI entry points, routing, and backend/API touchpoints.

## Property search (marketing → listings)

1. User submits hero search or clicks CTA → navigates to `/properties`.
   - UI entry: `src/components/HeroSection.tsx`
2. Properties page reads query params (`location`, `minPrice`, `maxPrice`, `view`) and applies filters.
   - Page: `src/app/(marketing)/properties/page.tsx`
   - Filter logic: `src/app/(marketing)/properties/components/ProSidebarPropertiesPage.tsx`
3. Results shown in grid or map view; grid cards link to details.
   - UI: `src/app/(marketing)/properties/components/PropertyCard.tsx`

## Map view toggle (grid ↔ map)

1. User toggles map/grid in header while on `/properties`.
   - UI: `src/components/Header.tsx`
2. `viewChange` event updates local state and URL `view` query.
   - Handler: `src/app/(marketing)/properties/components/ProSidebarPropertiesPage.tsx`
3. Map view renders property markers + AI places overlay.
   - UI: `src/app/(marketing)/properties/components/PropertyDetailsMap.tsx`
   - Map renderer: `src/app/(marketing)/properties/components/PropertiesGoogleMap.tsx`

## Property detail view

1. User clicks a property card → navigates to `/properties/[id]`.
   - UI: `src/app/(marketing)/properties/components/PropertyCard.tsx`
2. Detail page renders property content and related map.
   - Page: `src/app/(marketing)/properties/[id]/page.tsx`
   - Map UI: `src/app/(marketing)/properties/components/SinglePropertyGoogleMap.tsx`

## Compare properties

1. User taps compare icon on property cards → adds to compare context.
   - UI: `src/app/(marketing)/properties/components/PropertyCard.tsx`
2. Sticky compare bar appears; CTA opens `/compare?id=...`.
   - UI: `src/components/StickyCompareBar.tsx`
3. Compare page displays the comparison UI.
   - Page: `src/app/(marketing)/compare/page.tsx`

## Favorites

1. User toggles heart on property card → stores favorite locally.
   - UI/state: `src/app/(marketing)/properties/components/PropertyCard.tsx`
   - Storage: `src/contexts/FavoritesContext.tsx` (localStorage)
2. User opens `/favorites` from header.
   - UI: `src/components/Header.tsx`
   - Page: `src/app/(marketing)/favorites/page.tsx`

## AI nearby places (chat → map pins)

1. User asks for nearby POIs in chat.
   - UI: `src/app/(marketing)/properties/components/AIChatComponent.tsx`
2. Tool handler calls `/api/places` and dispatches event with results.
   - Tool handler: `src/hooks/ai/usePropertySearch.ts`
   - API: `src/app/api/places/route.ts`
3. Map listener renders POI markers and fits bounds.
   - UI: `src/app/(marketing)/properties/components/PropertiesGoogleMap.tsx`

## Agent CRM navigation (tabs)

1. Agent uses side nav → updates `?tab=` on `/agents`.
   - UI: `src/app/(dashboard)/agents/components/AgentSideNav.tsx`
2. `/agents` page reads tab and renders section (many sections are “coming soon”).
   - Page: `src/app/(dashboard)/agents/page.tsx`

## Voice AI (OpenAI Realtime)

1. Client requests a realtime session token.
   - API: `src/app/api/realtime/token/route.ts`
2. Client exchanges SDP via proxy.
   - API: `src/app/api/realtime/sdp/route.ts`
3. WebRTC session streams audio + tool calls.
   - Client hook: `src/hooks/ai/useRealtimeVoiceSession.ts`
