'use client';

import { useState } from 'react';
import type { BarChartElement, PieChartElement, LineChartElement, ChartDataPoint } from '@/lib/pdf/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

type ChartElement = BarChartElement | PieChartElement | LineChartElement;

interface ChartEditorProps {
  element: ChartElement;
  onSave: (element: ChartElement) => void;
  onCancel: () => void;
}

const defaultColors = [
  '#3182ce',
  '#38a169',
  '#d69e2e',
  '#e53e3e',
  '#805ad5',
  '#dd6b20',
  '#319795',
  '#d53f8c',
];

export function ChartEditor({ element, onSave, onCancel }: ChartEditorProps) {
  if (element.type === 'lineChart') {
    return <LineChartEditor element={element} onSave={onSave} onCancel={onCancel} />;
  }

  return <SimpleChartEditor element={element} onSave={onSave} onCancel={onCancel} />;
}

function SimpleChartEditor({
  element,
  onSave,
  onCancel,
}: {
  element: BarChartElement | PieChartElement;
  onSave: (element: ChartElement) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(element.title || '');
  const [data, setData] = useState<ChartDataPoint[]>(element.data);
  const [showValues, setShowValues] = useState(
    element.type === 'barChart' ? element.showValues ?? false : false
  );
  const [showPercentages, setShowPercentages] = useState(
    element.type === 'pieChart' ? element.showPercentages ?? false : false
  );
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    const baseElement = {
      title: title || undefined,
      data: data.filter((d) => d.label.trim() !== ''),
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    };

    if (element.type === 'barChart') {
      onSave({
        type: 'barChart',
        ...baseElement,
        showValues,
      } as BarChartElement);
    } else {
      onSave({
        type: 'pieChart',
        ...baseElement,
        showPercentages,
      } as PieChartElement);
    }
  };

  const addDataPoint = () => {
    setData([
      ...data,
      { label: '', value: 0, color: defaultColors[data.length % defaultColors.length] },
    ]);
  };

  const updateDataPoint = (index: number, field: keyof ChartDataPoint, value: string | number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    setData(newData);
  };

  const removeDataPoint = (index: number) => {
    if (data.length > 1) {
      setData(data.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Chart Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter chart title..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Data Points</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDataPoint}>
            <Plus className="mr-1 h-4 w-4" />
            Add Data
          </Button>
        </div>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded border p-2">
          {data.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={point.label}
                onChange={(e) => updateDataPoint(index, 'label', e.target.value)}
                placeholder="Label"
                className="flex-1"
              />
              <Input
                type="number"
                value={point.value}
                onChange={(e) => updateDataPoint(index, 'value', parseFloat(e.target.value) || 0)}
                placeholder="Value"
                className="w-24"
              />
              <Input
                type="color"
                value={point.color || defaultColors[index % defaultColors.length]}
                onChange={(e) => updateDataPoint(index, 'color', e.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDataPoint(index)}
                disabled={data.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {element.type === 'barChart' && (
          <div className="flex items-center gap-2">
            <Switch
              id="showValues"
              checked={showValues}
              onCheckedChange={setShowValues}
            />
            <Label htmlFor="showValues">Show Values</Label>
          </div>
        )}
        {element.type === 'pieChart' && (
          <div className="flex items-center gap-2">
            <Switch
              id="showPercentages"
              checked={showPercentages}
              onCheckedChange={setShowPercentages}
            />
            <Label htmlFor="showPercentages">Show Percentages</Label>
          </div>
        )}
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

function LineChartEditor({
  element,
  onSave,
  onCancel,
}: {
  element: LineChartElement;
  onSave: (element: ChartElement) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(element.title || '');
  const [series, setSeries] = useState(element.data);
  const [showGrid, setShowGrid] = useState(element.showGrid ?? true);
  const [showDots, setShowDots] = useState(element.showDots ?? true);
  const [marginBottom, setMarginBottom] = useState(element.marginBottom?.toString() || '');

  const handleSave = () => {
    onSave({
      type: 'lineChart',
      title: title || undefined,
      data: series.filter((s) => s.label.trim() !== '' && s.values.length > 0),
      showGrid,
      showDots,
      marginBottom: marginBottom ? parseInt(marginBottom, 10) : undefined,
    });
  };

  const addSeries = () => {
    setSeries([
      ...series,
      {
        label: `Series ${series.length + 1}`,
        values: [{ x: 0, y: 0 }],
        color: defaultColors[series.length % defaultColors.length],
      },
    ]);
  };

  const updateSeriesLabel = (index: number, label: string) => {
    const newSeries = [...series];
    newSeries[index] = { ...newSeries[index], label };
    setSeries(newSeries);
  };

  const updateSeriesColor = (index: number, color: string) => {
    const newSeries = [...series];
    newSeries[index] = { ...newSeries[index], color };
    setSeries(newSeries);
  };

  const removeSeries = (index: number) => {
    if (series.length > 1) {
      setSeries(series.filter((_, i) => i !== index));
    }
  };

  const addDataPoint = (seriesIndex: number) => {
    const newSeries = [...series];
    const currentValues = newSeries[seriesIndex].values;
    // Determine next x value based on existing data type
    let nextX: string | number = '';
    if (currentValues.length > 0) {
      const lastX = currentValues[currentValues.length - 1].x;
      if (typeof lastX === 'number') {
        nextX = lastX + 1;
      } else {
        // If string, just leave empty for user to fill
        nextX = '';
      }
    }
    newSeries[seriesIndex] = {
      ...newSeries[seriesIndex],
      values: [...currentValues, { x: nextX, y: 0 }],
    };
    setSeries(newSeries);
  };

  const updateDataPoint = (
    seriesIndex: number,
    pointIndex: number,
    field: 'x' | 'y',
    value: string | number
  ) => {
    const newSeries = [...series];
    const newValues = [...newSeries[seriesIndex].values];
    newValues[pointIndex] = { ...newValues[pointIndex], [field]: value };
    newSeries[seriesIndex] = { ...newSeries[seriesIndex], values: newValues };
    setSeries(newSeries);
  };

  const removeDataPoint = (seriesIndex: number, pointIndex: number) => {
    const newSeries = [...series];
    if (newSeries[seriesIndex].values.length > 1) {
      newSeries[seriesIndex] = {
        ...newSeries[seriesIndex],
        values: newSeries[seriesIndex].values.filter((_, i) => i !== pointIndex),
      };
      setSeries(newSeries);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Chart Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter chart title..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Data Series</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSeries}>
            <Plus className="mr-1 h-4 w-4" />
            Add Series
          </Button>
        </div>

        <div className="max-h-64 space-y-4 overflow-y-auto rounded border p-2">
          {series.map((s, seriesIndex) => (
            <div key={seriesIndex} className="space-y-2 rounded border p-2">
              <div className="flex items-center gap-2">
                <Input
                  value={s.label}
                  onChange={(e) => updateSeriesLabel(seriesIndex, e.target.value)}
                  placeholder="Series name"
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={s.color || defaultColors[seriesIndex % defaultColors.length]}
                  onChange={(e) => updateSeriesColor(seriesIndex, e.target.value)}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSeries(seriesIndex)}
                  disabled={series.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Data Points</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addDataPoint(seriesIndex)}
                    className="h-6 text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Point
                  </Button>
                </div>
                {s.values.map((point, pointIndex) => (
                  <div key={pointIndex} className="flex items-center gap-2">
                    <Input
                      value={point.x}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Try to parse as number, otherwise keep as string
                        const numVal = parseFloat(val);
                        updateDataPoint(seriesIndex, pointIndex, 'x', isNaN(numVal) ? val : numVal);
                      }}
                      placeholder="X (label)"
                      className="w-24"
                    />
                    <Input
                      type="number"
                      value={point.y}
                      onChange={(e) =>
                        updateDataPoint(seriesIndex, pointIndex, 'y', parseFloat(e.target.value) || 0)
                      }
                      placeholder="Y"
                      className="w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeDataPoint(seriesIndex, pointIndex)}
                      disabled={s.values.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch id="showGrid" checked={showGrid} onCheckedChange={setShowGrid} />
          <Label htmlFor="showGrid">Show Grid</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="showDots" checked={showDots} onCheckedChange={setShowDots} />
          <Label htmlFor="showDots">Show Dots</Label>
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
