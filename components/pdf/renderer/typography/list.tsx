import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ListElement, PDFTheme } from '@/types/pdf';
import { parseAndRenderMarkdownToPDF } from '@/lib/markdown/pdf-parser';

interface Props extends ListElement {
  theme: PDFTheme;
}

export function PDFList({
  variant,
  items,
  fontSize,
  color,
  spacing,
  marginBottom,
  theme,
}: Props) {
  const styles = StyleSheet.create({
    list: {
      marginBottom: marginBottom ?? 15,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: spacing ?? 4,
    },
    bullet: {
      width: 20,
      fontSize: fontSize || 11,
      color: color || theme.textColor || '#1a202c',
    },
    itemText: {
      flex: 1,
      fontSize: fontSize || 11,
      color: color || theme.textColor || '#1a202c',
      lineHeight: 1.5,
    },
  });

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.bullet}>
            {variant === 'ordered' ? `${index + 1}.` : '•'}
          </Text>
          <Text style={styles.itemText}>{parseAndRenderMarkdownToPDF(item)}</Text>
        </View>
      ))}
    </View>
  );
}
