'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MultiImageDropZoneProps {
  /** Array of uploaded image URLs */
  value: string[];
  /** Callback when the URL array changes */
  onChange: (urls: string[]) => void;
  /** Maximum number of images allowed */
  maxImages?: number;
  /** Whether the drop zone is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Additional className */
  className?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Multi-image drag-and-drop upload zone.
 * Supports 1-N images with thumbnails, individual removal, and URL paste.
 * Uploads files to fal.ai storage via /api/ai-tools/upload.
 */
export function MultiImageDropZone({
  value,
  onChange,
  maxImages = 5,
  disabled = false,
  placeholder = 'Drag & drop images here, or click to browse',
  className,
}: MultiImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploadingCount > 0;
  const canAddMore = value.length < maxImages && !disabled;
  const remaining = maxImages - value.length;

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Use JPEG, PNG, WebP, or GIF.`);
        return null;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}. Max 10 MB.`);
        return null;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/ai-tools/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Upload failed');

        return data.url as string;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to upload image');
        return null;
      }
    },
    [],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const availableSlots = maxImages - value.length;
      if (availableSlots <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const toUpload = files.slice(0, availableSlots);
      if (files.length > availableSlots) {
        toast.warning(`Only uploading ${availableSlots} of ${files.length} files (max ${maxImages})`);
      }

      setUploadingCount(toUpload.length);

      const results = await Promise.all(toUpload.map(uploadFile));
      const successUrls = results.filter((url): url is string => url !== null);

      if (successUrls.length > 0) {
        onChange([...value, ...successUrls]);
        toast.success(`${successUrls.length} image${successUrls.length > 1 ? 's' : ''} uploaded`);
      }

      setUploadingCount(0);
    },
    [maxImages, value, onChange, uploadFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canAddMore && !isUploading) setIsDragging(true);
    },
    [canAddMore, isUploading],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!canAddMore || isUploading) return;

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        ALLOWED_TYPES.includes(f.type),
      );
      if (files.length > 0) uploadFiles(files);
    },
    [canAddMore, isUploading, uploadFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) uploadFiles(files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [uploadFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (value.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    try {
      new URL(trimmed);
      onChange([...value, trimmed]);
      setUrlInput('');
    } catch {
      toast.error('Please enter a valid URL');
    }
  }, [urlInput, value, maxImages, onChange]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Thumbnails Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/30"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Image number badge */}
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
              {/* Remove button */}
              {!disabled && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}

          {/* Add More Tile */}
          {canAddMore && !isUploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Add</span>
            </button>
          )}

          {/* Uploading indicator tile */}
          {isUploading && (
            <div className="aspect-square rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 flex flex-col items-center justify-center gap-1">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-[10px] text-muted-foreground">{uploadingCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Drop Zone (shown when no images yet, or while dragging) */}
      {(value.length === 0 || isDragging) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => canAddMore && !isUploading && fileInputRef.current?.click()}
          className={cn(
            'relative rounded-xl overflow-hidden border-2 border-dashed transition-all duration-200',
            value.length === 0 ? 'min-h-[180px]' : 'min-h-[100px]',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30 hover:bg-muted/50 cursor-pointer',
            disabled && 'opacity-50 pointer-events-none',
          )}
        >
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary" />
                <p className="text-sm font-medium">
                  Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}...
                </p>
              </>
            ) : isDragging ? (
              <>
                <Upload className="h-10 w-10 mb-3 text-primary animate-bounce" />
                <p className="text-sm font-medium text-primary">Drop images here</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3 mb-3">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, WebP, GIF — max 10 MB each — up to {maxImages} images
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Browse Files
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input — multiple */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      {/* URL Input */}
      {canAddMore && !isUploading && value.length === 0 && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              <span>or paste URL</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={disabled || isUploading}
              className="flex-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUrlSubmit}
              disabled={disabled || isUploading || !urlInput.trim()}
            >
              Use URL
            </Button>
          </div>
        </>
      )}

      {/* Image count info */}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxImages} images
          {remaining > 0 && !disabled && ` — ${remaining} more allowed`}
        </p>
      )}
    </div>
  );
}
