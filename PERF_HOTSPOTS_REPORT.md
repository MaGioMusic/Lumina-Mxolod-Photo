# PERF_HOTSPOTS_REPORT

## Scope

- Route: `/properties`
- Interaction profiled: dark/light toggle (`AnimatedThemeToggler` in header)
- Mode: development (`next dev --turbopack`)
- Runs: automated headless Chrome + React Profiler instrumentation, 6 toggles per run
- Isolation: `/api/properties` mocked to stable response during profiling to remove DB noise

## Measurement setup

- Added minimal, gated profiler instrumentation in `src/lib/perf/reactProfiler.tsx`.
- Wrapped key `/properties` and header subtrees with `ProfiledSection`.
- Profiling enabled only when `window.__LUMINA_PROFILER_ENABLED__ = true`.

## Measurements (React Profiler)

### Primary run (`NEXT_PUBLIC_DEV_LOGS=0`)

- Total profiled component actualDuration: **1103.8ms** over 6 toggles
- Average per toggle: **183.967ms**
- Total profiler events: **421**

### Logging overhead comparison

- `NEXT_PUBLIC_DEV_LOGS=1` average per toggle: **215.017ms**
- Delta vs logs-off: **+31.05ms/toggle** (**+16.9%**)
- Console-call delta over 6 toggles: **+12 `console.log`**, **+26 `console.debug`**

## Top 10 slowest components (logs-off run)

| Rank | Component | Render count | Total actualDuration (ms) | Avg/render (ms) | Why it re-renders |
|---|---|---:|---:|---:|---|
| 1 | `PropertiesGrid` | 7 | 428.1 | 61.157 | Parent subtree re-renders when theme context updates at app root; heavy per-render derivations and mapping (`src/app/(marketing)/properties/components/PropertiesGrid.tsx:187-334`, `:513-549`). |
| 2 | `PropertyCard` | 175 | 424.4 | 2.425 | 25 cards re-render per parent render; also subscribes to theme context via `useTheme` (`src/app/(marketing)/properties/components/PropertyCard.tsx:57`). |
| 3 | `PropertyImageCarousel` | 175 | 127.0 | 0.726 | Parent card re-renders; receives fresh `images` array and `onImageChange` callback identity each render (`PropertyCard.tsx:66`, `:148`). |
| 4 | `ProSidebarFilter` | 6 | 85.8 | 14.300 | Direct theme context consumer (`ProSidebarFilter.tsx:45`) + many dynamic objects/inline style trees recreated each render (`:56-66`, `:208-244`). |
| 5 | `Header` | 7 | 23.1 | 3.300 | Direct theme context consumer; recomputes nav/menu/language structures per render (`src/components/Header.tsx:57-109`). |
| 6 | `BeautifulRangeSlider:price` | 6 | 4.1 | 0.683 | Child of `ProSidebarFilter`; also subscribes to theme (`BeautifulRangeSlider.tsx:29`, `:32-41`). |
| 7 | `BeautifulRangeSlider:area` | 6 | 3.8 | 0.633 | Same as price slider (`BeautifulRangeSlider.tsx:29`, `:32-41`). |
| 8 | `AnimatedThemeToggler` | 7 | 3.0 | 0.429 | Uses theme context directly (`src/components/ui/animated-theme-toggler.tsx:26-27`). |
| 9 | `MiniCalendar` | 6 | 3.0 | 0.500 | Theme consumer with large dynamic style objects and injected CSS string rebuilt on render (`MiniCalendar.tsx:25`, `:32-70`, `:357-404`). |
| 10 | `ToggleSwitch:quality` | 12 | 1.5 | 0.125 | Two switches re-render with parent + theme context (`src/app/(marketing)/properties/components/ToggleSwitch.tsx:14-26`). |

## Expensive calculations identified

1. **Listing derivation and payload shaping inside `PropertiesGrid` render path**
   - Location normalization + alias checks (`PropertiesGrid.tsx:197-226`)
   - `effectiveFilters` object rebuild (`:246-261`)
   - Pagination slice + preview map for AI snapshot (`:353-374`)
