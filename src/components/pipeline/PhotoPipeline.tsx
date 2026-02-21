'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Upload, 
  X, 
  Check, 
  RotateCcw, 
  Trash2, 
  Move, 
  Image as ImageIcon,
  Wand2,
  AlertTriangle,
  ChevronDown,
  Grid3X3,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type RoomType = 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'other';

interface PipelinePhoto {
  id: string;
  url: string;
  room: RoomType;
  enhanced: boolean;
  selectedForListing: boolean;
  fileName: string;
  uploadDate: number;
}

interface ActionHistoryItem {
  type: 'bulk-enhanced' | 'bulk-room' | 'bulk-listing' | 'auto-sort' | 'delete' | 'room-assign';
  previousState: PipelinePhoto[];
  timestamp: number;
  description: string;
}

interface DraftData {
  version: number;
  photos: PipelinePhoto[];
  timestamp: number;
  expiresAt: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DRAFT_STORAGE_VERSION = 1;
const DRAFT_STORAGE_KEY = 'lumina:pipeline:draft';
const MAX_PHOTOS = 40;
const MAX_FILE_SIZE_MB = 10;

const ALLOWED_ORIGINS = [
  'https://storage.googleapis.com',
  'https://lumina-estate.com',
  'https://cdn.lumina.io',
  'https://images.unsplash.com',
  'blob:', // For local blob URLs before upload
];

const ROOM_OPTIONS: { value: RoomType; label: { ka: string; en: string; ru: string } }[] = [
  { value: 'living-room', label: { ka: 'მისაღები', en: 'Living Room', ru: 'Гостиная' } },
  { value: 'bedroom', label: { ka: 'საძინებელი', en: 'Bedroom', ru: 'Спальня' } },
  { value: 'kitchen', label: { ka: 'სამზარეულო', en: 'Kitchen', ru: 'Кухня' } },
  { value: 'bathroom', label: { ka: 'სააბაზანო', en: 'Bathroom', ru: 'Ванная' } },
  { value: 'exterior', label: { ka: 'ექსტერიერი', en: 'Exterior', ru: 'Экстерьер' } },
  { value: 'other', label: { ka: 'სხვა', en: 'Other', ru: 'Другое' } },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Allow blob URLs for local previews
    if (urlObj.protocol === 'blob:') return true;
    // Check against allowed origins
    return ALLOWED_ORIGINS.some(origin => 
      urlObj.origin === origin || 
      urlObj.hostname.endsWith('.googleapis.com') ||
      urlObj.hostname.endsWith('.unsplash.com')
    );
  } catch {
    return false;
  }
};

