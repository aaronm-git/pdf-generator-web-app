import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import type { DividerElement, PDFTheme } from '@/types/pdf';

interface Props extends DividerElement {
  theme: PDFTheme;
}

export function PDFDivider({ color, thickness, marginY, theme }: Props) {
  const styles = StyleSheet.create({
    divider: {
      borderBottomWidth: thickness ?? 1,
      borderBottomColor: color || theme.mutedColor || '#e2e8f0',
      borderBottomStyle: 'solid',
      marginTop: marginY ?? 15,
      marginBottom: marginY ?? 15,
    },
  });

  return <View style={styles.divider} />;
}
