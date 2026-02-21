# PhotoPipeline Component

> Property photo upload and management interface for agents
> Created: 2026-02-21
> Status: Ready for testing

## Overview

The PhotoPipeline is a comprehensive photo management interface that allows real estate agents to upload, organize, and prepare property photos for listings.

## Features

### Core Functionality
- **Upload:** Drag & drop or click to upload up to 40 photos
- **Room Assignment:** Categorize photos by room type
- **AI Enhancement:** Mark photos as AI-enhanced
- **Selection Control:** Choose which photos appear in listing
- **Undo System:** Revert any bulk action
- **Draft Persistence:** Auto-save to localStorage with 7-day expiry

### Implemented Issues from FOLLOW_UP_ISSUES

#### ✅ Issue #1: Undo Functionality
- All bulk actions support undo
- History maintained for last 10 actions
- Visual toast with undo button

#### ✅ Issue #2: Confirmation Dialogs
- "Auto-sort" warns before overwriting manual assignments
- "Delete" confirms before removing photos
- Uses modal dialog (not window.confirm)

#### ✅ Issue #3: URL Validation
- Whitelist: Google Cloud Storage, Lumina CDN, Unsplash
- Blocks suspicious/invalid URLs
- Validates on load and submit

#### ✅ Issue #4: localStorage Versioning
- Version metadata included
- Automatic cleanup on version mismatch
- 7-day expiry for drafts

## Technical Details

### Component Location
```
src/components/pipeline/PhotoPipeline.tsx
src/components/pipeline/index.ts
src/app/(dashboard)/profile/pipeline/page.tsx
```

### Props Interface
```typescript
interface PipelinePhoto {
  id: string;
  url: string;
  room: RoomType;
  enhanced: boolean;
  selectedForListing: boolean;
  fileName: string;
  uploadDate: number;
}

type RoomType = 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'other';
```

### Constants
- `MAX_PHOTOS = 40`
- `MAX_FILE_SIZE_MB = 10`
- `DRAFT_STORAGE_VERSION = 1`
- `DRAFT_EXPIRY_DAYS = 7`

### Allowed Origins
- `https://storage.googleapis.com`
- `https://lumina-estate.com`
- `https://cdn.lumina.io`
- `https://images.unsplash.com`
- `blob:` (for local previews)

## User Flow

1. **Upload Photos**
   - Drag & drop onto zone OR click to browse
   - Max 10MB per file
   - Images only (jpeg, png, webp)

2. **Organize**
   - Select photos (checkbox)
   - Assign room type from dropdown
   - Mark as "AI Enhanced" if processed
   - Toggle visibility in listing

3. **Bulk Actions**
   - "Select All" / "Deselect All"
   - "Assign Room" to selected
   - "Mark All Enhanced"
   - "Auto-sort" by filename (with confirmation)
   - "Delete" selected (with confirmation)

4. **Undo**
   - Any action can be undone via button or toast
   - History preserved for 10 actions

5. **Save Draft**
   - Automatically saved to localStorage
   - Persists for 7 days
   - Version-checked on load

## Testing Checklist

- [ ] Upload 2-3 photos via drag & drop
- [ ] Upload via click/browse
- [ ] Assign rooms to photos
- [ ] Mark photos as enhanced
- [ ] Toggle listing visibility
- [ ] Test "Auto-sort" confirmation dialog
- [ ] Test "Delete" confirmation dialog
- [ ] Click Undo after action
- [ ] Refresh page — draft should persist
- [ ] Check 7-day expiry (modify localStorage date)

## i18n Keys Used

### Need Translation
- `photoPipeline`
- `photoPipelineDesc`
- `dropPhotosHere`
- `maxFileSize`
- `selectAll`
- `assignRoom`
- `markAllEnhanced`
- `autoSort`
- `confirmAutoSort`
- `confirmAutoSortDesc`
- `autoSortComplete`
- `confirmDelete`
- `confirmDeleteDesc`
- `confirmRemove`
- `confirmRemoveDesc`
- `photosDeleted`
- `photoRemoved`
- `selectPhotosFirst`
- `selectAtLeastOne`
- `invalidUrls`
- `draftSaved`
- `saveFailed`
- `uploadFailed`
- `photosAdded`
- `maxPhotosReached`
- `actionUndone`
- `clearAll`
- `saveDraft`
- `allMarkedEnhanced`
- `undo`
- `cancel`
- `confirm`

## Future Enhancements

- [ ] Actual AI enhancement integration
- [ ] Cloud upload (currently blob URLs)
- [ ] Photo reordering via drag
- [ ] Bulk rotate
- [ ] Zoom/preview modal
- [ ] EXIF data extraction

## Related
- [[2026-02-21]] — Development log
- [[FOLLOW_UP_ISSUES]] — Original requirements
- [[Quick-Context]] — Current status

---
*Component size: ~1000 lines  
*Build: PASS  
*Lint: 0 warnings*
