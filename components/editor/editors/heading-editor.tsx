'use client';

import { useState } from 'react';
import type { HeadingElement, TextAlign } from '@/lib/pdf/schema';
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

interface HeadingEditorProps {
  element: HeadingElement;
  onSave: (element: HeadingElement) => void;
  onCancel: () => void;
}

export function HeadingEditor({ element, onSave, onCancel }: HeadingEditorProps) {
  const [content, setContent] = useState(element.content);
  const [level, setLevel] = useState<HeadingElement['level']>(element.level);
  const [align, setAlign] = useState<TextAlign>(element.align || 'left');
  const [color, setColor] = useState(element.color || '');
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'heading',
      level,
      content,
      align,
      color: color || undefined,
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Input
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter heading text..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            value={level.toString()}
            onValueChange={(v) => setLevel(parseInt(v, 10) as HeadingElement['level'])}
          >
            <SelectTrigger id="level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1 - Title</SelectItem>
              <SelectItem value="2">H2 - Subtitle</SelectItem>
              <SelectItem value="3">H3 - Section</SelectItem>
              <SelectItem value="4">H4 - Subsection</SelectItem>
              <SelectItem value="5">H5 - Minor</SelectItem>
              <SelectItem value="6">H6 - Smallest</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}
