import React from 'react';
import { Text, StyleSheet } from '@react-pdf/renderer';
import type { HeadingElement, PDFTheme } from '@/types/pdf';

interface Props extends HeadingElement {
  theme: PDFTheme;
}

const headingSizes: Record<number, number> = {
  1: 28,
  2: 22,
  3: 18,
  4: 16,
  5: 14,
  6: 12,
};

export function PDFHeading({ level, content, color, align, marginBottom, theme }: Props) {
  const styles = StyleSheet.create({
    heading: {
      fontSize: headingSizes[level] || 28,
      fontWeight: level <= 2 ? 'bold' : 'semibold',
      color: color || theme.primaryColor || '#1a202c',
      textAlign: align || 'left',
      marginBottom: marginBottom ?? (level === 1 ? 20 : level === 2 ? 15 : 10),
      lineHeight: 1.3,
    },
  });

  return <Text style={styles.heading}>{content}</Text>;
}
