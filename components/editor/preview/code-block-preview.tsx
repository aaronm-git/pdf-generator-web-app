'use client';

import type { CodeBlockElement, PDFTheme } from '@/types/pdf';

interface CodeBlockPreviewProps {
  element: CodeBlockElement;
  theme?: PDFTheme;
}

export function CodeBlockPreview({ element, theme }: CodeBlockPreviewProps) {
  const lines = element.code.split('\n');

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: element.marginBottom ?? 16,
      }}
    >
      {/* Header with language label */}
      {element.language && (
        <div
          style={{
            backgroundColor: '#334155',
            padding: '8px 16px',
            fontSize: '12px',
            color: '#94a3b8',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {element.language}
        </div>
      )}

      {/* Code content */}
      <div
        style={{
          padding: '16px',
          overflowX: 'auto',
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#e2e8f0',
          }}
        >
          {element.showLineNumbers ? (
            <code>
              {lines.map((line, index) => (
                <div key={index} style={{ display: 'flex' }}>
                  <span
                    style={{
                      width: '40px',
                      textAlign: 'right',
                      paddingRight: '16px',
                      color: '#64748b',
                      userSelect: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ flex: 1 }}>{line || ' '}</span>
                </div>
              ))}
            </code>
          ) : (
            <code>{element.code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