2. **AI snapshot effect work triggered by array identity churn**
   - `currentProperties = filteredProperties.slice(...)` creates a new array (`:353`)
   - Effect depends on `currentProperties` identity (`:423`), causing extra key generation + preview mapping.
3. **Per-card repeated value construction**
   - `propertyImages` array built on every card render (`PropertyCard.tsx:66`)
   - Repeated `parseInt(id, 10)` and `isCompared(...)` checks in JSX (`PropertyCard.tsx:181-190`).
4. **Filter sidebar render-time object churn**
   - Recreates `colors`, filter arrays, and several helper outputs per render (`ProSidebarFilter.tsx:56-66`, `:163-205`).
5. **Calendar dynamic styling cost**
   - Rebuilds theme color object + large `dangerouslySetInnerHTML` CSS string and style objects every render (`MiniCalendar.tsx:32-70`, `:357-404`).

## Prop identity churn identified

- `ThemeProvider` passes a fresh context value object each render (`src/contexts/ThemeContext.tsx:67`), and `toggleTheme` function is recreated (`:51-64`).
- Inline callback prop per card:
  - `onHighlight={() => onPropertyHighlight?.(property.id)}` (`PropertiesGrid.tsx:545`)
- Inline callback prop per carousel:
  - `onImageChange={(index) => console.log(...)}` (`PropertyCard.tsx:148`)
- Non-memoized function props in parent:
  - `handleFiltersChange` recreated each render (`ProSidebarPropertiesPage.tsx:198-200`)
  - Inline `onToggleCollapse={() => {}}` (`:294`)
- Header recomputes nav/menu/language arrays each render (`Header.tsx:57-109`).

## Console/log overhead impacting dev responsiveness

Measured impact (same toggle scenario):

- `NEXT_PUBLIC_DEV_LOGS=0`: **183.967ms/toggle**
- `NEXT_PUBLIC_DEV_LOGS=1`: **215.017ms/toggle**
- Overhead: **+31.05ms/toggle** (**+16.9%**)

Primary sources:

- `Header` render logs (`src/components/Header.tsx:51-52`)
- `PropertiesGrid` logs/debug in render path (`src/app/(marketing)/properties/components/PropertiesGrid.tsx:144`, `:338-343`, `:516-521`)
- Additional direct `console.log` in card interactions (`PropertyCard.tsx:99`, `:102`, `:116`, `:148`)

## Prioritized fixes (diagnosis -> concrete actions)

1. **P0 / Highest impact:** Split and stabilize theme context value
   - Memoize `toggleTheme` with `useCallback` and provider `value` with `useMemo` in `ThemeContext`.
   - Consider separate context for `isHydrated` to avoid theme-triggered full-tree churn.
2. **P0:** Stop unnecessary card subscriptions to theme context
   - Remove `useTheme` from `PropertyCard` if only `isHydrated` is needed; replace with local hydration flag/hook.
3. **P0:** Memoize `PropertyCard` and stabilize high-churn props
   - `React.memo(PropertyCard)`
   - Precompute stable handlers and derived strings in `PropertiesGrid` (`onHighlight`, `price`, `address`, `title`).
4. **P1:** Stabilize carousel props
   - Memoize `propertyImages` (`useMemo`) and `onImageChange` (`useCallback`) in `PropertyCard`.
5. **P1:** Reduce `PropertiesGrid` render-time work
   - Move expensive derivations to `useMemo`.
   - Make AI snapshot effect depend on stable scalar keys instead of array identity.
6. **P1:** Memoize `ProSidebarFilter` view-model objects
   - Memoize `colors`, `propertyTypes`, `amenitiesList`, `qualityLevels`, and handlers (`useCallback`).
7. **P2:** Reduce `MiniCalendar` dynamic style churn
   - Hoist static CSS out of render; memoize style maps keyed by `theme`.
8. **P2:** Eliminate render-path debug logging by default
   - Remove/guard hot-path logs (especially per-card loops), keep only explicit diagnostic mode.

---

No broad refactor was performed; instrumentation added is gated and safe for diagnostics.

