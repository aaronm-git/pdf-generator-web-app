'use client';

import { Info, AlertTriangle, CheckCircle, XCircle, Quote } from 'lucide-react';
import type { CalloutElement, PDFTheme } from '@/types/pdf';
import { parseAndRenderMarkdown } from '@/lib/markdown/parser';

interface CalloutPreviewProps {
  element: CalloutElement;
  theme?: PDFTheme;
}

const variantStyles = {
  info: {
    bg: '#eff6ff',
    border: '#3b82f6',
    icon: Info,
    iconColor: '#3b82f6',
  },
  warning: {
    bg: '#fffbeb',
    border: '#f59e0b',
    icon: AlertTriangle,
    iconColor: '#f59e0b',
  },
  success: {
    bg: '#f0fdf4',
    border: '#22c55e',
    icon: CheckCircle,
    iconColor: '#22c55e',
  },
  error: {
    bg: '#fef2f2',
    border: '#ef4444',
    icon: XCircle,
    iconColor: '#ef4444',
  },
  quote: {
    bg: '#f8fafc',
    border: '#94a3b8',
    icon: Quote,
    iconColor: '#64748b',
  },
};

export function CalloutPreview({ element, theme }: CalloutPreviewProps) {
  const variant = element.variant || 'info';
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      style={{
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        padding: '12px 16px',
        borderRadius: '0 4px 4px 0',
        marginBottom: element.marginBottom ?? 16,
      }}
    >
      <div style={{ display: 'flex', gap: '12px' }}>
        <Icon
          style={{
            width: 20,
            height: 20,
            color: styles.iconColor,
            flexShrink: 0,
            marginTop: 2,
          }}
        />
        <div style={{ flex: 1 }}>
          {element.title && (
            <div
              style={{
                fontWeight: 600,
                marginBottom: 4,
                color: styles.iconColor,
              }}
            >
              {element.title}
            </div>
          )}
          <div
            style={{
              color: theme?.textColor || '#1a202c',
              lineHeight: 1.6,
              fontStyle: variant === 'quote' ? 'italic' : 'normal',
            }}
          >
            {parseAndRenderMarkdown(element.content)}
          </div>
        </div>
      </div>
    </div>
  );
}
