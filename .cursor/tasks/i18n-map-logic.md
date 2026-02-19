# Task: Map Logic i18n — MapView Tooltips

## Scope
File: `src/app/(marketing)/properties/components/MapView.tsx`

## Hardcoded Strings Found
1. Line 1112: `ობიექტი ამ ზონაში` → `t('objectsInZone')`
2. Line 1132: `და კიდევ {count} ობიექტი...` → `t('moreObjects', { count })`
3. Line 1138: `ზუმის გაზრდით დაინახავთ ყველა ობიექტს` → `t('zoomToSeeAll')`

## Required Actions
1. Add keys to LanguageContext.tsx:
   - `objectsInZone`: "ობიექტი ამ ზონაში" / "Objects in this zone" / "Объекты в этой зоне"
   - `moreObjects`: "და კიდევ {count} ობიექტი..." / "And {count} more objects..." / "И еще {count} объектов..."
   - `zoomToSeeAll`: "ზუმის გაზრდით დაინახავთ ყველა ობიექტს" / "Zoom in to see all objects" / "Приблизьте, чтобы увидеть все объекты"

2. Update MapView.tsx to use t() with interpolation for {count}

## DoD
- [ ] All 3 strings use t() with proper keys
- [ ] LanguageContext.tsx updated (ka/en/ru)
- [ ] npm run build passes
- [ ] Commit and push
