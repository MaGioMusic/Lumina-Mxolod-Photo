---
name: lumina-doc-sync
description: Keep Lumina docs synchronized after task completion. Use when code or structure changes require updating docs index, architecture notes, and task status movement active→done.
---

# Lumina Doc Sync

Update documentation after implementation/review completion.

## Steps
1. Read completed task in `docs/tasks/active/`.
2. Update docs impacted by the change:
   - `docs/README.md` if index changed
   - `docs/architecture/*` when flows/routes/integrations changed
   - `docs/conventions.md` if standards changed
3. Move task file to `docs/tasks/done/` once merged.
4. Add short memory note (workspace memory file) for durable process changes.

## Rules
- Keep docs factual and concise.
- Do not rewrite unrelated sections.
- Preserve link integrity.

## References
- `references/doc-update-matrix.md`
