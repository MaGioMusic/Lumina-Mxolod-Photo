# Performance Regression Checklist: `/properties`

This document captures the lightweight interaction harness, baseline vs post-fix numbers, and merge gate criteria for the `/properties` performance incident.

## Scope

Required interaction loops:

1. Theme toggle x10
2. Filter change x20
3. Chat send x10

## Lightweight harness

Helper script (no new framework dependency):

- `scripts/properties-perf-harness.mjs`
- npm alias: `npm run perf:properties`

Example runs:

```bash
npm run perf:properties -- --label baseline
npm run perf:properties -- --label post-fix
```

Output artifacts:

- `perf-results/properties-perf-baseline.json`
- `perf-results/properties-perf-post-fix.json`

## Environment notes for captured runs

- OS: Linux (cloud worker)
- Browser: `/usr/local/bin/google-chrome` (headless)
- App mode: `next dev --turbopack`
- Known runtime caveat in this environment: `DATABASE_URL` is not set, so `/api/properties` returns 500 and UI falls back to local mock data. Measurements still reflect client-side interaction responsiveness.

## Incident fix included in this branch

1. `src/components/ui/animated-theme-toggler.tsx`
   - Skip expensive view-transition animation on `/properties` (and when reduced motion is preferred).
2. `src/contexts/ThemeContext.tsx`
   - Apply document theme immediately, defer React context update via `startTransition` to reduce input-to-paint blocking.
3. `src/app/(marketing)/properties/components/ProSidebarPropertiesPage.tsx`
   - Pass debounced query into grid/map to reduce churn during rapid filter typing.

## Measured results

### Summary table

| Scenario | Baseline (p95 ms) | Post-fix (p95 ms) | Delta |
| --- | ---: | ---: | ---: |
| Theme toggle x10 | 477.3 | 292.0 | -38.8% |
| Filter change x20 | 69.8 | 84.3 | +20.8% |
| Chat send x10 | 37.7 | 37.1 | -1.6% |

### Additional stats

| Scenario | Baseline median | Post-fix median | Baseline jank rate | Post-fix jank rate |
| --- | ---: | ---: | ---: | ---: |
| Theme toggle x10 | 357.1 | 200.6 | 100% | 70% |
| Filter change x20 | 36.8 | 36.5 | 5% | 5% |
| Chat send x10 | 33.5 | 36.1 | 0% | 0% |

### Jank observations

- Theme toggle remains the dominant risk. Post-fix materially improves p95 and median, but still shows occasional long task spikes.
- One startup outlier is present in the post-fix run (`maxLongTaskMs`), likely tied to first-load compilation/runtime warmup in dev mode.
- Filter and chat interactions remain consistently responsive after warmup, with very low long-task incidence.

## Merge gate criteria (incident-specific)

Gate is evaluated per scenario, then overall:

- **Theme toggle**
  - `p95Ms <= 220`
  - `jankRatePct <= 40`
  - `maxLongTaskMs <= 120`
- **Filter change**
  - `p95Ms <= 240`
  - `jankRatePct <= 45`
  - `maxLongTaskMs <= 140`
- **Chat send**
  - `p95Ms <= 260`
  - `jankRatePct <= 45`
  - `maxLongTaskMs <= 140`

Overall gate status:

- **Baseline:** FAIL
- **Post-fix:** FAIL (theme toggle still exceeds threshold)

## Checklist for release decision

- [x] Harness script added for `/properties` loops
- [x] Baseline captured
- [x] Post-fix captured
- [x] Jank observations documented
- [x] Explicit merge gate criteria defined
- [ ] Gate PASS required before merge (currently blocked by theme-toggle budget)

