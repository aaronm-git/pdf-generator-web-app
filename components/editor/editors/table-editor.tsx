'use client';

import { useState } from 'react';
import type { TableElement } from '@/lib/pdf/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

interface TableEditorProps {
  element: TableElement;
  onSave: (element: TableElement) => void;
  onCancel: () => void;
}

export function TableEditor({ element, onSave, onCancel }: TableEditorProps) {
  const [headers, setHeaders] = useState<string[]>(element.headers);
  const [rows, setRows] = useState<string[][]>(element.rows);
  const [headerBgColor, setHeaderBgColor] = useState(element.headerStyle?.backgroundColor || '#f7fafc');
  const [headerTextColor, setHeaderTextColor] = useState(element.headerStyle?.color || '#1a202c');
  const [cellPadding, setCellPadding] = useState(element.cellStyle?.padding?.toString() || '8');
  const [borderColor, setBorderColor] = useState(element.cellStyle?.borderColor || '#e2e8f0');
  const [alternateRowColor, setAlternateRowColor] = useState(element.alternateRowColor || '');
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'table',
      headers,
      rows,
      headerStyle: {
        backgroundColor: headerBgColor,
        color: headerTextColor,
        fontWeight: 'bold',
      },
      cellStyle: {
        padding: cellPadding ? parseInt(cellPadding, 10) : undefined,
        borderColor,
      },
      alternateRowColor: alternateRowColor || undefined,
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  const addColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setRows(rows.map((row) => [...row, '']));
  };

  const removeColumn = (colIndex: number) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, i) => i !== colIndex));
    setRows(rows.map((row) => row.filter((_, i) => i !== colIndex)));
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill('')]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== rowIndex));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Table Headers</Label>
          <Button type="button" variant="outline" size="sm" onClick={addColumn}>
            <Plus className="mr-1 h-4 w-4" />
            Add Column
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {headers.map((header, index) => (
            <div key={index} className="flex items-center gap-1">
              <Input
                value={header}
                onChange={(e) => updateHeader(index, e.target.value)}
                placeholder={`Header ${index + 1}`}
                className="w-32"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeColumn(index)}
                disabled={headers.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Table Rows</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1 h-4 w-4" />
            Add Row
          </Button>
        </div>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded border p-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2">
              <span className="w-8 text-center text-sm text-muted-foreground">{rowIndex + 1}</span>
              <div className="flex flex-1 flex-wrap gap-2">
                {row.map((cell, colIndex) => (
                  <Input
                    key={colIndex}
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    placeholder={headers[colIndex]}
                    className="w-32 flex-1"
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(rowIndex)}
                disabled={rows.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Header Style</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="headerBgColor" className="text-xs">Background</Label>
            <div className="flex gap-2">
              <Input
                id="headerBgColor"
                type="color"
                value={headerBgColor}
                onChange={(e) => setHeaderBgColor(e.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Input
                value={headerBgColor}
                onChange={(e) => setHeaderBgColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="headerTextColor" className="text-xs">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="headerTextColor"
                type="color"
                value={headerTextColor}
                onChange={(e) => setHeaderTextColor(e.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Input
                value={headerTextColor}
                onChange={(e) => setHeaderTextColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cellPadding">Cell Padding (px)</Label>
          <Input
            id="cellPadding"
            type="number"
            value={cellPadding}
            onChange={(e) => setCellPadding(e.target.value)}
            placeholder="8"
            min={0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="borderColor">Border Color</Label>
          <div className="flex gap-2">
            <Input
              id="borderColor"
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="h-10 w-14 cursor-pointer p-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alternateRowColor">Alternate Row Color</Label>
          <div className="flex gap-2">
            <Input
              id="alternateRowColor"
              type="color"
              value={alternateRowColor || '#f7fafc'}
              onChange={(e) => setAlternateRowColor(e.target.value)}
              className="h-10 w-14 cursor-pointer p-1"
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

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}
