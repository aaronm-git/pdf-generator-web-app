'use client';

import { useState } from 'react';
import type { KeyValueElement } from '@/lib/pdf/schema';
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
import { Plus, Trash2 } from 'lucide-react';

interface KeyValueEditorProps {
  element: KeyValueElement;
  onSave: (element: KeyValueElement) => void;
  onCancel: () => void;
}

export function KeyValueEditor({ element, onSave, onCancel }: KeyValueEditorProps) {
  const [items, setItems] = useState<{ key: string; value: string }[]>(element.items);
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'grid'>(element.layout || 'horizontal');
  const [keyWidth, setKeyWidth] = useState(element.keyStyle?.width?.toString() || '');
  const [keyColor, setKeyColor] = useState(element.keyStyle?.color || '');
  const [valueColor, setValueColor] = useState(element.valueStyle?.color || '');
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'keyValue',
      items: items.filter((item) => item.key.trim() !== '' || item.value.trim() !== ''),
      layout,
      keyStyle: {
        fontWeight: 'medium',
        color: keyColor || undefined,
        width: keyWidth ? parseInt(keyWidth, 10) : undefined,
      },
      valueStyle: {
        color: valueColor || undefined,
      },
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  const addItem = () => {
    setItems([...items, { key: '', value: '' }]);
  };

  const updateItem = (index: number, field: 'key' | 'value', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="layout">Layout</Label>
          <Select value={layout} onValueChange={(v) => setLayout(v as typeof layout)}>
            <SelectTrigger id="layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal (side by side)</SelectItem>
              <SelectItem value="vertical">Vertical (stacked)</SelectItem>
              <SelectItem value="grid">Grid (2 columns)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {layout === 'horizontal' && (
          <div className="space-y-2">
            <Label htmlFor="keyWidth">Key Width (px)</Label>
            <Input
              id="keyWidth"
              type="number"
              value={keyWidth}
              onChange={(e) => setKeyWidth(e.target.value)}
              placeholder="120"
              min={50}
              max={300}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Key-Value Pairs</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" />
            Add Pair
          </Button>
        </div>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded border p-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item.key}
                onChange={(e) => updateItem(index, 'key', e.target.value)}
                placeholder="Key"
                className="flex-1"
              />
              <span className="text-muted-foreground">:</span>
              <Input
                value={item.value}
                onChange={(e) => updateItem(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="keyColor">Key Color</Label>
          <div className="flex gap-2">
            <Input
              id="keyColor"
              type="color"
              value={keyColor || '#718096'}
              onChange={(e) => setKeyColor(e.target.value)}
              className="h-10 w-14 cursor-pointer p-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valueColor">Value Color</Label>
          <div className="flex gap-2">
            <Input
              id="valueColor"
              type="color"
              value={valueColor || '#1a202c'}
              onChange={(e) => setValueColor(e.target.value)}
              className="h-10 w-14 cursor-pointer p-1"
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
