'use client';

import { useState } from 'react';
import type { SpacerElement } from '@/types/pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

interface SpacerEditorProps {
  element: SpacerElement;
  onSave: (element: SpacerElement) => void;
  onCancel: () => void;
}

export function SpacerEditor({ element, onSave, onCancel }: SpacerEditorProps) {
  const [height, setHeight] = useState(element.height.toString());

  const handleSave = () => {
    onSave({
      type: 'spacer',
      height: parseInt(height, 10) || 20,
    });
  };

  const presetHeights = [10, 20, 40, 60, 80, 100];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="height">Height (px)</Label>
        <Input
          id="height"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          min={1}
          max={500}
        />
      </div>

      <div className="space-y-2">
        <Label>Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {presetHeights.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={parseInt(height, 10) === preset ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHeight(preset.toString())}
            >
              {preset}px
            </Button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="rounded border bg-white p-4">
          <div className="flex items-center gap-2">
            <div
              className="border-l-2 border-dashed border-muted-foreground/40"
              style={{ height: `${Math.min(parseInt(height, 10) || 20, 100)}px` }}
            />
            <span className="text-sm text-muted-foreground">
              {height}px vertical space
            </span>
          </div>
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
