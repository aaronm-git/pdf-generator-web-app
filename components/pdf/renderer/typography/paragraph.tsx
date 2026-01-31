import React from 'react';
import { Text, StyleSheet } from '@react-pdf/renderer';
import type { ParagraphElement, PDFTheme } from '@/types/pdf';
import { parseAndRenderMarkdownToPDF } from '@/lib/markdown/pdf-parser';

interface Props extends ParagraphElement {
  theme: PDFTheme;
}

export function PDFParagraph({
  content,
  fontSize,
  lineHeight,
  color,
  align,
  fontWeight,
  marginBottom,
  theme,
}: Props) {
  const styles = StyleSheet.create({
    paragraph: {
      fontSize: fontSize || 11,
      lineHeight: lineHeight || 1.6,
      color: color || theme.textColor || '#1a202c',
      textAlign: align || 'left',
      fontWeight: fontWeight || 'normal',
      marginBottom: marginBottom ?? 10,
    },
  });

  return <Text style={styles.paragraph}>{parseAndRenderMarkdownToPDF(content)}</Text>;
}
