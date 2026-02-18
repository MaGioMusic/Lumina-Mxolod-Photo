# PERF_COMPONENT_SPLIT_NOTES

## Scope

- Incremental refactor focused on render isolation.
- No intended product behavior changes (filters, map/grid switch, chat panel mounting, pagination flow preserved).

## Architecture Before

### `ProSidebarPropertiesPage`

- Mixed page composition + state orchestration + URL/localStorage synchronization.
- Included view event listeners (`viewChange`, `lumina:view:set`) inline with rendering logic.
- Included filter/search state handlers inline with rendering logic.
- Included map-view reset side effects inline with rendering logic.
- Also contained a local mock filtering memo block not used by the rendered output.

### `PropertiesGrid`

- Single large component handling:
  - query param extraction,
  - AI injected filter merging,
  - API fetch orchestration,
  - derived pagination math,
  - header rendering,
  - pagination controls rendering.
- Pagination math and list derivation ran in component scope without isolated memoized boundaries.

## Architecture After

### Extracted hooks

- `src/app/(marketing)/properties/components/hooks/propertiesFilters.ts`
  - Shared filter types/default factory and URL keys.
- `src/app/(marketing)/properties/components/hooks/usePropertiesPageState.ts`
  - Page-local state + filter/search handlers + active-filter derivation.
- `src/app/(marketing)/properties/components/hooks/usePropertiesPageEffects.ts`
  - URL hydration, localStorage sync, map/grid event listeners, map-view reset effects.
- `src/app/(marketing)/properties/components/hooks/usePropertiesGridDerivedState.ts`
  - Isolated filtered-list/pagination derivation with `useMemo`.

### Extracted presentational components

- `src/app/(marketing)/properties/components/PropertiesGridHeader.tsx` (`React.memo`)
- `src/app/(marketing)/properties/components/PropertiesGridPagination.tsx` (`React.memo`)
- `src/app/(marketing)/properties/components/AppliedFiltersChips.tsx` now wrapped in `React.memo`

## Render Impact Summary

- `ProSidebarPropertiesPage` now mostly composes UI and delegates state/effects to hooks.
- Removed unused local mock-filter compute path from `ProSidebarPropertiesPage`.
- `PropertiesGrid` now isolates derived list/pagination work in memoized hook boundaries.
- Header and pagination controls render through memoized, prop-driven presentational components.
- URL update/pagination handlers are callback-stable (`useCallback`) to reduce prop churn.
- Net effect: fewer avoidable recomputations and less broad rerender surface while preserving behavior.
