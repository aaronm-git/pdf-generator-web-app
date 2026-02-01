import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { KeyValueElement, PDFTheme } from '@/lib/pdf/schema';

interface Props extends KeyValueElement {
  theme: PDFTheme;
}

export function PDFKeyValue({
  items,
  layout = 'horizontal',
  keyStyle,
  valueStyle,
  marginBottom,
  theme,
}: Props) {
  const styles = StyleSheet.create({
    container: {
      marginBottom: marginBottom ?? 15,
    },
    horizontalContainer: {
      flexDirection: 'column',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    verticalContainer: {
      flexDirection: 'column',
    },
    horizontalItem: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    gridItem: {
      width: '50%',
      flexDirection: 'column',
      marginBottom: 12,
      paddingRight: 10,
    },
    verticalItem: {
      marginBottom: 8,
    },
    key: {
      fontSize: 10,
      fontWeight: keyStyle?.fontWeight || 'medium',
      color: keyStyle?.color || theme.mutedColor || '#718096',
      width: layout === 'horizontal' ? keyStyle?.width ?? 120 : 'auto',
      marginBottom: layout === 'vertical' || layout === 'grid' ? 2 : 0,
    },
    value: {
      fontSize: 11,
      color: valueStyle?.color || theme.textColor || '#1a202c',
      fontWeight: 'bold',
    },
  });

  const containerStyle =
    layout === 'grid'
      ? styles.gridContainer
      : layout === 'vertical'
      ? styles.verticalContainer
      : styles.horizontalContainer;

  const itemStyle =
    layout === 'grid'
      ? styles.gridItem
      : layout === 'vertical'
      ? styles.verticalItem
      : styles.horizontalItem;

  return (
    <View style={[styles.container, containerStyle]}>
      {items.map((item, index) => (
        <View key={index} style={itemStyle}>
          <Text style={styles.key}>{item.key}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}
