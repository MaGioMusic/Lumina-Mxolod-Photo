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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle?: string;
  onImageGenerated?: (image: { id: string; url: string }) => void;
}

const aspectRatioOptions = [
  { value: '16:9', label: 'Landscape (16:9) - Best for listings' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:2', label: 'Photo (3:2)' },
  { value: '1:1', label: 'Square (1:1)' },
  { value: '9:16', label: 'Portrait (9:16)' },
];

const imageSizeOptions = [
  { value: 'landscape_16_9', label: 'Landscape 16:9' },
  { value: 'landscape_4_3', label: 'Landscape 4:3' },
  { value: 'square_hd', label: 'Square HD' },
  { value: 'portrait_16_9', label: 'Portrait 16:9' },
];

export default function ImageGeneratorModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  onImageGenerated,
}: ImageGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('landscape_16_9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a description for the image');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          prompt,
          negativePrompt: negativePrompt || undefined,
          aspectRatio,
          imageSize,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate image');
      }

      setGeneratedImage(data.image.url);
      toast.success('Image generated successfully!');
      
      if (onImageGenerated) {
        onImageGenerated(data.image);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setNegativePrompt('');
    setGeneratedImage(null);
    onClose();
  };

  const promptSuggestions = [
    'Modern luxury apartment living room with floor-to-ceiling windows',
    'Spacious master bedroom with king bed and en-suite bathroom',
    'Contemporary kitchen with marble countertops and stainless steel appliances',
    'Cozy home office with natural light and built-in shelves',
    'Elegant dining room with chandelier seating 8 guests',
    'Private balcony with city skyline views and outdoor furniture',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Image Generator
          </DialogTitle>
          <DialogDescription>
            {propertyTitle 
              ? `Generate professional property images for "${propertyTitle}"`
              : 'Generate professional property images using AI'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the property image you want to generate..."
              className="min-h-[100px]"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about room type, style, lighting, and key features
            </p>
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
                  disabled={isGenerating}
                >
                  {suggestion.substring(0, 40)}...
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
              placeholder="Things to exclude from the image (e.g., clutter, people, cars...)"
              className="min-h-[60px]"
              disabled={isGenerating}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatioOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image Size</Label>
              <Select value={imageSize} onValueChange={setImageSize} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-2">
              <Label>Generated Image</Label>
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                <img
                  src={generatedImage}
                  alt="Generated property image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
            >
              Close
            </Button>
            <Button type="submit" disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
