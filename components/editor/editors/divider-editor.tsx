'use client';

import { useState } from 'react';
import type { DividerElement } from '@/lib/pdf/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

interface DividerEditorProps {
  element: DividerElement;
  onSave: (element: DividerElement) => void;
  onCancel: () => void;
}

export function DividerEditor({ element, onSave, onCancel }: DividerEditorProps) {
  const [color, setColor] = useState(element.color || '#e2e8f0');
  const [thickness, setThickness] = useState(element.thickness?.toString() || '1');
  const [marginY, setMarginY] = useState(element.marginY?.toString() || '15');

  const handleSave = () => {
    onSave({
      type: 'divider',
      color: color || undefined,
      thickness: thickness ? parseInt(thickness, 10) : undefined,
      marginY: marginY ? parseInt(marginY, 10) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="color">Line Color</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-14 cursor-pointer p-1"
          />
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#e2e8f0"
            className="flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="thickness">Thickness (px)</Label>
          <Input
            id="thickness"
            type="number"
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            min={1}
            max={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marginY">Vertical Margin (px)</Label>
          <Input
            id="marginY"
            type="number"
            value={marginY}
            onChange={(e) => setMarginY(e.target.value)}
            min={0}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="rounded border bg-white p-4">
          <hr
            style={{
              borderTopWidth: parseInt(thickness, 10) || 1,
              borderTopColor: color || '#e2e8f0',
              borderTopStyle: 'solid',
              marginTop: parseInt(marginY, 10) || 15,
              marginBottom: parseInt(marginY, 10) || 15,
            }}
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
