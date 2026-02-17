# Cursor Agent Task — Lumina-Mxolod-Photo (User-facing i18n only)

## Goal
Make all user-facing text fully language-driven (KA/EN/RU) with no mixed-language UI.

## Scope (ONLY)
- `src/app/(marketing)/properties/[id]/page.tsx`
- `src/app/(marketing)/properties/components/UploadPropertyModal.tsx`
- `src/components/PropertySubmitModal.tsx`
- `src/app/(marketing)/properties/components/PropertyDetailsMap.tsx` (user-visible labels only)
- `src/contexts/LanguageContext.tsx` (add missing keys only)

## Rules
1. Replace hardcoded user-visible strings with `t('...')`.
2. Remove `t(...) || '...'` and `t(...) ?? '...'` where key exists.
3. Keep logic defaults (non-UI fallbacks) intact (ids, arrays, null guards, env fallbacks).
4. Do NOT redesign UI.
5. Do NOT touch agent/chat features.
6. Do NOT modify backend behavior except i18n text needs.

## Definition of Done
- No visible mixed-language text on the target pages.
- All newly used keys exist in `LanguageContext.tsx` for `ka/en/ru`.
- `npm run lint` has no new errors.
- `npm run build` passes.

## Output format required from agent
- File-by-file change summary.
- Exact keys added in `LanguageContext.tsx`.
- Any unresolved hardcoded text with reason.
- Final command outputs: lint + build.
