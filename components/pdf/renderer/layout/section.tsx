import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { SectionElement, PDFTheme, PDFElement } from '@/types/pdf';

interface Props extends Omit<SectionElement, 'children'> {
  theme: PDFTheme;
  children: React.ReactNode;
}

export function PDFSection({
  title,
  backgroundColor,
  padding,
  marginBottom,
  border,
  theme,
  children,
}: Props) {
  // Only include border properties if there's actually a border
  const hasBorder = border && border.style !== 'none' && (border.width ?? 0) > 0;
  // Map border style to react-pdf compatible values (exclude 'none')
  const borderStyleValue = border?.style && border.style !== 'none'
    ? border.style as 'solid' | 'dashed' | 'dotted'
    : 'solid';

  const styles = StyleSheet.create({
    section: {
      backgroundColor: backgroundColor || 'transparent',
      paddingTop: padding?.top ?? 0,
      paddingRight: padding?.right ?? 0,
      paddingBottom: padding?.bottom ?? 0,
      paddingLeft: padding?.left ?? 0,
      marginBottom: marginBottom ?? 20,
      ...(hasBorder ? {
        borderWidth: border?.width ?? 1,
        borderColor: border?.color || '#e2e8f0',
        borderStyle: borderStyleValue,
        borderRadius: border?.radius ?? 0,
      } : {}),
    },
    title: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primaryColor || '#1a202c',
      marginBottom: 12,
    },
  });

  return (
    <View style={styles.section}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}
