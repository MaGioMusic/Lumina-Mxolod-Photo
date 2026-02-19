# Task: i18n Cleanup Phase 2 — Header & Footer

## Scope
Files:
- `src/components/Header.tsx`
- `src/components/Footer.tsx`

## Task
Find and replace all hardcoded user-facing strings with translation keys.

## DoD
- [ ] Header.tsx — all navigation labels, buttons → t()
- [ ] Footer.tsx — all links, copyright, labels → t()
- [ ] LanguageContext.tsx — new keys added (ka/en/ru)
- [ ] npm run build passes
- [ ] Commit with message: "fix(i18n): Header and Footer hardcoded strings"

## Submit
Push to branch and create PR.
