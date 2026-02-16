'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAiToolsEnabled } from '@/lib/feature-flags';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Wand2,
  Sofa,
  Loader2,
  Image as ImageIcon,
  Download,
  RotateCcw,
  Home,
  Check,
  ArrowLeftRight,
  Images,
  Layers3,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageDropZone } from '@/components/ImageDropZone';
import { MultiImageDropZone } from '@/components/MultiImageDropZone';

/* ─── Constants ─── */

const aspectRatioOptions = [
  { value: '16:9', label: 'Landscape (16:9)' },
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

const promptSuggestions = [
  'Modern luxury apartment living room with floor-to-ceiling windows',
  'Spacious master bedroom with king bed and en-suite bathroom',
  'Contemporary kitchen with marble countertops and stainless steel appliances',
  'Cozy home office with natural light and built-in shelves',
  'Elegant dining room with chandelier seating 8 guests',
  'Private balcony with city skyline views and outdoor furniture',
];

const editSuggestions = [
  'Brighten the room with more natural light',
  'Change the wall color to warm beige',
  'Add modern furniture to the empty space',
  'Enhance the outdoor view through windows',
  'Declutter and clean up the space',
  'Add cozy evening lighting with lamps',
];

/* ─── Nano Banana Pro — Guided Workflow Data ─── */

type EditRoomType = 'living_room' | 'bedroom' | 'dining_room' | 'kitchen' | 'bathroom' | 'office' | 'hallway' | 'empty_room';
type FrameType = 'none' | 'black' | 'white' | 'wood' | 'aluminum' | 'gold';
type DesignStyle = 'scandinavian' | 'minimalist' | 'modern' | 'classic' | 'industrial' | 'boho' | 'luxury' | 'cozy';

const editRoomTypes: { value: EditRoomType; label: string; icon: string }[] = [
  { value: 'empty_room', label: 'Empty Room', icon: '🏠' },
  { value: 'living_room', label: 'Living Room', icon: '🛋️' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'dining_room', label: 'Dining Room', icon: '🍽️' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'office', label: 'Home Office', icon: '💻' },
  { value: 'hallway', label: 'Hallway / Entry', icon: '🚪' },
];

const frameOptions: { value: FrameType; label: string }[] = [
  { value: 'none', label: 'Keep Original' },
  { value: 'black', label: 'Black Aluminum' },
  { value: 'white', label: 'White PVC' },
  { value: 'wood', label: 'Natural Wood' },
  { value: 'aluminum', label: 'Silver Aluminum' },
  { value: 'gold', label: 'Gold / Champagne' },
];

const designStyles: { value: DesignStyle; label: string; description: string; thumbnail: string }[] = [
  { value: 'scandinavian', label: 'Scandinavian', description: 'Light, airy, natural wood, hygge warmth', thumbnail: '🌿' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean lines, neutral tones, uncluttered', thumbnail: '⬜' },
  { value: 'modern', label: 'Modern', description: 'Sleek, contemporary, statement pieces', thumbnail: '🔲' },
  { value: 'classic', label: 'Classic', description: 'Traditional, elegant, timeless', thumbnail: '🏛️' },
  { value: 'industrial', label: 'Industrial', description: 'Raw materials, exposed brick, metal accents', thumbnail: '🏗️' },
  { value: 'boho', label: 'Bohemian', description: 'Eclectic, colorful textiles, plants', thumbnail: '🌺' },
  { value: 'luxury', label: 'Luxury', description: 'Premium materials, chandelier, opulent', thumbnail: '✨' },
  { value: 'cozy', label: 'Cozy / Warm', description: 'Soft lighting, warm tones, inviting', thumbnail: '🕯️' },
];

/**
 * Build a detailed, professional AI prompt from user selections.
 * This is the core of quality — Proppi-style detailed descriptions
 * with room context and architecture preservation built in.
 */
function buildSmartPrompt(
  room: EditRoomType,
  style: DesignStyle,
  frame: FrameType,
): string {
  const roomLabel = editRoomTypes.find((r) => r.value === room)?.label || 'room';

  // Room-specific context
  const roomContext: Record<EditRoomType, string> = {
    empty_room: `This is an empty unfurnished room.`,
    living_room: `This is a living room.`,
    bedroom: `This is a bedroom.`,
    kitchen: `This is a kitchen.`,
    dining_room: `This is a dining room.`,
    bathroom: `This is a bathroom.`,
    office: `This is a home office.`,
    hallway: `This is a hallway or entry area.`,
  };

  // Full style descriptions — detailed, professional, Proppi-quality
  const stylePrompts: Record<DesignStyle, string> = {
    scandinavian: `Transform into a Scandinavian-style ${roomLabel}. Add light birch wood furniture, white and cream upholstered seating, natural linen and wool textiles, minimalist shelving with curated objects, and fresh green plants. Use a bright, airy palette with warm wood accents and soft ambient lighting. The space should feel bright, calm, and inviting with hygge warmth and excellent natural lighting.`,
    minimalist: `Transform into a minimalist ${roomLabel}. Add furniture with clean geometric lines, neutral white and light grey tones, low-profile seating, and simple tables. Keep surfaces completely uncluttered with only essential items. Use recessed or hidden lighting. The space should feel open, spacious, calm, and deliberately curated with a sense of serenity.`,
    modern: `Transform into a modern contemporary ${roomLabel}. Add sleek furniture with premium materials — polished metal, glass, and dark fabrics. Include statement lighting fixtures, curated art pieces on walls, and a sophisticated palette of greys, charcoals, and accent colors. The space should feel stylish, current, and high-end with carefully considered design details.`,
    classic: `Transform into a classic traditional ${roomLabel}. Add tufted sofas or seating, ornate wood side tables, decorative molding accents, elegant table lamps with fabric shades, and refined accessories. Use rich earth tones, cream fabrics, and dark wood finishes. Include a decorative rug and curtains with elegant draping. The space should feel timeless, sophisticated, and warmly inviting.`,
    industrial: `Transform into an industrial loft-style ${roomLabel}. Add leather furniture, reclaimed wood tables, metal shelving units with exposed hardware, and Edison-style or industrial pendant lighting. Mix raw materials — visible concrete, brick textures, and black iron accents. The space should feel urban, edgy, and character-rich while remaining comfortable and livable.`,
    boho: `Transform into a bohemian ${roomLabel}. Add rattan chairs, low wooden tables, colorful patterned textiles, macramé wall hangings, abundant green plants in varied pots, and layered rugs. Use warm earthy tones mixed with vibrant accent colors — terracotta, teal, mustard. The space should feel artistic, relaxed, eclectic, and personally curated with global influences.`,
    luxury: `Transform into a luxury ${roomLabel}. Add high-end furniture — tufted velvet seating in rich jewel tones, ornate gold-accented tables, a crystal or designer chandelier, silk curtains with elegant draping, and premium decorative moldings. Use marble, brass, and dark wood accents. The space should feel opulent, exclusive, and fit for a premium property listing.`,
    cozy: `Transform into a cozy, warm ${roomLabel}. Add comfortable upholstered furniture with soft cushions, warm-toned area rugs, knit throw blankets, table lamps casting soft golden light, candles, and green plants. Use a warm palette of caramels, creams, and muted earth tones. The space should feel welcoming, intimate, and like a place you want to spend time in.`,
  };

  // Frame change instruction
  const framePrompts: Record<FrameType, string> = {
    none: '',
    black: `Replace all window and door frames with sleek matte black aluminum frames with clean modern profiles and slim sightlines.`,
    white: `Replace all window and door frames with pristine white PVC frames with smooth, fresh, modern finishes.`,
    wood: `Replace all window and door frames with warm natural oak wood frames showing visible grain texture with a satin finish.`,
    aluminum: `Replace all window and door frames with modern brushed silver aluminum frames with a subtle metallic sheen and thin profiles.`,
    gold: `Replace all window and door frames with elegant champagne gold-toned frames with a sophisticated warm metallic glow.`,
  };

  const parts: string[] = [];

  // 1. Room context
  parts.push(roomContext[room]);

  // 2. Frame (if selected)
  if (frame !== 'none') {
    parts.push(framePrompts[frame]);
  }

  // 3. Style (always)
  parts.push(stylePrompts[style]);

  return parts.join(' ');
}

/* ─── Before / After Comparison Slider ─── */

function BeforeAfterSlider({
  originalUrl,
  enhancedUrl,
  onClose,
}: {
  originalUrl: string;
  enhancedUrl: string;
  onClose: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = React.useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    [],
  );

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Before / After
        </Label>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-muted-foreground">
          Close comparison
        </Button>
      </div>
      <div
        ref={containerRef}
        className="relative aspect-[4/3] rounded-xl overflow-hidden border cursor-col-resize select-none"
        onMouseDown={(e) => {
          handleMove(e.clientX);
          setIsDragging(true);
        }}
        onTouchStart={(e) => {
          handleMove(e.touches[0].clientX);
          setIsDragging(true);
        }}
      >
        {/* Enhanced (full background) */}
        <img
          src={enhancedUrl}
          alt="Enhanced"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Original (clipped by slider) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={originalUrl}
            alt="Original"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Slider line + handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <ArrowLeftRight className="h-4 w-4 text-gray-700" />
          </div>
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          Original
        </span>
        <span className="absolute top-3 right-3 bg-green-600/80 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          AI Enhanced
        </span>
      </div>
    </div>
  );
}

type RoomType = 'living_room' | 'bedroom' | 'dining_room' | 'office' | 'kitchen' | 'bathroom';
type StyleType = 'modern' | 'minimalist' | 'scandinavian' | 'luxury' | 'cozy' | 'industrial' | 'bohemian';

const roomTypes: { value: RoomType; label: string; icon: string }[] = [
  { value: 'living_room', label: 'Living Room', icon: '🛋️' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'dining_room', label: 'Dining Room', icon: '🍽️' },
  { value: 'office', label: 'Home Office', icon: '💻' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
];

const styleTypes: { value: StyleType; label: string; description: string }[] = [
  { value: 'modern', label: 'Modern', description: 'Sleek, clean lines' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple, essential' },
  { value: 'scandinavian', label: 'Scandinavian', description: 'Light, natural' },
  { value: 'luxury', label: 'Luxury', description: 'High-end, elegant' },
  { value: 'cozy', label: 'Cozy', description: 'Warm, inviting' },
  { value: 'industrial', label: 'Industrial', description: 'Raw, urban' },
  { value: 'bohemian', label: 'Bohemian', description: 'Eclectic, artistic' },
];

/* ─── Image Generate Tab ─── */

function GenerateTab() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('landscape_16_9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the image');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/ai-tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setNegativePrompt('');
    setGeneratedImage(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Controls */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="gen-prompt">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="gen-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the property image you want to generate..."
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Be specific about room type, style, lighting, and key features
          </p>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick suggestions</Label>
          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(s)}
                disabled={isGenerating}
                className="text-xs px-2.5 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                {s.substring(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2">
          <Label htmlFor="gen-neg">Exclude (Optional)</Label>
          <Textarea
            id="gen-neg"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Things to exclude (e.g., clutter, people, cars...)"
            className="min-h-[60px] resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {aspectRatioOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Image Size</Label>
            <Select value={imageSize} onValueChange={setImageSize} disabled={isGenerating}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {imageSizeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="flex-1">
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />Generate Image</>
            )}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isGenerating}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="space-y-3">
        <Label>Preview</Label>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border bg-muted/50">
          {generatedImage ? (
            <>
              <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 right-3">
                <Button size="sm" variant="secondary" asChild>
                  <a href={generatedImage} target="_blank" rel="noopener noreferrer" download>
                    <Download className="mr-1.5 h-3.5 w-3.5" />Download
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              {isGenerating ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin mb-4 opacity-50" />
                  <p className="text-sm">Generating your image...</p>
                  <p className="text-xs mt-1 opacity-60">This may take 15-30 seconds</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-sm">Your generated image will appear here</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Image Edit Tab (Nano Banana Pro) — Guided Workflow ─── */

function EditTab() {
  // Step tracking
  const [step, setStep] = useState(1); // 1=Upload+Room, 2=Style, 3=Generate

  // Step 1: Upload + Room
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [roomType, setRoomType] = useState<EditRoomType>('empty_room');

  // Step 2: Style choices
  const [designStyle, setDesignStyle] = useState<DesignStyle>('scandinavian');
  const [frameType, setFrameType] = useState<FrameType>('none');

  // Step 3: Generate
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [resultImages, setResultImages] = useState<{ url: string }[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // When moving to step 3, auto-build prompt
  const goToStep3 = () => {
    const prompt = buildSmartPrompt(roomType, designStyle, frameType);
    setGeneratedPrompt(prompt);
    setStep(3);
  };

  const handleEdit = async () => {
    if (imageUrls.length === 0) {
      toast.error('Please upload at least one image');
      setStep(1);
      return;
    }

    setIsEditing(true);
    setResultImages([]);

    try {
      const response = await fetch('/api/ai-tools/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls,
          prompt: generatedPrompt,
          aspectRatio: 'auto',
          resolution: '2K',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to edit image');
      }

      setResultImages(data.images || []);
      toast.success('Image edited successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to edit image');
    } finally {
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setImageUrls([]);
    setRoomType('empty_room');
    setDesignStyle('scandinavian');
    setFrameType('none');
    setGeneratedPrompt('');
    setResultImages([]);
    setShowPrompt(false);
    setShowComparison(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 text-sm">
        {[
          { num: 1, label: 'Upload & Room' },
          { num: 2, label: 'Choose Style' },
          { num: 3, label: 'Generate' },
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            {i > 0 && <div className="flex-1 h-px bg-border" />}
            <button
              type="button"
              onClick={() => s.num < step && setStep(s.num)}
              disabled={s.num > step || isEditing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                s.num === step
                  ? 'bg-primary text-primary-foreground'
                  : s.num < step
                    ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.num < step ? <Check className="h-3 w-3" /> : <span>{s.num}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Upload + Room Type ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Upload Interior Photos (1-5)</Label>
              <p className="text-xs text-muted-foreground">
                Best results with interior room photos — empty rooms or rooms you want to restyle.
              </p>
              <MultiImageDropZone
                value={imageUrls}
                onChange={setImageUrls}
                maxImages={5}
                placeholder="Drag & drop room photos here"
              />
            </div>

            <div className="space-y-3">
              <Label>What type of room is this?</Label>
              <div className="grid grid-cols-2 gap-2">
                {editRoomTypes.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRoomType(r.value)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-all text-left ${
                      roomType === r.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <span className="font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={imageUrls.length === 0}
              className="w-full"
            >
              {imageUrls.length === 0 ? 'Upload photos to continue' : 'Next: Choose Style'}
            </Button>
          </div>

          {/* Preview panel */}
          <div className="space-y-2">
            <Label>Photo Preview</Label>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border bg-muted/50">
              {imageUrls.length > 0 ? (
                <img src={imageUrls[0]} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Upload an interior photo</p>
                  <p className="text-xs mt-2 opacity-60">
                    Works best with: empty rooms, rooms that need furniture, rooms where you want to change frame/window styles
                  </p>
                </div>
              )}
            </div>
            {imageUrls.length > 1 && (
              <p className="text-xs text-muted-foreground">{imageUrls.length} photos uploaded — primary shown above</p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Choose Design Style ── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Style Grid */}
          <div className="space-y-3">
            <Label>Choose a design style</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {designStyles.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setDesignStyle(s.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                    designStyle === s.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-sm'
                      : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
                  }`}
                >
                  <span className="text-2xl">{s.thumbnail}</span>
                  <span className="font-medium text-sm">{s.label}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{s.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frame Change (optional) */}
          <div className="space-y-3">
            <Label>Window & door frames (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {frameOptions.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrameType(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    frameType === f.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={goToStep3} className="flex-1">
              Next: Preview & Generate
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Generate ── */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            {/* Summary */}
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-sm">Your selections</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {editRoomTypes.find((r) => r.value === roomType)?.icon}{' '}
                    {editRoomTypes.find((r) => r.value === roomType)?.label}
                  </Badge>
                  <Badge variant="secondary">
                    {designStyles.find((s) => s.value === designStyle)?.thumbnail}{' '}
                    {designStyles.find((s) => s.value === designStyle)?.label}
                  </Badge>
                  {frameType !== 'none' && (
                    <Badge variant="secondary">
                      Frame: {frameOptions.find((f) => f.value === frameType)?.label}
                    </Badge>
                  )}
                  <Badge variant="outline">{imageUrls.length} photo{imageUrls.length > 1 ? 's' : ''}</Badge>
                  <Badge variant="outline">2K Resolution</Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Prompt (collapsible) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowPrompt(!showPrompt)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Wand2 className="h-3 w-3" />
                {showPrompt ? 'Hide' : 'Show'} AI prompt (advanced)
              </button>
              {showPrompt && (
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="min-h-[120px] resize-none text-xs"
                  disabled={isEditing}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isEditing}>
                Back
              </Button>
              <Button
                onClick={handleEdit}
                disabled={isEditing || imageUrls.length === 0}
                className="flex-1"
                size="lg"
              >
                {isEditing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI is working...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Generate Styled Photo</>
                )}
              </Button>
            </div>
            {isEditing && (
              <p className="text-xs text-muted-foreground text-center animate-pulse">
                Processing in 2K resolution — this may take 30-60 seconds
              </p>
            )}

            {/* Start over */}
            {resultImages.length > 0 && (
              <Button variant="ghost" onClick={handleReset} className="w-full text-muted-foreground">
                <RotateCcw className="mr-2 h-3.5 w-3.5" />Start Over
              </Button>
            )}
          </div>

          {/* Right: Result / Preview / Comparison */}
          <div className="space-y-3">
            {/* Before/After Comparison Slider */}
            {showComparison && resultImages.length > 0 && imageUrls.length > 0 ? (
              <BeforeAfterSlider
                originalUrl={imageUrls[0]}
                enhancedUrl={resultImages[0].url}
                onClose={() => setShowComparison(false)}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Label>{resultImages.length > 0 ? 'Result' : 'Original'}</Label>
                  {resultImages.length > 0 && imageUrls.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowComparison(true)}
                      className="text-xs"
                    >
                      <ArrowLeftRight className="mr-1.5 h-3 w-3" />
                      Compare
                    </Button>
                  )}
                </div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border bg-muted/50">
                  {resultImages.length > 0 ? (
                    <>
                      <img src={resultImages[0].url} alt="Edited" className="w-full h-full object-cover" />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <Button size="sm" variant="secondary" asChild>
                          <a href={resultImages[0].url} target="_blank" rel="noopener noreferrer" download>
                            <Download className="mr-1.5 h-3.5 w-3.5" />Download
                          </a>
                        </Button>
                      </div>
                      <Badge className="absolute top-3 left-3 bg-green-600/90 text-white">
                        <Check className="h-3 w-3 mr-1" />AI Generated
                      </Badge>
                    </>
                  ) : (
                    <>
                      {imageUrls.length > 0 ? (
                        <img src={imageUrls[0]} alt="Original" className="w-full h-full object-cover opacity-70" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          {isEditing ? (
                            <>
                              <Loader2 className="h-12 w-12 animate-spin mb-4 opacity-50" />
                              <p className="text-sm">AI is transforming your photo...</p>
                              <p className="text-xs mt-1 opacity-60">2K quality takes a bit longer</p>
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-16 w-16 mb-4 opacity-20" />
                              <p className="text-sm">Result will appear here</p>
                            </>
                          )}
                        </div>
                      )}
                      {isEditing && imageUrls.length > 0 && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                          <Loader2 className="h-12 w-12 animate-spin mb-4 text-white" />
                          <p className="text-sm text-white font-medium">Transforming...</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Multiple result thumbnails */}
            {resultImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {resultImages.map((img, i) => (
                  <a
                    key={i}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all"
                  >
                    <img src={img.url} alt={`Result ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Virtual Staging Tab ─── */

function StagingTab() {
  const [imageUrl, setImageUrl] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('living_room');
  const [style, setStyle] = useState<StyleType>('modern');
  const [furnishEmpty, setFurnishEmpty] = useState(true);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [isStaging, setIsStaging] = useState(false);
  const [stagedImage, setStagedImage] = useState<string | null>(null);

  const handleStage = async () => {
    if (!imageUrl.trim()) {
      toast.error('Please provide an image URL');
      return;
    }

    setIsStaging(true);
    setStagedImage(null);

    try {
      const response = await fetch('/api/ai-tools/virtual-staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          roomType,
          style,
          furnishEmpty,
          preserveStructure,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to stage image');
      }

      setStagedImage(data.image.url);
      toast.success('Virtual staging completed!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to stage image');
    } finally {
      setIsStaging(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Upload & Controls */}
      <div className="space-y-5">
        {/* Image Upload / Drop Zone */}
        <div className="space-y-2">
          <Label>Room Image</Label>
          <ImageDropZone
            value={imageUrl}
            onChange={setImageUrl}
            disabled={isStaging}
            placeholder="Drag & drop a room photo, or click to browse"
            aspectRatio="aspect-video"
          />
          {imageUrl && !furnishEmpty && (
            <Badge className="bg-amber-500/90">Restyle Mode</Badge>
          )}
        </div>

        {/* Room Type */}
          <div className="space-y-2">
            <Label>Room Type</Label>
            <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)} disabled={isStaging}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roomTypes.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <span className="mr-2">{r.icon}</span>{r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Design Style */}
          <div className="space-y-2">
            <Label>Design Style</Label>
            <Select value={style} onValueChange={(v) => setStyle(v as StyleType)} disabled={isStaging}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {styleTypes.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="furnish" className="cursor-pointer text-sm">
                  {furnishEmpty ? 'Furnish Empty Room' : 'Restyle Existing'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {furnishEmpty ? 'Add furniture to an empty space' : 'Change style of existing furniture'}
                </p>
              </div>
              <Switch id="furnish" checked={furnishEmpty} onCheckedChange={setFurnishEmpty} disabled={isStaging} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="preserve" className="cursor-pointer text-sm">Preserve Structure</Label>
                <p className="text-xs text-muted-foreground">Keep walls, windows, architecture</p>
              </div>
              <Switch id="preserve" checked={preserveStructure} onCheckedChange={setPreserveStructure} disabled={isStaging} />
            </div>
          </div>

          <Button onClick={handleStage} disabled={isStaging || !imageUrl.trim()} className="w-full">
            {isStaging ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Staging...</>
            ) : stagedImage ? (
              <><Check className="mr-2 h-4 w-4" />Stage Again</>
            ) : (
              <><Sofa className="mr-2 h-4 w-4" />Stage Room</>
            )}
          </Button>
        </div>

        {/* Right: Result */}
        <div className="space-y-3">
          <Label>{stagedImage ? 'Staged Result' : 'Preview'}</Label>
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted/50 min-h-[250px]">
            {stagedImage ? (
              <>
                <img src={stagedImage} alt="Staged" className="w-full h-full object-cover" />
                <Badge className="absolute bottom-2 right-2 bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  {styleTypes.find((s) => s.value === style)?.label} {roomTypes.find((r) => r.value === roomType)?.label}
                </Badge>
                <div className="absolute bottom-3 left-3">
                  <Button size="sm" variant="secondary" asChild>
                    <a href={stagedImage} target="_blank" rel="noopener noreferrer" download>
                      <Download className="mr-1.5 h-3.5 w-3.5" />Download
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                {isStaging ? (
                  <>
                    <Loader2 className="h-12 w-12 animate-spin mb-4 opacity-50" />
                    <p className="text-sm">AI is staging your room...</p>
                    <p className="text-xs mt-1 opacity-60">This may take 30-60 seconds</p>
                  </>
                ) : (
                  <>
                    <Sofa className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-sm text-center">Your staged room will appear here</p>
                    <p className="text-xs mt-1 opacity-60 text-center">
                      Select room type and style, then click &quot;Stage Room&quot;
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info Box */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Home className="h-4 w-4" />About Virtual Staging
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Transform empty rooms into furnished spaces</li>
                <li>Choose from 7 professional design styles</li>
                <li>Perfect for listings without physical staging</li>
                <li>Generates high-quality marketing images</li>
              </ul>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

type RoomType = 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'other';

type PipelinePhoto = {
  id: string;
  url: string;
  room: RoomType;
  enhanced: boolean;
  selectedForListing: boolean;
};

const ROOM_OPTIONS: Array<{ value: RoomType; label: string }> = [
  { value: 'living-room', label: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'other', label: 'Other' },
];

function ListingPipelineTab() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PipelinePhoto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkRoom, setBulkRoom] = useState<RoomType>('other');

  useEffect(() => {
    setPhotos((prev) => {
      const prevByUrl = new Map(prev.map((p) => [p.url, p]));
      return uploadedUrls.map((url, idx) => {
        const existing = prevByUrl.get(url);
        if (existing) return existing;
        return {
          id: `pipeline-${idx}-${url}`,
          url,
          room: 'other' as RoomType,
          enhanced: false,
          selectedForListing: false,
        };
      });
    });
  }, [uploadedUrls]);

  const grouped = useMemo(() => {
    return ROOM_OPTIONS.map((room) => ({
      room,
      photos: photos.filter((p) => p.room === room.value),
    }));
  }, [photos]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => photos.some((p) => p.id === id)));
  }, [photos]);

  const updatePhoto = (id: string, patch: Partial<PipelinePhoto>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectRoom = (room: RoomType) => {
    setSelectedIds(photos.filter((p) => p.room === room).map((p) => p.id));
  };

  const applyRoomToSelected = () => {
    if (selectedIds.length === 0) {
      toast.error('Select photos first');
      return;
    }
    setPhotos((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, room: bulkRoom } : p))
    );
    toast.success(`Assigned ${selectedIds.length} photo(s) to ${ROOM_OPTIONS.find((r) => r.value === bulkRoom)?.label}`);
  };

  const markSelectedForListing = () => {
    if (selectedIds.length === 0) {
      toast.error('Select photos first');
      return;
    }
    setPhotos((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, selectedForListing: true } : p))
    );
    toast.success(`${selectedIds.length} photo(s) marked for listing`);
  };

  const autoSortByFilename = () => {
    const inferRoom = (url: string): RoomType => {
      const name = url.toLowerCase();
      if (name.includes('bed')) return 'bedroom';
      if (name.includes('kitchen')) return 'kitchen';
      if (name.includes('bath')) return 'bathroom';
      if (name.includes('living') || name.includes('hall')) return 'living-room';
      if (name.includes('ext') || name.includes('outdoor') || name.includes('facade')) return 'exterior';
      return 'other';
    };
    setPhotos((prev) => prev.map((p) => ({ ...p, room: inferRoom(p.url) })));
    toast.success('Photos auto-sorted by filename hints');
  };

  const markAllEnhanced = () => {
    setPhotos((prev) => prev.map((p) => ({ ...p, enhanced: true })));
    toast.success('All photos marked as enhanced');
  };

  const listingReadyCount = photos.filter((p) => p.selectedForListing).length;

  const createDraft = () => {
    if (listingReadyCount === 0) {
      toast.error('Select at least one photo for listing');
      return;
    }
    toast.success(`Listing draft prepared with ${listingReadyCount} photos`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Images className="h-5 w-5 text-primary" />
            Listing Photo Pipeline
          </CardTitle>
          <CardDescription>
            Upload in bulk, organize by room, mark enhanced photos, and prepare listing-ready media.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiImageDropZone
            value={uploadedUrls}
            onChange={setUploadedUrls}
            maxImages={40}
            placeholder="Drop many property photos here or click to upload"
          />

          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" onClick={autoSortByFilename} disabled={photos.length === 0}>
              <Layers3 className="mr-2 h-4 w-4" />
              Auto-sort rooms
            </Button>
            <Button variant="outline" onClick={markAllEnhanced} disabled={photos.length === 0}>
              <Sparkles className="mr-2 h-4 w-4" />
              Mark all enhanced
            </Button>

            <Select value={bulkRoom} onValueChange={(v) => setBulkRoom(v as RoomType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk room" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={applyRoomToSelected} disabled={selectedIds.length === 0}>
              Assign room to selected ({selectedIds.length})
            </Button>
            <Button variant="outline" onClick={markSelectedForListing} disabled={selectedIds.length === 0}>
              Mark selected for listing
            </Button>
            <Button onClick={createDraft} disabled={listingReadyCount === 0}>
              Create Listing Draft ({listingReadyCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {grouped.map(({ room, photos: roomPhotos }) => (
          <Card key={room.value}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{room.label}</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => selectRoom(room.value)} disabled={roomPhotos.length === 0}>
                    Select room
                  </Button>
                  <Badge variant="secondary">{roomPhotos.length}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roomPhotos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No photos assigned.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {roomPhotos.map((photo) => {
                    const isSelected = selectedIds.includes(photo.id);
                    return (
                      <div
                        key={photo.id}
                        className={`rounded-xl border p-3 bg-card/50 space-y-3 transition-all duration-200 ${
                          isSelected ? 'ring-2 ring-primary/40 shadow-md scale-[1.01]' : 'hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelected(photo.id)}
                              className="h-4 w-4 rounded border-border"
                            />
                            Select
                          </label>
                          <div className="flex items-center gap-1">
                            {photo.enhanced && <Badge variant="secondary">Enhanced</Badge>}
                            {photo.selectedForListing && <Badge>Listing</Badge>}
                          </div>
                        </div>

                        <img src={photo.url} alt="Uploaded property" className="w-full h-40 object-cover rounded-lg" />

                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={photo.room}
                            onValueChange={(value) => updatePhoto(photo.id, { room: value as RoomType })}
                          >
                            <SelectTrigger className="col-span-2">
                              <SelectValue placeholder="Room" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOM_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant={photo.enhanced ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updatePhoto(photo.id, { enhanced: !photo.enhanced })}
                          >
                            Enhanced
                          </Button>
                          <Button
                            type="button"
                            variant={photo.selectedForListing ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              updatePhoto(photo.id, { selectedForListing: !photo.selectedForListing })
                            }
                          >
                            Listing
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function AIToolsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAiToolsEnabled()) {
      router.replace('/profile');
    }
  }, [router]);

  if (!isAiToolsEnabled()) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Tools</h1>
        <p className="text-muted-foreground mt-1">
          Generate, edit, and stage property images using AI powered by fal.ai
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="generate" className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Generate</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-1.5">
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </TabsTrigger>
          <TabsTrigger value="staging" className="flex items-center gap-1.5">
            <Sofa className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Staging</span>
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-1.5">
            <Images className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pipeline</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Image Generator
              </CardTitle>
              <CardDescription>
                Generate professional property images from text descriptions using Flux AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerateTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wand2 className="h-5 w-5 text-primary" />
                AI Image Editor
              </CardTitle>
              <CardDescription>
                Enhance and modify existing property images with AI-powered editing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staging" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sofa className="h-5 w-5 text-primary" />
                Virtual Staging
              </CardTitle>
              <CardDescription>
                Transform empty rooms into beautifully furnished spaces with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StagingTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <ListingPipelineTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
