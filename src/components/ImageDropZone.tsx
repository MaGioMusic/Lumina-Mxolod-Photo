'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageDropZoneProps {
  /** Current image URL (from upload or pasted) */
  value: string;
  /** Callback when image URL changes */
  onChange: (url: string) => void;
  /** Whether the drop zone is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Aspect ratio class for the preview (e.g. "aspect-video", "aspect-[4/3]") */
  aspectRatio?: string;
  /** Additional className for the container */
  className?: string;
  /** Show URL input alongside drop zone */
  showUrlInput?: boolean;
}

/**
 * Drag-and-drop image upload zone with file picker and URL paste support.
 * Uploads files to fal.ai storage via `/api/ai-tools/upload`.
 */
export function ImageDropZone({
  value,
  onChange,
  disabled = false,
  placeholder = 'Drag & drop an image here, or click to browse',
  aspectRatio = 'aspect-video',
  className,
  showUrlInput = true,
}: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please use JPEG, PNG, WebP, or GIF.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10 MB.');
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/ai-tools/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Upload failed');
        }

        onChange(data.url);
        toast.success('Image uploaded successfully!');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) setIsDragging(true);
    },
    [disabled, isUploading],
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

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        uploadFile(files[0]);
      }
    },
    [disabled, isUploading, uploadFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadFile(files[0]);
      }
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [uploadFile],
  );

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
      onChange(trimmed);
      setUrlInput('');
    } catch {
      toast.error('Please enter a valid URL');
    }
  }, [urlInput, onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop Zone / Preview */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && !value && fileInputRef.current?.click()}
        className={cn(
          'relative rounded-xl overflow-hidden border-2 border-dashed transition-all duration-200',
          aspectRatio,
          value
            ? 'border-solid border-border'
            : isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30 hover:bg-muted/50 cursor-pointer',
          disabled && 'opacity-50 pointer-events-none',
        )}
      >
        {value ? (
          /* Image Preview */
          <>
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            {!disabled && (
              <div className="absolute top-2 right-2 flex gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Re-upload overlay on drag */}
            {isDragging && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-background/90 rounded-xl p-4 text-center shadow-lg">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Drop to replace</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary" />
                <p className="text-sm font-medium">Uploading...</p>
                <p className="text-xs text-muted-foreground mt-1">Please wait</p>
              </>
            ) : isDragging ? (
              <>
                <Upload className="h-10 w-10 mb-3 text-primary animate-bounce" />
                <p className="text-sm font-medium text-primary">Drop image here</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3 mb-3">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, WebP, GIF — max 10 MB
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
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
        />
      </div>

      {/* URL Input */}
      {showUrlInput && !value && (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>or paste URL</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      )}
      {showUrlInput && !value && (
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
      )}
    </div>
  );
}
