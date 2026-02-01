'use client';

import { useState } from 'react';
import type { CalloutElement } from '@/lib/pdf/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalloutEditorProps {
  element: CalloutElement;
  onSave: (element: CalloutElement) => void;
  onCancel: () => void;
}

const variants = [
  { value: 'info', label: 'Info', description: 'Blue highlight for general information' },
  { value: 'warning', label: 'Warning', description: 'Yellow highlight for cautions' },
  { value: 'success', label: 'Success', description: 'Green highlight for positive info' },
  { value: 'error', label: 'Error', description: 'Red highlight for critical issues' },
  { value: 'quote', label: 'Quote', description: 'Gray highlight for blockquotes' },
];

type CalloutVariant = 'info' | 'warning' | 'success' | 'error' | 'quote';

export function CalloutEditor({ element, onSave, onCancel }: CalloutEditorProps) {
  const [content, setContent] = useState(element.content);
  const [variant, setVariant] = useState<CalloutVariant>(element.variant || 'info');
  const [title, setTitle] = useState(element.title || '');
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'callout',
      content,
      variant: variant as CalloutElement['variant'],
      title: title || undefined,
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="variant">Style</Label>
        <Select value={variant} onValueChange={(v) => setVariant(v as CalloutVariant)}>
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                <div className="flex flex-col">
                  <span>{v.label}</span>
                  <span className="text-xs text-muted-foreground">{v.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your content... Supports **bold**, *italic*, `code`, and [links](url)"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Supports markdown: **bold**, *italic*, `code`, [link](url)
        </p>
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

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}
