# Task: [სახელი / Name]

> Copy this file to `docs/tasks/active/<task-slug>.md` and fill it out before starting work.
> After merge → move to `docs/tasks/done/`.

---

## Goal
_One sentence. What problem does this solve for the user?_

---

## Scope

**In scope:**
- ...

**Out of scope (explicitly):**
- ...

---

## Files to touch
_List the specific files expected to change. Agents should not edit files outside this list without re-reading the task._

```
src/...
messages/...
```

---

## Implementation notes
_Any architecture decisions, constraints, or gotchas the agent should know._

---

## Done When (DoD)
_Checkboxes. All must be ✅ before PR._

- [ ] Feature works in `ka`, `en`, `ru` (i18n)
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] No hardcoded user-facing strings
- [ ] Tested manually in browser (or automated test added)
- [ ] Self-reviewed diff — no unintended changes

---

## Do NOT
_Hard prohibitions for this task._

- Do not modify `prisma/schema.prisma`
- Do not change `src/components/Header.tsx` unless explicitly listed above
- ...

---

## PR Format
```
feat: <short description>

Closes: docs/tasks/active/<task-slug>.md
```

---

_Assigned to: [Cursor agent / Oraculus / manual]_
_Priority: high | medium | low_
_Created: YYYY-MM-DD_
