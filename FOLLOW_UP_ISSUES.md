# Follow-up Issues for Listing Pipeline

**Created:** 2026-02-16  
**Related PR:** oraculus/p2-ai-pipeline-polish-bulk-tools  
**Status:** High-priority fixes applied ✅

---

## Medium Priority Issues

### Issue #1: Undo Functionality for Bulk Actions
**Priority:** P2  
**Effort:** Medium  
**Impact:** High UX improvement

**Description:**
Add undo capability for bulk actions (mark all enhanced, auto-sort rooms, bulk room assignment).

**Implementation:**
```typescript
// Add action history state
const [actionHistory, setActionHistory] = useState<Array<{
  type: 'bulk-enhanced' | 'bulk-room' | 'bulk-listing' | 'auto-sort';
  previousState: PipelinePhoto[];
  timestamp: number;
}>>([]);

// Wrap bulk actions
const withUndo = (actionType: string, action: () => void) => {
  setActionHistory(prev => [...prev.slice(-9), { 
    type: actionType, 
    previousState: [...photos],
    timestamp: Date.now()
  }]);
  action();
  
  toast.success('Action completed', {
    action: { label: 'Undo', onClick: undoLastAction }
  });
};

const undoLastAction = () => {
  const last = actionHistory[actionHistory.length - 1];
  if (last) {
    setPhotos(last.previousState);
    setActionHistory(prev => prev.slice(0, -1));
    toast.success('Action undone');
  }
};
```

---

### Issue #2: Confirmation Dialogs for Destructive Actions
**Priority:** P2  
**Effort:** Low  
**Impact:** Medium (prevents user errors)

**Description:**
Add confirmation before auto-sort and mark-all operations when user has manual data.

**Implementation:**
```typescript
const autoSortByFilename = () => {
  const hasManualAssignments = photos.some(p => p.room !== 'other');
  
  if (hasManualAssignments) {
    const confirmed = window.confirm(
      'Auto-sort will overwrite your manual room assignments. Continue?'
    );
    if (!confirmed) return;
  }
  
  // ... existing auto-sort logic
};
```

**Suggested improvements:**
- Use a proper Dialog component instead of `window.confirm`
- Add "Don't ask again" checkbox (store in localStorage)
- Show preview of what will change

---

### Issue #3: API URL Validation & Whitelisting
**Priority:** P2  
**Effort:** Medium  
**Impact:** High (security)

**Description:**
Add origin whitelist for photo URLs to prevent SSRF if backend later fetches them.

**Implementation:**
```typescript
// In src/app/api/listings/draft/route.ts
const ALLOWED_ORIGINS = [
  'https://lumina-estate.com',
  'https://cdn.lumina.io',
  'https://storage.googleapis.com',
  // Add other trusted CDNs
];

const photoSchema = z.object({
  id: z.string().min(1),
  url: z.string().url().refine(
    (url) => {
      try {
        const urlObj = new URL(url);
        return ALLOWED_ORIGINS.some(origin => 
          urlObj.origin === origin || 
          urlObj.hostname.endsWith('.lumina.io')
        );
      } catch {
        return false;
      }
    },
    { message: 'Photo URL must be from an allowed domain' }
  ),
  room: roomSchema,
  enhanced: z.boolean(),
  selectedForListing: z.boolean(),
});
```

---

### Issue #4: localStorage Versioning & Migration
**Priority:** P2  
**Effort:** Low  
**Impact:** Medium (prevents stale data bugs)

**Description:**
Add version metadata to localStorage draft to handle schema changes.

**Implementation:**
```typescript
const DRAFT_STORAGE_VERSION = 1;
const DRAFT_STORAGE_KEY = 'lumina:listings:draft:last';

// On save
const draftData = {
  version: DRAFT_STORAGE_VERSION,
  draft,
  timestamp: Date.now(),
  expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
};
localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));

// On load (in useEffect)
const loadLastDraft = () => {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Check version
    if (data.version !== DRAFT_STORAGE_VERSION) {
      console.warn('Draft version mismatch, clearing');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
    
    // Check expiry
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
    
    return data.draft;
  } catch (error) {
    console.error('Failed to load draft', error);
    return null;
  }
};
```

---

### Issue #5: Improved Bulk Action Feedback
**Priority:** P2  
**Effort:** Low  
**Impact:** Medium (UX clarity)

**Description:**
Show more detailed feedback for bulk room assignment showing what changed.

**Current:**
```
"Assigned 5 photo(s) to Bedroom"
```

