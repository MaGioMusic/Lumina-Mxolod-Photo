# Task: i18n Cleanup Batch 2 — PropertiesGoogleMap

## Scope
File: `src/app/(marketing)/properties/components/PropertiesGoogleMap.tsx`

## Hardcoded Strings Found
1. Line 303: `Standard` (map type button) → needs `t('mapStandard')`
2. Line 314: `Satellite` (map type button) → needs `t('mapSatellite')`
3. Line 285: `Google Maps API key is missing.` → needs `t('mapsApiKeyMissing')`

## Required Actions
1. Add keys to `src/contexts/LanguageContext.tsx`:
   - `mapStandard`: "Standard" / "Standard" / "Стандарт"
   - `mapSatellite`: "Satellite" / "Satellite" / "Спутник"
   - `mapsApiKeyMissing`: "Google Maps API key is missing." / "Google Maps API key is missing." / "Ключ API Google Maps отсутствует."

2. Update PropertiesGoogleMap.tsx:
   - Replace hardcoded strings with `t()` calls
   - Keep existing `useLanguage()` hook usage pattern
   - Ensure no UI/UX changes

## DoD
- [ ] All 3 strings use `t()` with proper keys
- [ ] LanguageContext.tsx updated with all 3 keys (ka/en/ru)
- [ ] `npm run build` passes
- [ ] No visual changes to UI

## Submit
Commit with format:
```
fix(i18n): PropertiesGoogleMap hardcoded strings (batch 2)

Refs: docs/tasks/active/2026-02-19-i18n-user-facing-batch-1.md
```
