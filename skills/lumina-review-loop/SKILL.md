---
name: lumina-review-loop
description: Run Lumina PR review loop with @cursor and fix iterations. Use after opening a PR to request agent review, process feedback, apply fixes, and confirm merge readiness.
---

# Lumina Review Loop

Standardize post-PR iterations.

## Steps
1. Open PR (or use existing PR link).
2. Post `@cursor please review` comment.
3. Collect feedback (Cursor/BugBot/human).
4. Classify items:
   - must-fix
   - should-fix
   - optional
5. Apply fixes in focused commits.
6. Re-run validations.
7. Post concise resolution summary in PR.

## Rules
- Do not ignore security/correctness issues.
- If feedback conflicts with task scope, escalate explicitly.
- Keep loop concise: batch fixes, avoid noisy ping-pong.

## References
- `references/review-triage.md`
