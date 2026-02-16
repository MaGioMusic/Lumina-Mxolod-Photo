# PR Review: fix(p0/p1): harden nav freeze guards + hook dependency cleanup

**Reviewer:** Cursor AI Agent  
**Date:** February 16, 2026  
**Branch:** `oraculus/p0-nav-freeze-hardening-v2`

## Executive Summary

✅ **APPROVED** - This PR successfully implements P0/P1 stability improvements with proper runtime flags, route guards, hide-not-delete behavior, and hook dependency cleanup. The changes are focused, safe, and align with the stated scope.

## Review Findings by Focus Area

### 1. P0/P1 Stability ✅ EXCELLENT

**Strengths:**
- All changes are defensive and additive (no breaking changes)
- Proper runtime flag infrastructure with Zod validation
- Graceful degradation when features are disabled
- No regression risk to existing functionality

**Evidence:**
- Flag defaults to `'0'` (disabled) ensuring opt-in behavior
- Middleware only activates when flags are disabled
- All hook dependencies properly stabilized with `useCallback`

### 2. Hide-Not-Delete Behavior for Gated Modules ✅ EXCELLENT

**Implementation Quality:**

#### Header Component (`src/components/Header.tsx`)
```typescript
// Line 85-88: Agent links conditionally added
if (isAgentsUiEnabled && (user?.role === 'agent' || user?.role === 'admin')) {
  baseItems.splice(1, 0, { name: t('agentDashboard'), icon: ChartLine, action: 'agentDashboard' });
  baseItems.splice(1, 0, { name: 'Agent Chat', icon: EnvelopeSimple, action: 'agentChat' });
}
```
✅ **Correct**: Links are conditionally added to array (not removed), implementing true hide-not-delete

#### Footer Component (`src/components/Footer.tsx`)
```typescript
// Lines 17, 22, 24: Spread operator pattern
...(showAgentsUi ? [{ key: 'agents', href: '/agents' }] : []),
```
✅ **Correct**: Using spread operator to conditionally include items in array literal

**No Issues Found** - Both components properly implement hide-not-delete without DOM manipulation

### 3. Route Guard Correctness ✅ EXCELLENT

**Middleware Implementation** (`middleware.ts`):

**Strengths:**
1. **Proper Edge Runtime Compatibility**: Uses `process.env` directly (correct for middleware)
2. **Defense in Depth**: Guards both marketing and dashboard routes
3. **Sensible Redirects**: 
   - `/agents*` → `/` (home)
   - `/dashboard/agents*` → `/profile` (authenticated fallback)
4. **Correct Matcher Configuration**: 
   ```typescript
   matcher: ['/agents/:path*', '/dashboard/agents/:path*']
   ```

**Potential Issues:**

⚠️ **MINOR: Redirect Loop Risk**
```typescript
// Line 18-19
if (pathname === '/dashboard/agents' || pathname.startsWith('/dashboard/agents/')) {
  return NextResponse.redirect(new URL('/profile', request.url));
}
```

**Concern**: If `/profile` route also has guards or redirects, this could create a loop.

**Recommendation**: Add redirect tracking or ensure `/profile` is always accessible.

⚠️ **MINOR: Edge Case - Trailing Slash**
- Current code handles both `/agents` and `/agents/`
- Consider if `/agents?param=value` needs special handling

**Suggested Enhancement:**
```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const agentsUiEnabled = isEnabled(process.env.NEXT_PUBLIC_FLAG_AGENTS_UI);

  if (!agentsUiEnabled) {
    // Normalize pathname for comparison
    const normalizedPath = pathname.toLowerCase().replace(/\/$/, '');
    
    // Marketing agents surfaces
    if (normalizedPath === '/agents' || normalizedPath.startsWith('/agents/')) {
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('_redirected', 'agents_disabled'); // Debug tracking
      return NextResponse.redirect(redirectUrl);
    }

    // Dashboard agents surfaces  
    if (normalizedPath === '/dashboard/agents' || normalizedPath.startsWith('/dashboard/agents/')) {
      const redirectUrl = new URL('/profile', request.url);
      redirectUrl.searchParams.set('_redirected', 'agents_disabled');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}
```

