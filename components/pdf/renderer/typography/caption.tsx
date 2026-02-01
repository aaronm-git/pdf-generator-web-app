import React from 'react';
import { Text, StyleSheet } from '@react-pdf/renderer';
import type { CaptionElement, PDFTheme } from '@/lib/pdf/schema';

interface Props extends CaptionElement {
  theme: PDFTheme;
}

export function PDFCaption({ content, color, align, theme }: Props) {
  const styles = StyleSheet.create({
    caption: {
      fontSize: 9,
      color: color || theme.mutedColor || '#718096',
      textAlign: align || 'left',
      lineHeight: 1.4,
      marginTop: 4,
    },
  });

  return <Text style={styles.caption}>{content}</Text>;
}
