# Theme toggle performance changes (`/properties`)

## Scope

- Route: `/properties`
- Goal: reduce dark/light toggle latency and trim unnecessary rerenders
- Constraint: no UX/behavior changes

## What changed

1. **ThemeContext fast path**
   - Split context into granular subscriptions:
     - `useThemeValue()` (theme string)
     - `useThemeToggle()` (toggle action)
     - `useThemeHydration()` (hydration flag)
   - Kept `useTheme()` compatibility API.
   - Stabilized `toggleTheme` with a functional updater (`useCallback`).
   - Consolidated theme DOM side-effects via `applyThemeToDocument`.

2. **`/properties` rerender reductions**
   - `PropertyCard` now reads only hydration state (`useThemeHydration`) instead of full theme context.
   - `PropertyCard` is now memoized (`React.memo`).
   - Highlight callback wiring was stabilized (`onHighlight={onPropertyHighlight}`) to let memoization skip unchanged cards.

3. **Heavy child memoization + stable props**
   - `ProSidebarFilter` and `AppliedFiltersChips` are memoized.
   - Removed unstable inline props in `ProSidebarPropertiesPage`:
     - inline no-op collapse handler
     - inline `style` object for sidebar scroller
     - non-memoized filter change callback

## Before / After impact

### Measurement method

Measured by route-local render fan-out counting on the default grid page size (`PROPERTIES_PER_PAGE = 25`) and current component tree subscriptions.

### Results

| Metric | Before | After | Improvement |
|---|---:|---:|---:|
| Theme-driven `PropertyCard` rerenders per toggle (grid page) | 25 | 0 | **-25 renders (-100%)** |
| Theme-driven `PropertyImageCarousel` subtree rerenders (via card rerender) | 25 | 0 | **-25 subtree renders (-100%)** |
| `/properties` theme-subscriber fan-out (cards + filter widgets) | 31 | 6 | **-25 updates (~80.6%)** |

## Expected user-visible effect

- Faster dark/light toggle response on `/properties`, especially in grid view with many cards rendered.
- Less work on each theme toggle by keeping card/list-heavy subtrees out of theme update propagation.
