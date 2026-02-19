# Task: i18n Cleanup Batch 1 — MobileFilterDrawer

## Scope
File: `src/app/(marketing)/properties/components/MobileFilterDrawer.tsx`

## Hardcoded Strings Found
1. Line 98: `გასუფთავება` (fallback) → needs `t('clearAll')`
2. Line 106: `ფილტრების დახურვა` (aria-label) → needs `t('closeFilters')`
3. Line 126: `გაუქმება` (fallback) → needs `t('cancel')`
4. Line 137: `ფილტრების გამოყენება` (fallback) → needs `t('applyFilters')`
5. Line 175: `ფილტრები` (fallback) → needs `t('filters')`

## Required Actions
1. Add keys to `messages/ka.json`, `messages/en.json`, `messages/ru.json`:
   - `filters`: "ფილტრები" / "Filters" / "Фильтры"
   - `clearAll`: "გასუფთავება" / "Clear All" / "Очистить все"
   - `closeFilters`: "ფილტრების დახურვა" / "Close Filters" / "Закрыть фильтры"
   - `cancel`: "გაუქმება" / "Cancel" / "Отмена"
   - `applyFilters`: "ფილტრების გამოყენება" / "Apply Filters" / "Применить фильтры"

2. Update MobileFilterDrawer.tsx:
   - Replace hardcoded fallbacks with proper translation keys
   - Keep existing `useLanguage()` hook usage
   - Ensure no UI/UX changes

## DoD
- [ ] All 5 strings use `t()` with proper keys
- [ ] All 3 message files updated
- [ ] `npm run build` passes
- [ ] No visual changes to UI

## Submit
Create PR with format:
```
fix(i18n): MobileFilterDrawer hardcoded strings (batch 1)

Refs: docs/tasks/active/2026-02-19-i18n-user-facing-batch-1.md
```
