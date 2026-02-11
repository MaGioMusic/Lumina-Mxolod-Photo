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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sofa, Home, Check } from 'lucide-react';
import { toast } from 'sonner';

interface VirtualStagingToolProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: string;
  originalImageUrl: string;
  propertyTitle?: string;
  onImageStaged?: (image: { id: string; url: string }) => void;
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
  { value: 'modern', label: 'Modern', description: 'Sleek, clean lines, contemporary' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple, uncluttered, essential' },
  { value: 'scandinavian', label: 'Scandinavian', description: 'Light, natural, cozy' },
  { value: 'luxury', label: 'Luxury', description: 'High-end, elegant, premium' },
  { value: 'cozy', label: 'Cozy', description: 'Warm, comfortable, inviting' },
  { value: 'industrial', label: 'Industrial', description: 'Raw, exposed, urban' },
  { value: 'bohemian', label: 'Bohemian', description: 'Eclectic, artistic, colorful' },
];

export default function VirtualStagingTool({
  isOpen,
  onClose,
  imageId,
  originalImageUrl,
  propertyTitle,
  onImageStaged,
}: VirtualStagingToolProps) {
  const [roomType, setRoomType] = useState<RoomType>('living_room');
  const [style, setStyle] = useState<StyleType>('modern');
  const [furnishEmpty, setFurnishEmpty] = useState(true);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [isStaging, setIsStaging] = useState(false);
  const [stagedImage, setStagedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsStaging(true);
    setStagedImage(null);

    try {
      const response = await fetch('/api/images/virtual-staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId,
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
      
      if (onImageStaged) {
        onImageStaged(data.image);
      }
    } catch (error) {
      console.error('Error staging image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to stage image');
    } finally {
      setIsStaging(false);
    }
  };

  const handleClose = () => {
    setRoomType('living_room');
    setStyle('modern');
    setFurnishEmpty(true);
    setPreserveStructure(true);
    setStagedImage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sofa className="h-5 w-5 text-primary" />
            Virtual Staging
          </DialogTitle>
          <DialogDescription>
            {propertyTitle 
              ? `Add furniture and decor to empty rooms in "${propertyTitle}"`
              : 'Transform empty spaces with AI-powered virtual staging'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Original Image & Settings */}
          <div className="space-y-6">
            {/* Original Image */}
            <div className="space-y-2">
              <Label>Original Image</Label>
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                <img
                  src={originalImageUrl}
                  alt="Original property"
                  className="w-full h-full object-cover"
                />
                {!furnishEmpty && (
                  <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-xs px-2 py-1 rounded">
                    Restyle Mode
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Room Type */}
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select 
                  value={roomType} 
                  onValueChange={(v) => setRoomType(v as RoomType)}
                  disabled={isStaging}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((room) => (
                      <SelectItem key={room.value} value={room.value}>
                        <span className="mr-2">{room.icon}</span>
                        {room.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <Label>Design Style</Label>
                <Select 
                  value={style} 
                  onValueChange={(v) => setStyle(v as StyleType)}
                  disabled={isStaging}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="furnishEmpty" className="cursor-pointer">
                      {furnishEmpty ? 'Furnish Empty Room' : 'Restyle Existing'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {furnishEmpty 
                        ? 'Add furniture to an empty space'
                        : 'Change style of existing furniture'}
                    </p>
                  </div>
                  <Switch
                    id="furnishEmpty"
                    checked={furnishEmpty}
                    onCheckedChange={setFurnishEmpty}
                    disabled={isStaging}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="preserveStructure" className="cursor-pointer">
                      Preserve Room Structure
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Keep walls, windows, and architectural features
                    </p>
                  </div>
                  <Switch
                    id="preserveStructure"
                    checked={preserveStructure}
                    onCheckedChange={setPreserveStructure}
                    disabled={isStaging}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isStaging}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isStaging}
                  className="flex-1"
                >
                  {isStaging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Staging...
                    </>
                  ) : stagedImage ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Stage Again
                    </>
                  ) : (
                    <>
                      <Home className="mr-2 h-4 w-4" />
                      Stage Room
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right: Result Preview */}
          <div className="space-y-2">
            <Label>{stagedImage ? 'Staged Result' : 'Preview'}</Label>
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted min-h-[300px]">
              {stagedImage ? (
                <>
                  <img
                    src={stagedImage}
                    alt="Staged property"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {styleTypes.find(s => s.value === style)?.label} {roomTypes.find(r => r.value === roomType)?.label}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                  {isStaging ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin mb-4" />
                      <p className="text-center">AI is staging your room...</p>
                      <p className="text-xs text-muted-foreground mt-2">This may take 30-60 seconds</p>
                    </>
                  ) : (
                    <>
                      <Sofa className="h-16 w-16 mb-4 opacity-50" />
                      <p className="text-center">Your staged room will appear here</p>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Select room type and style, then click &quot;Stage Room&quot;
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-muted rounded-lg p-4 text-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Home className="h-4 w-4" />
                About Virtual Staging
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Transform empty rooms into furnished spaces</li>
                <li>• Choose from 7 professional design styles</li>
                <li>• Perfect for listings without physical staging</li>
                <li>• Generates high-quality marketing images</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