### 4. Hook Dependency/Cleanup Safety ✅ EXCELLENT

**CompareContext.tsx** - No Regressions ✅

**Before:**
```typescript
const add = (id: number) => { /* direct state mutation */ };
const remove = (id: number) => { /* direct state mutation */ };
```

**After:**
```typescript
const add = useCallback((id: number) => {
  let didAdd = false;
  setIds((prev) => { /* functional update */ });
  if (didAdd) { /* conditional side effect */ }
}, []); // ✅ No dependencies needed

const remove = useCallback((id: number) => {
  let didRemove = false;
  setIds((prev) => { /* functional update */ });
  if (didRemove) { /* conditional side effect */ }
}, []); // ✅ No dependencies needed
```

**Improvements:**
1. ✅ Functional state updates eliminate stale closure risk
2. ✅ `useCallback` with empty deps prevents function recreation
3. ✅ Conditional analytics prevents duplicate events
4. ✅ `useMemo` deps array now includes all callbacks

**FilterOption.tsx** - Excellent Dependency Fix ✅

**Before:**
```typescript
const handleMouseMove = (e: MouseEvent) => { /* uses isDragging, range */ };
useEffect(() => { /* ... */ }, [isDragging, range]); // ❌ Missing handleMouseMove dep
```

**After:**
```typescript
const handleMouseMove = useCallback((e: MouseEvent) => {
  // uses isDragging, range, min, max, onChange, step
}, [isDragging, max, min, onChange, range, step]); // ✅ Complete deps

useEffect(() => {
  // ...
}, [handleMouseMove, handleMouseUp, isDragging]); // ✅ Stable function refs
```

**Impact:** Prevents stale closures in drag handlers - critical for correct slider behavior

**PropertyDetailsMap.tsx** - Proper isDev Inclusion ✅

```typescript
// Lines 443, 458: isDev added to dependency arrays
}, [mapBounds, baseFiltered, isDev]);
}, [isDev]);
```

**Correctness:** `isDev` is a stable value from `runtimeFlags`, so this is safe and correct.

**StatisticsSection.tsx** - Textbook Cleanup Pattern ✅

**Before:**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(/* ... */);
  if (sectionRef.current) observer.observe(sectionRef.current);
  return () => {
    if (sectionRef.current) observer.unobserve(sectionRef.current); // ❌ Stale ref
  };
}, []);
```

**After:**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(/* ... */);
  const observedElement = sectionRef.current;
  if (observedElement) observer.observe(observedElement);
  return () => {
    if (observedElement) observer.unobserve(observedElement); // ✅ Captured ref
    observer.disconnect(); // ✅ Full cleanup
  };
}, []);
```

**Improvements:**
1. ✅ Captures ref value at effect mount time
2. ✅ Cleanup uses captured value (prevents null ref access)
3. ✅ `observer.disconnect()` ensures full cleanup

**useRealtimeVoiceSession.ts** - Lint Directive Removal ✅

```typescript
// Line removed: // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isListening]);
```

**Correctness:** The effect only depends on `isListening` which is correctly specified. The eslint-disable was unnecessary.

**AIChatComponent.tsx** - Proper Voice Feature Gating ✅

```typescript
const isVoiceFeatureEnabled = runtimeFlags.enableAIVoiceUI;
const isVoiceEnabled = isVoiceFeatureEnabled && (searchParams?.get('voice') === '0' ? false : voiceDefaultOn);
```

**Improvement:** Adds feature flag gate before evaluating voice settings. Correct precedence.

## Additional Code Quality Observations

### ✅ Default Export Fix (FilterOption.tsx)
**Before:**
```typescript
export default {
  CheckboxOption,
  RangeSliderOption,
  // ...
};
```

**After:**
```typescript
const FilterOptionComponents = {
  CheckboxOption,
  RangeSliderOption,
  // ...
};
export default FilterOptionComponents;
```

**Impact:** Fixes ESLint warning, improves debugging, better TypeScript inference.

