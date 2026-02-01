import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { TableElement, PDFTheme } from '@/lib/pdf/schema';

interface Props extends TableElement {
  theme: PDFTheme;
}

export function PDFTable({
  headers,
  rows,
  columnWidths,
  headerStyle,
  cellStyle,
  alternateRowColor,
  marginBottom,
  theme,
}: Props) {
  const getColumnWidth = (index: number) => {
    if (columnWidths && columnWidths[index]) {
      return `${columnWidths[index]}%`;
    }
    return `${100 / headers.length}%`;
  };

  const styles = StyleSheet.create({
    table: {
      width: '100%',
      marginBottom: marginBottom ?? 20,
    },
    headerRow: {
      flexDirection: 'row',
      backgroundColor:
        headerStyle?.backgroundColor || theme.primaryColor || '#1a365d',
    },
    headerCell: {
      padding: cellStyle?.padding ?? 8,
      color: headerStyle?.color || '#ffffff',
      fontWeight: headerStyle?.fontWeight || 'bold',
      fontSize: cellStyle?.fontSize ?? 10,
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: cellStyle?.borderColor || '#e2e8f0',
    },
    cell: {
      padding: cellStyle?.padding ?? 8,
      fontSize: cellStyle?.fontSize ?? 10,
      color: theme.textColor || '#1a202c',
    },
    alternateRow: {
      backgroundColor: alternateRowColor || '#f7fafc',
    },
  });

  return (
    <View style={styles.table}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        {headers.map((header, idx) => (
          <View key={idx} style={{ width: getColumnWidth(idx) }}>
            <Text style={styles.headerCell}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Data Rows */}
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={[
            styles.row,
            alternateRowColor && rowIdx % 2 === 1 ? styles.alternateRow : {},
          ]}
        >
          {row.map((cell, cellIdx) => (
            <View key={cellIdx} style={{ width: getColumnWidth(cellIdx) }}>
              <Text style={styles.cell}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
