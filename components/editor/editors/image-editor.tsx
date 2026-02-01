'use client';

import { useState } from 'react';
import type { ImageElement } from '@/lib/pdf/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImageEditorProps {
  element: ImageElement;
  onSave: (element: ImageElement) => void;
  onCancel: () => void;
}

type ImageAlign = 'left' | 'center' | 'right';

export function ImageEditor({ element, onSave, onCancel }: ImageEditorProps) {
  const [src, setSrc] = useState(element.src);
  const [alt, setAlt] = useState(element.alt || '');
  const [width, setWidth] = useState(element.width?.toString() || '');
  const [height, setHeight] = useState(element.height?.toString() || '');
  const [align, setAlign] = useState<ImageAlign>(element.align || 'left');
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'image',
      src,
      alt: alt || undefined,
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      align: align as ImageElement['align'],
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="src">Image URL</Label>
        <Input
          id="src"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Enter the full URL to your image. Data URLs (base64) are also supported.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alt">Alt Text</Label>
        <Input
          id="alt"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Describe the image..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="Auto"
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Auto"
            min={0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="align">Alignment</Label>
        <Select value={align} onValueChange={(v) => setAlign(v as ImageAlign)}>
          <SelectTrigger>
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="marginBottom">Margin Bottom (px)</Label>
        <Input
          id="marginBottom"
          type="number"
          value={marginBottom}
          onChange={(e) => setMarginBottom(e.target.value)}
          placeholder="Auto"
          min={0}
          className="w-32"
        />
      </div>

      {/* Image Preview */}
      {src && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="rounded border bg-muted/30 p-4">
            <img
              src={src}
              alt={alt || 'Preview'}
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}