### ✅ App Sidebar Link Fixes
- Changed `<a href="#">` to `<Link href="/contact">` 
- Changed `<a href="#">` to `<Link href="/">` for logo
- Proper Next.js Link usage, no hash placeholders

### ✅ Improved ID Generation (dashboard/agents/chat/page.tsx)
```typescript
const genId = () => {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  if (c?.getRandomValues) {
    const buf = new Uint32Array(4);
    c.getRandomValues(buf);
    return Array.from(buf, n => n.toString(16).padStart(8, '0')).join('');
  }
  return (Date.now() + Math.random()).toString(36);
};
```

**Improvements:**
1. Proper fallback chain (randomUUID → getRandomValues → timestamp)
2. Better entropy in fallback
3. Safer crypto API access

## Security Review

✅ **No Security Concerns**
- Feature flags properly validated with Zod
- No XSS vectors introduced
- No authentication bypass risks
- Middleware guards are server-side (cannot be bypassed)

## Performance Review

✅ **No Performance Regressions**
- `useCallback` reduces unnecessary re-renders
- Middleware runs on Edge Runtime (fast)
- No blocking operations added
- Observer cleanup prevents memory leaks

## Testing Recommendations

### Manual Testing Checklist
- [ ] Test with `NEXT_PUBLIC_FLAG_AGENTS_UI=0` (should hide agent links, block routes)
- [ ] Test with `NEXT_PUBLIC_FLAG_AGENTS_UI=1` (should show agent links, allow routes)
- [ ] Test with `NEXT_PUBLIC_FLAG_AI_VOICE_UI=0` (should disable voice UI)
- [ ] Verify `/agents` redirects to `/` when flag is off
- [ ] Verify `/dashboard/agents` redirects to `/profile` when flag is off
- [ ] Test slider drag behavior (no stale closure issues)
- [ ] Test compare context (add/remove/toggle stability)
- [ ] Test cross-tab sync for compare feature
- [ ] Verify IntersectionObserver cleanup (no console errors on unmount)

### Automated Testing Suggestions
```typescript
// middleware.test.ts
describe('Middleware Route Guards', () => {
  it('should redirect /agents when flag is disabled', () => { /* ... */ });
  it('should allow /agents when flag is enabled', () => { /* ... */ });
  it('should not affect other routes', () => { /* ... */ });
});

// CompareContext.test.tsx
describe('CompareContext', () => {
  it('should not fire duplicate analytics events', () => { /* ... */ });
  it('should prevent adding beyond MAX_COMPARE', () => { /* ... */ });
});
```

## Regression Risk Assessment

**Overall Risk: LOW** ✅

| Area | Risk Level | Justification |
|------|-----------|---------------|
| Route Guards | Low | Additive feature, defaults to disabled |
| Feature Flags | Low | Zod validation, safe defaults |
| Hook Dependencies | Very Low | All changes make hooks more stable |
| Hide-Not-Delete | Very Low | Conditional array construction (safe) |
| Cleanup Patterns | Very Low | Fixes existing bugs, no new risks |

## Recommendations

### Required Before Merge
None - PR is ready to merge as-is.

### Optional Improvements (Future PRs)
1. Add redirect tracking parameter to middleware redirects (helps debugging)
2. Add toast notification when users are redirected due to disabled features
3. Add E2E tests for feature flag scenarios
4. Consider extracting `isEnabled` helper to shared utility
5. Document feature flags in README or docs/

## Conclusion

This PR demonstrates **excellent engineering discipline**:
- Focused scope (no feature creep)
- Defensive coding (no breaking changes)
- Proper cleanup patterns (no memory leaks)
- Hide-not-delete implementation (correct approach)
- Route guards (defense in depth)

**Recommendation: APPROVE AND MERGE**

The code quality is high, the approach is sound, and the P0/P1 stability goals are met. The minor suggestions above are truly optional and do not block merging.

---

**Review Completed:** ✅ All focus areas reviewed  
**Regressions Found:** None  
**Critical Issues:** None  
**Blockers:** None