**Improved:**
```typescript
const applyRoomToSelected = () => {
  if (selectedIds.length === 0) {
    toast.error('Select photos first');
    return;
  }
  
  const targetRoomLabel = ROOM_OPTIONS.find((r) => r.value === bulkRoom)?.label;
  const changesBreakdown = selectedIds.reduce((acc, id) => {
    const photo = photos.find(p => p.id === id);
    if (photo && photo.room !== bulkRoom) {
      const fromLabel = ROOM_OPTIONS.find(r => r.value === photo.room)?.label;
      acc[fromLabel || 'Other'] = (acc[fromLabel || 'Other'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const changesText = Object.entries(changesBreakdown)
    .map(([from, count]) => `${count} from ${from}`)
    .join(', ');
  
  setPhotos((prev) =>
    prev.map((p) => (selectedIds.includes(p.id) ? { ...p, room: bulkRoom } : p))
  );
  
  toast.success(
    `Moved to ${targetRoomLabel}: ${changesText}`,
    { duration: 4000 }
  );
};
```

---

## Low Priority Issues

### Issue #6: Room Balance Validation
**Priority:** P3  
**Effort:** Medium  
**Impact:** Low (business logic)

**Description:**
Add optional validation for listing composition (e.g., warn if all photos are exterior).

**Suggested rules:**
- At least 1 interior photo required
- Maximum 50% exterior photos recommended
- At least 3 different room types for full property listings

---

### Issue #7: Photo Grid Virtualization
**Priority:** P3  
**Effort:** High  
**Impact:** Low (already limited to 40 photos)

**Description:**
Add virtualization for large photo grids using `react-window` or similar.

**When to implement:**
- If photo limit is increased beyond 40
- If page performance degrades with 40 high-res images

---

### Issue #8: Clear Selection After Bulk Operations
**Priority:** P3  
**Effort:** Low  
**Impact:** Low (minor UX improvement)

**Description:**
Optionally clear selection after bulk room assignment to avoid confusion.

**Implementation:**
```typescript
toast.success(`Assigned ${selectedIds.length} photo(s)`, {
  action: {
    label: 'Keep selection',
    onClick: () => {} // Do nothing
  }
});

// Auto-clear after 2 seconds if user doesn't interact
setTimeout(() => {
  setSelectedIds([]);
}, 2000);
```

---

### Issue #9: Keyboard Shortcuts
**Priority:** P3  
**Effort:** Medium  
**Impact:** Medium (power user feature)

**Description:**
Add keyboard shortcuts for common actions.

**Suggested shortcuts:**
- `Ctrl/Cmd + A` - Select all
- `Ctrl/Cmd + D` - Deselect all
- `Delete` - Remove selected photos
- `Ctrl/Cmd + Shift + M` - Mark selected for listing
- `1-6` - Quick assign to room type

---

### Issue #10: Drag-and-Drop Room Assignment
**Priority:** P3  
**Effort:** High  
**Impact:** Medium (advanced UX)

**Description:**
Allow drag-and-drop photos between room sections for quick organization.

**Libraries to consider:**
- `dnd-kit`
- `react-beautiful-dnd`

---

## Testing Priorities

### Unit Tests Needed
1. Photo ID stability across uploads
2. Selection state persistence during room changes
3. Bulk action feedback accuracy
4. Draft API validation edge cases

### Integration Tests Needed
1. Full workflow: upload → organize → mark → create draft
2. Error recovery (API failures, network issues)
3. localStorage persistence and expiry
4. Concurrent user actions

### E2E Tests Needed
1. Upload 40 photos, organize, create draft
2. Select all → bulk assign → create draft
3. Auto-sort with filename hints
4. Error states and recovery

---

## Performance Optimizations

### Potential Improvements
1. **Lazy load images** in photo grid
2. **Debounce state updates** during rapid selection changes
3. **Memoize grouped calculations** with `useMemo`
4. **Use `useCallback`** for event handlers to prevent re-renders
5. **Optimize photo thumbnails** (lazy load full resolution)

---

## Accessibility Improvements

### WCAG 2.1 AA Compliance
1. **Keyboard navigation** for photo grid
2. **Screen reader announcements** for bulk actions
3. **Focus management** after modal close
4. **ARIA labels** for icon buttons
5. **Color contrast** on badges and state indicators

---

## Documentation Needs

1. **User guide** for Listing Pipeline workflow
2. **API documentation** for `/api/listings/draft`
3. **Type definitions** in shared types file
4. **Architecture decision records** (ADRs) for key design choices

---

## Metrics & Analytics

### Track These Events
1. Photos uploaded count distribution
2. Bulk actions usage frequency
3. Auto-sort adoption rate
4. Average time to create draft
5. Error rates by error type
6. Draft abandonment rate

---

## Summary

**✅ Completed (High Priority):**
- Photo ID stability
- Error handling improvements
- Empty state guidance
- Bulk action feedback
- Draft ID collision prevention

**🔄 In Progress (Medium Priority):**
- None currently

**📋 Backlog (Low Priority):**
- 10 enhancement items documented above

**Next Actions:**
1. Create GitHub issues for medium-priority items
2. Prioritize based on user feedback
3. Schedule follow-up PRs

