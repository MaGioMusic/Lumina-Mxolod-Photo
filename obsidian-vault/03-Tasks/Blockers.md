# Current Blockers

> What's stopping us right now
> [[MOC-Completion-Guide|← Back]] | [[00-Knowledge-Hub|Home]]

## 🚨 Active Blockers

### Blocker-001: PropertySubmitModal i18n
**Status:** 🔴 Blocking
**Priority:** High
**Since:** 2026-02-20

**Problem:**
Cannot add translation keys to LanguageContext.tsx — `edit` tool fails on exact match requirement

**Tried:**
- ❌ Direct edit — exact text not found
- ❌ Multiple match attempts — whitespace issues
- ❌ Read + reconstruct — file too large (3000+ lines)

**Impact:**
- 40+ strings need translation
- Phase 4 i18n incomplete
- Cannot proceed with PropertySubmitModal

**Options:**
1. **Use `write` to recreate entire file** — Risky, might lose changes
2. **Sub-agent with fresh context** — Safer, delegate to new session
3. **Manual PR via GitHub web** — Bypass local editing
4. **Wait for tomorrow** — Fresh session, new approach

**Recommended:** Option 2 or 4

---

### Blocker-002: GitHub API Rate Limits
**Status:** 🟡 Mitigated
**Priority:** Medium
**Since:** 2026-02-20

**Problem:**
Cron job hitting GitHub API rate limits (5,000/hour but burst limited)

**Mitigation:**
- ✅ Disabled cron job
- ✅ Enabled GitHub Actions auto-merge instead
- ✅ Now using webhooks/event-driven approach

**Impact:** Minimal — better solution implemented

---

## ✅ Recently Resolved

### Blocker-000: Cursor Review Delays
**Status:** ✅ Resolved
**Resolved:** 2026-02-19

**Was:** Waiting for Cursor review on PRs
**Solution:** GitHub Actions auto-merge after Cursor approval

---

## 📝 Blocker Template

```markdown
### Blocker-XXX: [Title]
**Status:** 🔴 Blocking / 🟡 Mitigated / ✅ Resolved
**Priority:** Critical / High / Medium / Low
**Since:** YYYY-MM-DD

**Problem:**
[Clear description]

**Tried:**
- [What didn't work]

**Impact:**
[What can't proceed]

**Options:**
1. [Option A]
2. [Option B] ⭐ Recommended
3. [Option C]

**Next Step:** [Who does what by when]
```

---
*Last updated: 2026-02-20*
*Next review: Daily*
