'use client';

import { ImageIcon } from 'lucide-react';
import type { ImageElement, PDFTheme } from '@/types/pdf';

interface ImagePreviewProps {
  element: ImageElement;
  theme?: PDFTheme;
}

export function ImagePreview({ element, theme }: ImagePreviewProps) {
  const alignmentStyle = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  const hasValidSrc = element.src && element.src.trim() !== '';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: alignmentStyle[element.align || 'left'],
        marginBottom: element.marginBottom ?? 16,
      }}
    >
      {hasValidSrc ? (
        <img
          src={element.src}
          alt={element.alt || 'Image'}
          style={{
            maxWidth: element.width ? `${element.width}px` : '100%',
            height: element.height ? `${element.height}px` : 'auto',
            objectFit: 'contain',
            borderRadius: '4px',
          }}
          onError={(e) => {
            // Replace with placeholder on error
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  background-color: #f1f5f9;
                  border: 2px dashed #cbd5e1;
                  border-radius: 8px;
                  padding: 32px;
                  color: #64748b;
                  min-width: 200px;
                  min-height: 120px;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <span style="margin-top: 8px; font-size: 14px;">Failed to load image</span>
                </div>
              `;
            }
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f1f5f9',
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '32px',
            color: '#64748b',
            minWidth: element.width ? `${element.width}px` : '200px',
            minHeight: element.height ? `${element.height}px` : '120px',
          }}
        >
          <ImageIcon size={32} />
          <span style={{ marginTop: '8px', fontSize: '14px' }}>
            {element.alt || 'No image source'}
          </span>
        </div>
      )}
    </div>
  );
}
