# Decisions

> Architecture and strategic decisions for Lumina Estate
> [[MOC-Completion-Guide|← Back]] | [[00-Knowledge-Hub|Home]]

## Active Decisions

### Decision-001: Kimi for i18n
**Date:** 2026-02-19
**Status:** ✅ Implemented

**Context:**
- Need to clean up 90+ hardcoded strings
- Multiple agent options available

**Options Considered:**
1. Cursor agent — Better for complex refactoring, higher cost
2. **Kimi K2.5** — Fast, cost-effective, good for string replacement ✅
3. DeepSeek — Cheaper but less reliable

**Decision:** Use Kimi for bulk i18n, Cursor for final review

**Rationale:**
- Kimi is 11x cheaper than Sonnet
- i18n is straightforward text replacement
- Cursor review catches edge cases
- Parallel workflow possible

**Consequences:**
✅ 75 strings cleaned in 1 day
✅ $0.27/M vs $3.00/M (Sonnet)
⚠️ Less context awareness (mitigated by review step)

---

### Decision-002: Autonomous Agent Mode
**Date:** 2026-02-19
**Status:** ✅ Active

**Context:**
User wants agent to work independently without constant approval

**Decision:** Enable full autonomous mode with:
- Cron job every 20 minutes (reduced from 10 to avoid rate limits)
- Auto-merge approved PRs via GitHub Actions
- Silent operation unless critical
- Full i18n continuation

**Safeguards:**
- Only merge after Cursor review
- Report critical issues immediately
- Daily summary of work done

**Update 2026-02-20:**
- ❌ Cron disabled (GitHub rate limits)
- ✅ GitHub Actions auto-merge enabled instead

---

### Decision-003: LanguageContext over next-intl
**Date:** Pre-2026-02-19
**Status:** ✅ Existing Architecture

**Context:**
Project uses custom translation system instead of industry-standard next-intl

**Decision:** Keep existing LanguageContext.tsx pattern

**Rationale:**
- Simple — single file, everything together
- No deps — no next-intl dependency
- Custom — full control over logic

**Consequences:**
✅ Easy to understand
⚠️ No standard tooling support
⚠️ Manual key management

---

## Pending Decisions

### Decision-004: Payment Provider
**Status:** ⏳ Research Needed

**Options:**
1. Stripe — International, higher fees
2. Bank of Georgia — Local, lower fees

**Need:** Research requirements, timeline, integration complexity

---

### Decision-005: PropertySubmitModal Approach
**Status:** ⏳ Pending

**Problem:** edit tool fails on LanguageContext.tsx (exact match issue)

**Options:**
1. Manual edit via sed/awk scripts
2. New file creation + merge
3. Sub-agent delegation
4. Wait for fresh session tomorrow

**Need:** Choose approach for 40+ string translations

---

## Decision Template

```markdown
### Decision-XXX: [Title]
**Date:** YYYY-MM-DD
**Status:** [⏳ Pending / ✅ Implemented / ❌ Rejected]

**Context:**
[What triggered this decision]

**Options Considered:**
1. [Option A]
2. [Option B] ✅
3. [Option C]

**Decision:** [What we chose]

**Rationale:**
[Why]

**Consequences:**
✅ Positive
⚠️ Trade-offs
```

---
*Last updated: 2026-02-20*
