---
name: lumina-implementer
description: Implement a Lumina task from docs/tasks/active with strict scope and conventions. Use when coding against an approved task file and producing a single focused PR.
---

# Lumina Implementer

Implement only what is described in a task file under `docs/tasks/active/`.

## Steps
1. Read the task file fully.
2. Read `docs/conventions.md` and relevant architecture docs.
3. Implement changes only in listed files.
4. Run validation:
   - `npm run build`
   - `npm run lint` (if configured and fast enough)
5. Prepare commit with conventional title.

## Hard constraints
- No scope creep.
- No hardcoded user-facing strings; use next-intl keys.
- Do not change DB schema/auth/public API unless task explicitly allows it.
- One task = one PR.

## Output
- Summary of changed files
- Validation results
- Risks/follow-ups

## References
- `references/implementation-checklist.md`
