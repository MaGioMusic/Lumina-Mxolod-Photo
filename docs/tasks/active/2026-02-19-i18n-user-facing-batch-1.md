# Task: User-facing i18n cleanup — Batch 1

## Goal
Remove remaining hardcoded user-facing strings in high-traffic public flows and ensure full next-intl coverage (ka/en/ru).

## Scope

**In scope:**
- Public marketing/property search UI only
- Replace hardcoded literals with translation keys
- Add missing keys in `messages/ka.json`, `messages/en.json`, `messages/ru.json`
- Keep UI behavior unchanged

**Out of scope (explicitly):**
- Agent chat/assistant-side features
- Database schema changes
- Auth flow refactors
- Map logic redesign (scheduled after i18n)

## Files to touch

- `src/app/(marketing)/properties/**`
- `src/components/Header.tsx` (only if hardcoded labels found)
- `src/components/Footer.tsx` (only if hardcoded labels found)
- `messages/ka.json`
- `messages/en.json`
- `messages/ru.json`

## Implementation notes
- Use namespaced keys per component/page.
- Preserve current UX/layout exactly.
- Keep one focused PR.

## Done When (DoD)

- [ ] No hardcoded user-facing literals in scoped files
- [ ] All new keys exist in ka/en/ru
- [ ] `npm run build` passes
- [ ] Manual smoke check: `/`, `/properties`, `/properties/[id]`
- [ ] Diff contains only scoped files

## Do NOT

- Do not modify `prisma/schema.prisma`
- Do not touch `src/app/(marketing)/properties/components/PropertyDetailsMap.tsx` map behavior
- Do not edit unrelated routes/components

## PR Format

```
fix(i18n): clean user-facing literals in public property flows (batch 1)

Closes: docs/tasks/active/2026-02-19-i18n-user-facing-batch-1.md
```

_Assigned to: Cursor agent_
_Priority: high_
_Created: 2026-02-19_
