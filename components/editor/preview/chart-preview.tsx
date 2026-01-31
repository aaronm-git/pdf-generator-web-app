'use client';

import * as React from 'react';
import type { BarChartElement, PieChartElement, LineChartElement, PDFTheme } from '@/types/pdf';

interface ChartPreviewProps {
  element: BarChartElement | PieChartElement | LineChartElement;
  theme?: PDFTheme;
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

export function ChartPreview({ element, theme }: ChartPreviewProps) {
  if (element.type === 'barChart') {
    return <BarChartPreview element={element} theme={theme} />;
  }

  if (element.type === 'pieChart') {
    return <PieChartPreview element={element} theme={theme} />;
  }

  if (element.type === 'lineChart') {
    return <LineChartPreview element={element} theme={theme} />;
  }

  return null;
}

function BarChartPreview({
  element,
  theme,
}: {
  element: BarChartElement;
  theme?: PDFTheme;
}) {
  const maxValue = Math.max(...element.data.map((d) => d.value));
  const colors = element.colors || defaultColors;
  const isVertical = element.orientation === 'vertical';

  if (isVertical) {
    // Vertical bars (bars grow upward)
    return (
      <div
        className="space-y-3"
        style={{ marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined }}
      >
        {element.title && (
          <h4
            className="text-center font-semibold"
            style={{ color: theme?.primaryColor || '#1a202c' }}
          >
            {element.title}
          </h4>
        )}
        <div className="flex items-end justify-center gap-2" style={{ height: element.height || 150 }}>
          {element.data.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              {element.showValues && (
                <span className="text-xs">{item.value.toLocaleString()}</span>
              )}
              <div
                className="w-8 rounded-t"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || colors[index % colors.length],
                }}
              />
              <span className="max-w-12 truncate text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal bars (default - bars grow to the right)
  return (
    <div
      className="space-y-3"
      style={{ marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined }}
    >
      {element.title && (
        <h4
          className="text-center font-semibold"
          style={{ color: theme?.primaryColor || '#1a202c' }}
        >
          {element.title}
        </h4>
      )}
      <div className="space-y-2">
        {element.data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-24 truncate text-sm">{item.label}</span>
            <div className="flex-1">
              <div
                className="h-6 rounded"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || colors[index % colors.length],
                }}
              />
            </div>
            {element.showValues && (
              <span className="w-16 text-right text-sm">
                {item.value.toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChartPreview({
  element,
  theme,
}: {
  element: PieChartElement;
  theme?: PDFTheme;
}) {
  const total = element.data.reduce((sum, item) => sum + item.value, 0);
  const colors = element.colors || defaultColors;

  return (
    <div
      className="flex items-center gap-6"
      style={{ marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined }}
    >
      <div className="flex flex-col items-center">
        {element.title && (
          <h4
            className="mb-2 font-semibold"
            style={{ color: theme?.primaryColor || '#1a202c' }}
          >
            {element.title}
          </h4>
        )}
        {/* Simple circle representation */}
        <div className="relative size-32">
          <svg viewBox="0 0 100 100" className="size-full">
            {element.data.reduce(
              (acc, item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = acc.currentAngle;
                const endAngle = startAngle + angle;

                // Convert to radians
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                // Calculate arc points
                const x1 = 50 + 40 * Math.cos(startRad);
                const y1 = 50 + 40 * Math.sin(startRad);
                const x2 = 50 + 40 * Math.cos(endRad);
                const y2 = 50 + 40 * Math.sin(endRad);

                const largeArc = angle > 180 ? 1 : 0;

                const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

                acc.paths.push(
                  <path
                    key={index}
                    d={path}
                    fill={item.color || colors[index % colors.length]}
                  />
                );
                acc.currentAngle = endAngle;
                return acc;
              },
              { paths: [] as React.ReactElement[], currentAngle: 0 }
            ).paths}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {element.data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="size-3 rounded"
                style={{
                  backgroundColor: item.color || colors[index % colors.length],
                }}
              />
              <span className="text-sm">
                {item.label}
                {element.showPercentages && ` (${percentage}%)`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineChartPreview({
  element,
  theme,
}: {
  element: LineChartElement;
  theme?: PDFTheme;
}) {
  const allValues = element.data.flatMap((series) => series.values.map((v) => v.y));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(0, ...allValues);

  return (
    <div
      style={{ marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined }}
    >
      {element.title && (
        <h4
          className="mb-2 text-center font-semibold"
          style={{ color: theme?.primaryColor || '#1a202c' }}
        >
          {element.title}
        </h4>
      )}
      <div className="relative h-40 w-full">
        <svg viewBox="0 0 400 160" className="size-full">
          {/* Grid lines */}
          {element.showGrid &&
            [0, 40, 80, 120, 160].map((y) => (
              <line
                key={y}
                x1="40"
                y1={y}
                x2="390"
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

          {/* Lines */}
          {element.data.map((series, seriesIndex) => {
            const points = series.values.map((v, i) => {
              const x = 40 + (i * 350) / (series.values.length - 1 || 1);
              const y =
                160 - ((v.y - minValue) / (maxValue - minValue || 1)) * 140 - 10;
              return `${x},${y}`;
            });

            return (
              <g key={seriesIndex}>
                <polyline
                  points={points.join(' ')}
                  fill="none"
                  stroke={series.color || defaultColors[seriesIndex % defaultColors.length]}
                  strokeWidth="2"
                />
                {element.showDots &&
                  series.values.map((v, i) => {
                    const x = 40 + (i * 350) / (series.values.length - 1 || 1);
                    const y =
                      160 - ((v.y - minValue) / (maxValue - minValue || 1)) * 140 - 10;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={series.color || defaultColors[seriesIndex % defaultColors.length]}
                      />
                    );
                  })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      {element.data.length > 1 && (
        <div className="mt-2 flex justify-center gap-4">
          {element.data.map((series, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-0.5 w-4"
                style={{
                  backgroundColor: series.color || defaultColors[index % defaultColors.length],
                }}
              />
              <span className="text-sm">{series.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
