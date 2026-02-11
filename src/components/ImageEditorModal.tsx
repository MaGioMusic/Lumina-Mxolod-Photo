'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2, Wand2, Compare, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: string;
  originalImageUrl: string;
  propertyTitle?: string;
  onImageEdited?: (image: { id: string; url: string }) => void;
}

export default function ImageEditorModal({
  isOpen,
  onClose,
  imageId,
  originalImageUrl,
  propertyTitle,
  onImageEdited,
}: ImageEditorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [strength, setStrength] = useState([0.7]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please describe the changes you want to make');
      return;
    }

    setIsEditing(true);
    setEditedImage(null);

    try {
      const response = await fetch('/api/images/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId,
          prompt,
          negativePrompt: negativePrompt || undefined,
          strength: strength[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to edit image');
      }

      setEditedImage(data.image.url);
      toast.success('Image edited successfully!');
      
      if (onImageEdited) {
        onImageEdited(data.image);
      }
    } catch (error) {
      console.error('Error editing image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to edit image');
    } finally {
      setIsEditing(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setNegativePrompt('');
    setStrength([0.7]);
    setEditedImage(null);
    setShowComparison(false);
    onClose();
  };

  const promptSuggestions = [
    'Brighten the room with more natural light',
    'Change the wall color to warm beige',
    'Add modern furniture to the empty space',
    'Enhance the outdoor view through windows',
    'Declutter and clean up the space',
    'Add cozy evening lighting with lamps',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Image Editor
          </DialogTitle>
          <DialogDescription>
            {propertyTitle 
              ? `Enhance and edit property images for "${propertyTitle}"`
              : 'Enhance and edit property images using AI'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="space-y-2">
            <Label>Original Image</Label>
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
              <img
                src={originalImageUrl}
                alt="Original property"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Edited Image Preview */}
          <div className="space-y-2">
            <Label>{editedImage ? 'Edited Image' : 'Preview'}</Label>
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
              {editedImage ? (
                <img
                  src={editedImage}
                  alt="Edited property"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {isEditing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <span className="text-sm">Edited image will appear here</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="editPrompt">
              What changes would you like to make? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="editPrompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the changes you want..."
              className="min-h-[80px]"
              disabled={isEditing}
            />
          </div>

          {/* Prompt Suggestions */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick suggestions:</Label>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  disabled={isEditing}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label htmlFor="negativePrompt">
              Exclude (Optional)
            </Label>
            <Textarea
              id="negativePrompt"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Things to exclude from the edited image..."
              className="min-h-[60px]"
              disabled={isEditing}
            />
          </div>

          {/* Strength Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Transformation Strength</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(strength[0] * 100)}%
              </span>
            </div>
            <Slider
              value={strength}
              onValueChange={setStrength}
              min={0.1}
              max={1}
              step={0.05}
              disabled={isEditing}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtle (keep original)</span>
              <span>Strong (major changes)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {editedImage && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowComparison(!showComparison)}
              >
                <Compare className="mr-2 h-4 w-4" />
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isEditing}
            >
              Close
            </Button>
            <Button type="submit" disabled={isEditing || !prompt.trim()}>
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Editing...
                </>
              ) : editedImage ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Comparison View */}
        {showComparison && editedImage && (
          <div className="mt-6 border-t pt-6">
            <Label className="mb-4 block">Before & After Comparison</Label>
            <div className="relative">
              <img
                src={originalImageUrl}
                alt="Original"
                className="w-full rounded-lg"
              />
              <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                <img
                  src={editedImage}
                  alt="Edited"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Original
              </div>
              <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded">
                Edited
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
