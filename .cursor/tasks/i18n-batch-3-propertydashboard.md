# Task: i18n Cleanup Batch 3 — PropertyDashboard

## Scope
File: `src/app/(marketing)/properties/components/PropertyDashboard.tsx`

## Hardcoded Strings Found
1. Line 71: `წვდომა შეზღუდულია` → `t('accessDenied')`
2. Line 72-73: ავტორიზაციის შეტყობინება → `t('loginRequiredMessage')`
3. Line 80: `შესვლა` → `t('login')`
4. Line 86: `უკან დაბრუნება` → `t('goBack')`
5. Line 205: `უკან დაბრუნება` (button) → `t('goBack')`
6. Line 259: `ქონების ატვირთვა` → `t('uploadProperty')`
7. Line 274: `ატვირთეთ ქონების ფოტოები და დოკუმენტები` → `t('uploadPropertyPhotos')`
8. Line 277: `PNG, JPG, PDF ფაილები 10MB-მდე` → `t('acceptedFileTypes')`
9. Line 294: `ფაილების არჩევა` → `t('selectFiles')`
10. Line 303: `ატვირთული ფაილები` → `t('uploadedFiles')`
11. Line 323: `აგენტის სტატისტიკა` → `t('agentStatistics')`
12. Line 328: `პროფილის შევსება` → `t('profileCompletion')`
13. Line 342: `პასუხის მაჩვენებელი` → `t('responseRate')`
14. Line 357: `სულ ქონება` → `t('totalProperties')`
15. Line 361: `აქტიური განცხადებები` → `t('activeListings')`
16. Line 367: `წარმატებული გაყიდვები` → `t('successfulSales')`
17. Line 382: `საძინებელი` / `საძინებლები` → `t('bedroom')` / `t('bedrooms')`
18. Line 384: `სააბაზანო` / `სააბაზანოები` → `t('bathroom')` / `t('bathrooms')`
19. Line 391: `გასაყიდად` → `t('forSale')`
20. Line 426: `ყოველთვიური მაჩვენებლები` → `t('monthlyMetrics')`
21. Line 450: `ქონების ნახვები` → `t('propertyViews')`
22. Line 454: `შეკითხვები` → `t('inquiries')`
23. Line 458: `გაყიდვები` → `t('sales')`
24. Line 465: `ქონების მდებარეობა` → `t('propertyLocation')`
25. Line 481: `საუბრების ძიება` → `t('searchConversations')`
26. Line 527: `შეტყობინების ჩაწერა` → `t('typeMessage')`

## Required Actions
1. Add ALL 26 keys to `src/contexts/LanguageContext.tsx` (ka/en/ru)
2. Update PropertyDashboard.tsx to use `t()` calls
3. Handle pluralization (bedroom/bedrooms, bathroom/bathrooms) with conditional logic
4. Run `npm run build` to verify
5. Create commit

## DoD
- [ ] All 26 strings use `t()` with proper keys
- [ ] LanguageContext.tsx updated (ka/en/ru)
- [ ] `npm run build` passes
- [ ] No visual changes

## Submit
Commit format:
```
fix(i18n): PropertyDashboard hardcoded strings (batch 3)

Refs: docs/tasks/active/2026-02-19-i18n-user-facing-batch-1.md
```
