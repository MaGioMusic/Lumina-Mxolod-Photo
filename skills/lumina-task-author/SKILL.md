---
name: lumina-task-author
description: Create scoped Lumina task files from docs/tasks/template.md for agent execution. Use when starting any new implementation task to define goal, scope, files, DoD, and explicit prohibitions before coding.
---

# Lumina Task Author

Create a new task file in `docs/tasks/active/` using `docs/tasks/template.md`.

## Steps
1. Read `AGENTS.md`, `docs/conventions.md`, and `docs/tasks/template.md`.
2. Convert user request into a task with:
   - Goal (1 sentence)
   - In scope / Out of scope
   - Files to touch (explicit list)
   - DoD checklist (test + i18n + build)
   - Do NOT section (hard boundaries)
3. Save as `docs/tasks/active/<yyyy-mm-dd>-<slug>.md`.
4. Keep task under 200 lines.

## Rules
- Do not start implementation in this skill.
- If request is ambiguous, write assumptions section.
- Always include `ka/en/ru` i18n requirement for UI changes.

## References
- See `references/task-quality-checklist.md` before finalizing task.
