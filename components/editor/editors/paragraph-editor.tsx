'use client';

import { useState } from 'react';
import type { ParagraphElement, TextAlign, FontWeight } from '@/lib/pdf/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';

interface ParagraphEditorProps {
  element: ParagraphElement;
  onSave: (element: ParagraphElement) => void;
  onCancel: () => void;
}

export function ParagraphEditor({ element, onSave, onCancel }: ParagraphEditorProps) {
  const [content, setContent] = useState(element.content);
  const [fontSize, setFontSize] = useState(element.fontSize?.toString() || '');
  const [lineHeight, setLineHeight] = useState(element.lineHeight?.toString() || '');
  const [align, setAlign] = useState<TextAlign>(element.align || 'left');
  const [fontWeight, setFontWeight] = useState<FontWeight>(element.fontWeight || 'normal');
  const [color, setColor] = useState(element.color || '');
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'paragraph',
      content,
      fontSize: fontSize ? parseInt(fontSize, 10) : undefined,
      lineHeight: lineHeight ? parseFloat(lineHeight) : undefined,
      align,
      fontWeight: fontWeight !== 'normal' ? fontWeight : undefined,
      color: color || undefined,
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter paragraph text..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="align">Alignment</Label>
          <Select value={align} onValueChange={(v) => setAlign(v as TextAlign)}>
            <SelectTrigger id="align">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="justify">Justify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontWeight">Font Weight</Label>
          <Select value={fontWeight} onValueChange={(v) => setFontWeight(v as FontWeight)}>
            <SelectTrigger id="fontWeight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="semibold">Semibold</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fontSize">Font Size (px)</Label>
          <Input
            id="fontSize"
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            placeholder="12"
            min={8}
            max={72}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lineHeight">Line Height</Label>
          <Input
            id="lineHeight"
            type="number"
            step="0.1"
            value={lineHeight}
            onChange={(e) => setLineHeight(e.target.value)}
            placeholder="1.5"
            min={1}
            max={3}
          />
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
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            value={color || '#000000'}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-14 cursor-pointer p-1"
          />
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}
