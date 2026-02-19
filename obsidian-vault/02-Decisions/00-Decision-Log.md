# Decision Log

## Decision-001: Kimi for i18n Cleanup

**Date:** 2026-02-19
**Status:** ✅ Implemented
**Deciders:** გიო (user), ორაკული (agent)

### Context
Needed to clean up hardcoded Georgian strings across the codebase. Evaluated options for agent delegation.

### Options Considered
1. **Cursor agent** — Better for complex refactoring, higher cost
2. **Kimi K2.5** — Fast, cost-effective, good for string replacement
3. **DeepSeek** — Cheaper but less reliable for this task

### Decision
Use **Kimi K2.5** for bulk i18n string replacement, **Cursor** for final review.

### Rationale
- Kimi is 11x cheaper than Sonnet
- i18n is straightforward text replacement
- Cursor review catches edge cases
- Parallel workflow possible

### Consequences
✅ **Positive:** 43 strings cleaned in 1 day, build passing
⚠️ **Trade-off:** Less context awareness than Cursor (mitigated by review step)

### Related
- [[Sprint-2026-02-19-i18n-cleanup]]
- [[i18n-audit-2026-02-19]]

---

## Decision-002: Autonomous Agent Mode

**Date:** 2026-02-19
**Status:** ✅ Active
**Deciders:** გიო (user)

### Context
User wants agent to work independently without constant approval.

### Decision
Enable **autonomous mode** with:
- Cron job every 10 minutes
- Auto-merge approved PRs
- Silent operation unless critical
- Full i18n continuation

### Safeguards
- Only merge after Cursor review
- Report critical issues immediately
- Daily summary of work done

### Related
- [[HEARTBEAT-md]]
