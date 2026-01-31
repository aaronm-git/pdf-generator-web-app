'use client';

import type { TableElement, PDFTheme } from '@/types/pdf';

interface TablePreviewProps {
  element: TableElement;
  theme?: PDFTheme;
}

export function TablePreview({ element, theme }: TablePreviewProps) {
  return (
    <div
      className="overflow-hidden rounded border"
      style={{ marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined }}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr
            style={{
              backgroundColor:
                element.headerStyle?.backgroundColor ||
                theme?.primaryColor ||
                '#1a365d',
            }}
          >
            {element.headers.map((header, index) => (
              <th
                key={index}
                className="px-3 py-2 text-left font-semibold"
                style={{
                  color: element.headerStyle?.color || '#ffffff',
                  width: element.columnWidths?.[index]
                    ? `${element.columnWidths[index]}%`
                    : undefined,
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {element.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                backgroundColor:
                  element.alternateRowColor && rowIndex % 2 === 1
                    ? element.alternateRowColor
                    : undefined,
              }}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-b px-3 py-2"
                  style={{
                    borderColor: element.cellStyle?.borderColor || '#e2e8f0',
                    color: theme?.textColor || '#1a202c',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