const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `File size must be less than ${MAX_FILE_SIZE_MB}MB` };
  }
  return { valid: true };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PhotoPipeline() {
  const { language, t } = useLanguage();
  const safeLang = language === 'ru' ? 'ru' : language === 'en' ? 'en' : 'ka';

  // State
  const [photos, setPhotos] = useState<PipelinePhoto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    destructive?: boolean;
  } | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Toast state (defined early for use in callbacks)
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    action?: { label: string; onClick: () => void };
  } | null>(null);

  const showToast = useCallback((options: typeof toast) => {
    setToast(options);
    if (!options?.action) {
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  // ============================================================================
  // LOCALSTORAGE & DRAFT
  // ============================================================================

  // Load draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!stored) return;

      const data: DraftData = JSON.parse(stored);

      // Version check
      if (data.version !== DRAFT_STORAGE_VERSION) {
        console.warn('Draft version mismatch, clearing');
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
      }

      // Expiry check
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
      }

      // URL validation on load
      const validPhotos = data.photos.filter(p => isValidImageUrl(p.url));
      if (validPhotos.length !== data.photos.length) {
        console.warn(`Removed ${data.photos.length - validPhotos.length} invalid photo URLs`);
      }
      setPhotos(validPhotos);
    } catch (error) {
      console.error('Failed to load draft', error);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    if (photos.length === 0) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    const draftData: DraftData = {
      version: DRAFT_STORAGE_VERSION,
      photos,
      timestamp: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error('Failed to save draft', error);
    }
  }, [photos]);

  // ============================================================================
  // ACTION HISTORY & UNDO
  // ============================================================================

  const addToHistory = useCallback((type: ActionHistoryItem['type'], description: string) => {
    setActionHistory(prev => [...prev.slice(-9), {
      type,
      previousState: [...photos],
      timestamp: Date.now(),
      description,
    }]);
  }, [photos]);

  const undoLastAction = useCallback(() => {
    const last = actionHistory[actionHistory.length - 1];
    if (!last) return;

    setPhotos(last.previousState);
    setActionHistory(prev => prev.slice(0, -1));
    setSelectedIds(new Set()); // Clear selection after undo
    
    showToast({
      message: t('actionUndone') || 'Action undone',
      type: 'success',
    });
  }, [actionHistory, t, showToast]);

  const canUndo = actionHistory.length > 0;

  // ============================================================================
  // FILE UPLOAD
  // ============================================================================

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      showToast({ message: t('maxPhotosReached') || `Maximum ${MAX_PHOTOS} photos allowed`, type: 'error' });
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newPhotos: PipelinePhoto[] = [];

    for (const file of filesToProcess) {
      const validation = validateFile(file);
      if (!validation.valid) {
        showToast({ message: `${file.name}: ${validation.error}`, type: 'error' });
        continue;
      }

      // Simulate upload progress
      const id = generateId();
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));

      try {
        // Create local blob URL for preview (will be replaced with actual upload)
        const blobUrl = URL.createObjectURL(file);
        
        // Simulate progress
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(r => setTimeout(r, 100));
          setUploadProgress(prev => ({ ...prev, [id]: i }));
        }

        newPhotos.push({
          id,
          url: blobUrl,
          room: 'other',
          enhanced: false,
          selectedForListing: true,
          fileName: file.name,
          uploadDate: Date.now(),
        });

        setUploadProgress(prev => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      } catch (error) {
        console.error('Upload failed:', error);
        showToast({ message: t('uploadFailed') || 'Upload failed', type: 'error' });
      }
    }

    if (newPhotos.length > 0) {
      addToHistory('bulk-enhanced', `Added ${newPhotos.length} photos`);
      setPhotos(prev => [...prev, ...newPhotos]);
      showToast({ 
        message: t('photosAdded') || `Added ${newPhotos.length} photos`, 
        type: 'success',
        action: { label: t('undo') || 'Undo', onClick: undoLastAction }
      });
    }
  }, [photos.length, addToHistory, undoLastAction, t, showToast]);

  // ============================================================================
  // DRAG & DROP
  // ============================================================================

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // ============================================================================
  // SELECTION
  // ============================================================================

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(photos.map(p => p.id)));
  }, [photos]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ============================================================================
  // BULK ACTIONS WITH CONFIRMATION
  // ============================================================================

  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    destructive = false
  ) => {
    setConfirmDialog({ open: true, title, message, onConfirm, destructive });
  }, []);

  const markAllEnhanced = useCallback(() => {
    const hasManualChanges = photos.some(p => !p.enhanced);
    if (!hasManualChanges) return;

    showConfirmation(
      t('confirmMarkEnhanced') || 'Mark all as enhanced?',
      t('confirmMarkEnhancedDesc') || `This will mark ${photos.length} photos as enhanced.`,
      () => {
        addToHistory('bulk-enhanced', 'Marked all as enhanced');
        setPhotos(prev => prev.map(p => ({ ...p, enhanced: true })));
        showToast({ 
          message: t('allMarkedEnhanced') || 'All photos marked as enhanced',
          type: 'success',
          action: { label: t('undo') || 'Undo', onClick: undoLastAction }
        });
      }
    );
  }, [photos, addToHistory, undoLastAction, showConfirmation, t, showToast]);

  const performAutoSort = useCallback(() => {
    addToHistory('auto-sort', 'Auto-sorted by filename');
    
    const sorted = [...photos].sort((a, b) => a.fileName.localeCompare(b.fileName));
    
    // Simple heuristic: keyword-based room detection
    const withRooms = sorted.map(photo => {
      const name = photo.fileName.toLowerCase();
      let room: RoomType = 'other';
      
      if (name.includes('bed') || name.includes('sleep')) room = 'bedroom';
      else if (name.includes('kitchen') || name.includes('cook')) room = 'kitchen';
      else if (name.includes('bath') || name.includes('toilet')) room = 'bathroom';
      else if (name.includes('living') || name.includes('lounge')) room = 'living-room';
      else if (name.includes('ext') || name.includes('out') || name.includes('facade')) room = 'exterior';
      
      return { ...photo, room };
    });

    setPhotos(withRooms);
    showToast({ 
      message: t('autoSortComplete') || 'Photos auto-sorted by filename',
      type: 'success',
      action: { label: t('undo') || 'Undo', onClick: undoLastAction }
    });
  }, [photos, addToHistory, undoLastAction, t, showToast]);

  const autoSortByFilename = useCallback(() => {
    const hasManualAssignments = photos.some(p => p.room !== 'other');

    if (hasManualAssignments) {
      showConfirmation(
        t('confirmAutoSort') || 'Auto-sort will overwrite manual assignments',
        t('confirmAutoSortDesc') || 'Your manual room assignments will be lost. Continue?',
        () => performAutoSort(),
        true
      );
    } else {
      performAutoSort();
    }
  }, [photos, showConfirmation, t, performAutoSort]);

  const applyRoomToSelected = useCallback((room: RoomType) => {
    if (selectedIds.size === 0) {
      showToast({ message: t('selectPhotosFirst') || 'Select photos first', type: 'error' });
      return;
    }

    // Calculate changes for detailed feedback
    const changesBreakdown: Record<string, number> = {};
    selectedIds.forEach(id => {
      const photo = photos.find(p => p.id === id);
      if (photo && photo.room !== room) {
        const fromLabel = ROOM_OPTIONS.find(r => r.value === photo.room)?.label[safeLang] || 'Other';
        changesBreakdown[fromLabel] = (changesBreakdown[fromLabel] || 0) + 1;
      }
    });

    const changesText = Object.entries(changesBreakdown)
      .map(([from, count]) => `${count} from ${from}`)
      .join(', ');

    const targetRoomLabel = ROOM_OPTIONS.find(r => r.value === room)?.label[safeLang] || room;

    addToHistory('bulk-room', `Assigned ${selectedIds.size} photos to ${targetRoomLabel}`);
    
    setPhotos(prev => prev.map(p => 
      selectedIds.has(p.id) ? { ...p, room } : p
    ));

    showToast({ 
      message: changesText 
        ? `Moved to ${targetRoomLabel}: ${changesText}`
        : `${selectedIds.size} photos already in ${targetRoomLabel}`,
      type: 'success',
      action: { label: t('undo') || 'Undo', onClick: undoLastAction }
    });

    // Optional: Clear selection after operation
    setTimeout(() => setSelectedIds(new Set()), 2000);
  }, [selectedIds, photos, addToHistory, undoLastAction, safeLang, t, showToast]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) {
      showToast({ message: t('selectPhotosFirst') || 'Select photos first', type: 'error' });
      return;
    }

    showConfirmation(
      t('confirmDelete') || `Delete ${selectedIds.size} photos?`,
      t('confirmDeleteDesc') || 'This action cannot be undone (except via Undo button).',
      () => {
        const toDelete = new Set(selectedIds);
        addToHistory('delete', `Deleted ${selectedIds.size} photos`);
        setPhotos(prev => prev.filter(p => !toDelete.has(p.id)));
        setSelectedIds(new Set());
        showToast({ 
          message: t('photosDeleted') || `${toDelete.size} photos deleted`,
          type: 'success',
          action: { label: t('undo') || 'Undo', onClick: undoLastAction }
        });
      },
      true
    );
  }, [selectedIds, addToHistory, undoLastAction, showConfirmation, t, showToast]);

  // ============================================================================
  // INDIVIDUAL ACTIONS
  // ============================================================================

  const updatePhotoRoom = useCallback((id: string, room: RoomType) => {
    addToHistory('room-assign', `Changed room assignment`);
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, room } : p));
  }, [addToHistory]);

  const toggleEnhanced = useCallback((id: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, enhanced: !p.enhanced } : p
    ));
  }, []);

  const toggleSelectedForListing = useCallback((id: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, selectedForListing: !p.selectedForListing } : p
    ));
  }, []);

  const removePhoto = useCallback((id: string) => {
    showConfirmation(
      t('confirmRemove') || 'Remove this photo?',
      t('confirmRemoveDesc') || 'The photo will be removed from this listing.',
      () => {
        addToHistory('delete', 'Removed 1 photo');
        setPhotos(prev => prev.filter(p => p.id !== id));
        showToast({ 
          message: t('photoRemoved') || 'Photo removed',
          type: 'success',
          action: { label: t('undo') || 'Undo', onClick: undoLastAction }
        });
      },
      true
    );
  }, [addToHistory, undoLastAction, showConfirmation, t, showToast]);

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const handleSubmit = useCallback(async () => {
    const selected = photos.filter(p => p.selectedForListing);
    
    if (selected.length === 0) {
      showToast({ message: t('selectAtLeastOne') || 'Select at least one photo', type: 'error' });
      return;
    }

    // Validate URLs before submit
    const invalidUrls = selected.filter(p => !isValidImageUrl(p.url));
    if (invalidUrls.length > 0) {
      showToast({ 
        message: t('invalidUrls') || `${invalidUrls.length} photos have invalid URLs`, 
        type: 'error' 
      });
      return;
    }

    try {
      const response = await fetch('/api/listings/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: selected }),
      });

      if (!response.ok) throw new Error('Submit failed');

      const data = await response.json();
      showToast({ 
        message: t('draftSaved') || 'Draft saved successfully!',
        type: 'success' 
      });
      
      // Clear local draft after successful save
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setPhotos([]);
      
    } catch (error) {
      showToast({ message: t('saveFailed') || 'Failed to save draft', type: 'error' });
    }
  }, [photos, t, showToast]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const selectedCount = selectedIds.size;
  const totalSelected = photos.filter(p => p.selectedForListing).length;
  const totalEnhanced = photos.filter(p => p.enhanced).length;

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('photoPipeline') || 'Photo Pipeline'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {t('photoPipelineDesc') || 'Upload, organize and enhance property photos'}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{photos.length}</span>
          <span className="text-sm text-slate-500">/ {MAX_PHOTOS}</span>
          <span className="text-sm text-slate-500">{t('photos') || 'photos'}</span>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">{totalSelected} {t('selected') || 'selected'}</span>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">{totalEnhanced} {t('enhanced') || 'enhanced'}</span>
        </div>
        <div className="flex-1" />
        {canUndo && (
          <button
            onClick={undoLastAction}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t('undo') || 'Undo'}
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative mb-6 p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all",
          isDragging
            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
          {t('dropPhotosHere') || 'Drop photos here or click to upload'}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          {t('maxFileSize') || `Max ${MAX_FILE_SIZE_MB}MB per file, up to ${MAX_PHOTOS} photos`}
        </p>
      </div>

      {/* Bulk Actions Toolbar */}
      {photos.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedCount === photos.length && photos.length > 0}
              onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
              className="w-5 h-5 rounded border-slate-300"
            />
            <span className="text-sm font-medium">
              {selectedCount > 0 ? `${selectedCount} selected` : t('selectAll') || 'Select all'}
            </span>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Room Assignment Dropdown */}
          <div className="relative group">
            <button
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Move className="w-4 h-4" />
              {t('assignRoom') || 'Assign room'}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {ROOM_OPTIONS.map(room => (
                <button
                  key={room.value}
                  onClick={() => applyRoomToSelected(room.value)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {room.label[safeLang]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={markAllEnhanced}
            disabled={photos.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            {t('markAllEnhanced') || 'Mark all enhanced'}
          </button>

          <button
            onClick={autoSortByFilename}
            disabled={photos.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
          >
            <Grid3X3 className="w-4 h-4" />
            {t('autoSort') || 'Auto-sort'}
          </button>

          <div className="flex-1" />

          <button
            onClick={deleteSelected}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t('delete') || 'Delete'}
          </button>

          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'grid' 
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'list' 
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Photo Grid/List */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
      )}>
        <AnimatePresence>
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "relative group bg-white dark:bg-slate-800 rounded-xl overflow-hidden border",
                selectedIds.has(photo.id) 
                  ? "border-amber-500 ring-2 ring-amber-500/20" 
                  : "border-slate-200 dark:border-slate-700"
              )}
            >
              {/* Image */}
              <div className={cn(
                "relative overflow-hidden bg-slate-100 dark:bg-slate-900",
                viewMode === 'grid' ? "aspect-square" : "aspect-video"
              )}>
                <img
                  src={photo.url}
                  alt={photo.fileName}
                  className="w-full h-full object-cover"
                />
                
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(photo.id)}
                    onChange={() => toggleSelection(photo.id)}
                    className="w-5 h-5 rounded border-slate-300 cursor-pointer"
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {photo.enhanced && (
                    <span className="px-2 py-1 text-xs font-medium bg-amber-500 text-white rounded-full">
                      AI
                    </span>
                  )}
                  {!photo.selectedForListing && (
                    <span className="px-2 py-1 text-xs font-medium bg-slate-500 text-white rounded-full">
                      Hidden
                    </span>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => toggleEnhanced(photo.id)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      photo.enhanced 
                        ? "bg-amber-500 text-white" 
                        : "bg-white/20 text-white hover:bg-white/30"
                    )}
                    title={photo.enhanced ? 'Unmark enhanced' : 'Mark as enhanced'}
                  >
                    <Wand2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleSelectedForListing(photo.id)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      photo.selectedForListing 
                        ? "bg-emerald-500 text-white" 
                        : "bg-white/20 text-white hover:bg-white/30"
                    )}
                    title={photo.selectedForListing ? 'Hide from listing' : 'Show in listing'}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Upload Progress */}
                {uploadProgress[photo.id] !== undefined && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-amber-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <select
                  value={photo.room}
                  onChange={(e) => updatePhotoRoom(photo.id, e.target.value as RoomType)}
                  className="w-full text-sm bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-3 py-2"
                >
                  {ROOM_OPTIONS.map(room => (
                    <option key={room.value} value={room.value}>
                      {room.label[safeLang]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2 truncate">
                  {photo.fileName}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-lg text-slate-500">
            {t('noPhotosYet') || 'No photos yet'}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            {t('uploadPhotosToStart') || 'Upload photos to get started'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      {photos.length > 0 && (
        <div className="fixed bottom-6 right-6 flex gap-3">
          <button
            onClick={() => {
              setPhotos([]);
              localStorage.removeItem(DRAFT_STORAGE_KEY);
            }}
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('clearAll') || 'Clear all'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={totalSelected === 0}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-medium shadow-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('saveDraft') || 'Save draft'} ({totalSelected})
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog?.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-full",
                confirmDialog.destructive 
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600" 
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
              )}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {confirmDialog.title}
                </h3>
                <p className="text-slate-500 mt-2">
                  {confirmDialog.message}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  confirmDialog.destructive
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                )}
              >
                {t('confirm') || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl",
            toast.type === 'error' ? "bg-red-500 text-white" :
            toast.type === 'success' ? "bg-emerald-500 text-white" :
            "bg-slate-800 text-white"
          )}>
            <span className="text-sm font-medium">{toast.message}</span>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="text-sm font-semibold underline hover:no-underline"
              >
                {toast.action.label}
              </button>
            )}
            <button 
              onClick={() => setToast(null)}
              className="ml-2 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
