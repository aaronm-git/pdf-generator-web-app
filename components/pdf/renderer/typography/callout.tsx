import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { CalloutElement, PDFTheme } from '@/lib/pdf/schema';
import { parseAndRenderMarkdownToPDF } from '@/lib/markdown/pdf-parser';

interface Props extends CalloutElement {
  theme: PDFTheme;
}

const variantColors = {
  info: {
    bg: '#eff6ff',
    border: '#3b82f6',
    title: '#1d4ed8',
  },
  warning: {
    bg: '#fffbeb',
    border: '#f59e0b',
    title: '#b45309',
  },
  success: {
    bg: '#f0fdf4',
    border: '#22c55e',
    title: '#15803d',
  },
  error: {
    bg: '#fef2f2',
    border: '#ef4444',
    title: '#b91c1c',
  },
  quote: {
    bg: '#f8fafc',
    border: '#94a3b8',
    title: '#475569',
  },
};

export function PDFCallout({
  content,
  variant = 'info',
  title,
  marginBottom,
  theme,
}: Props) {
  const colors = variantColors[variant];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.bg,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
      borderLeftStyle: 'solid',
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 14,
      paddingRight: 14,
      marginBottom: marginBottom ?? 12,
    },
    title: {
      fontWeight: 'bold',
      fontSize: 11,
      color: colors.title,
      marginBottom: 4,
    },
    content: {
      fontSize: 10,
      lineHeight: 1.5,
      color: theme.textColor || '#1a202c',
      fontStyle: variant === 'quote' ? 'italic' : 'normal',
    },
  });

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.content}>{parseAndRenderMarkdownToPDF(content)}</Text>
    </View>
  );
}
