'use client';

import { useState } from 'react';
import type { SectionElement, BorderStyle } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';

interface SectionEditorProps {
  element: SectionElement;
  onSave: (element: SectionElement) => void;
  onCancel: () => void;
}

export function SectionEditor({ element, onSave, onCancel }: SectionEditorProps) {
  const [title, setTitle] = useState(element.title || '');
  const [backgroundColor, setBackgroundColor] = useState(element.backgroundColor || '');
  const [paddingTop, setPaddingTop] = useState(element.padding?.top?.toString() || '16');
  const [paddingRight, setPaddingRight] = useState(element.padding?.right?.toString() || '16');
  const [paddingBottom, setPaddingBottom] = useState(element.padding?.bottom?.toString() || '16');
  const [paddingLeft, setPaddingLeft] = useState(element.padding?.left?.toString() || '16');
  const [borderWidth, setBorderWidth] = useState(element.border?.width?.toString() || '0');
  const [borderColor, setBorderColor] = useState(element.border?.color || '#e2e8f0');
  const [borderStyle, setBorderStyle] = useState<BorderStyle>(element.border?.style || 'solid');
  const [borderRadius, setBorderRadius] = useState(element.border?.radius?.toString() || '0');
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'section',
      title: title || undefined,
      children: element.children,
      backgroundColor: backgroundColor || undefined,
      padding: {
        top: paddingTop ? parseInt(paddingTop, 10) : 0,
        right: paddingRight ? parseInt(paddingRight, 10) : 0,
        bottom: paddingBottom ? parseInt(paddingBottom, 10) : 0,
        left: paddingLeft ? parseInt(paddingLeft, 10) : 0,
      },
      border: {
        width: borderWidth ? parseInt(borderWidth, 10) : 0,
        color: borderColor,
        style: borderStyle,
        radius: borderRadius ? parseInt(borderRadius, 10) : 0,
      },
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Section Title (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter section title..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="backgroundColor">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="backgroundColor"
            type="color"
            value={backgroundColor || '#ffffff'}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-10 w-14 cursor-pointer p-1"
          />
          <Input
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            placeholder="Transparent"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setBackgroundColor('')}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Padding (px)</Label>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label htmlFor="paddingTop" className="text-xs">Top</Label>
            <Input
              id="paddingTop"
              type="number"
              value={paddingTop}
              onChange={(e) => setPaddingTop(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="paddingRight" className="text-xs">Right</Label>
            <Input
              id="paddingRight"
              type="number"
              value={paddingRight}
              onChange={(e) => setPaddingRight(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="paddingBottom" className="text-xs">Bottom</Label>
            <Input
              id="paddingBottom"
              type="number"
              value={paddingBottom}
              onChange={(e) => setPaddingBottom(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="paddingLeft" className="text-xs">Left</Label>
            <Input
              id="paddingLeft"
              type="number"
              value={paddingLeft}
              onChange={(e) => setPaddingLeft(e.target.value)}
              min={0}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Border</Label>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label htmlFor="borderWidth" className="text-xs">Width</Label>
            <Input
              id="borderWidth"
              type="number"
              value={borderWidth}
              onChange={(e) => setBorderWidth(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="borderStyle" className="text-xs">Style</Label>
            <Select value={borderStyle} onValueChange={(v) => setBorderStyle(v as BorderStyle)}>
              <SelectTrigger id="borderStyle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="borderColor" className="text-xs">Color</Label>
            <Input
              id="borderColor"
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="h-10 cursor-pointer p-1"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="borderRadius" className="text-xs">Radius</Label>
            <Input
              id="borderRadius"
              type="number"
              value={borderRadius}
              onChange={(e) => setBorderRadius(e.target.value)}
              min={0}
            />
          </div>
        </div>
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

      <p className="text-sm text-muted-foreground">
        Note: To add content to this section, add elements from the toolbar and then drag them into the section.
      </p>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}
