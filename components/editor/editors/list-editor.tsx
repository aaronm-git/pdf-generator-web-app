'use client';

import { useState } from 'react';
import type { ListElement } from '@/lib/pdf/schema';
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
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ListEditorProps {
  element: ListElement;
  onSave: (element: ListElement) => void;
  onCancel: () => void;
}

export function ListEditor({ element, onSave, onCancel }: ListEditorProps) {
  const [variant, setVariant] = useState<'ordered' | 'unordered'>(element.variant);
  const [items, setItems] = useState<string[]>(element.items);
  const [fontSize, setFontSize] = useState(element.fontSize?.toString() || '');
  const [spacing, setSpacing] = useState(element.spacing?.toString() || '');
  const [color, setColor] = useState(element.color || '');
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'list',
      variant,
      items: items.filter((item) => item.trim() !== ''),
      fontSize: fontSize ? parseInt(fontSize, 10) : undefined,
      spacing: spacing ? parseInt(spacing, 10) : undefined,
      color: color || undefined,
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  const addItem = () => {
    setItems([...items, '']);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const newItems = [...items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="variant">List Type</Label>
          <Select value={variant} onValueChange={(v) => setVariant(v as 'ordered' | 'unordered')}>
            <SelectTrigger id="variant">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unordered">Bullet Points</SelectItem>
              <SelectItem value="ordered">Numbered</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>List Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-6"
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0}
                >
                  <GripVertical className="h-3 w-3 rotate-90" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-6"
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === items.length - 1}
                >
                  <GripVertical className="h-3 w-3 rotate-90" />
                </Button>
              </div>
              <span className="w-6 text-center text-sm text-muted-foreground">
                {variant === 'ordered' ? `${index + 1}.` : '•'}
              </span>
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
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
          <Label htmlFor="spacing">Item Spacing (px)</Label>
          <Input
            id="spacing"
            type="number"
            value={spacing}
            onChange={(e) => setSpacing(e.target.value)}
            placeholder="4"
            min={0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={color || '#000000'}
              onChange={(e) => setColor(e.target.value)}
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
