import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import type { ColumnsElement, PDFTheme, PDFElement } from '@/types/pdf';

interface Props extends Omit<ColumnsElement, 'columns'> {
  theme: PDFTheme;
  columns: {
    width: number;
    children: React.ReactNode;
  }[];
}

export function PDFColumns({ columns, gap, marginBottom }: Props) {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: marginBottom ?? 15,
    },
    column: {
      paddingRight: gap ?? 10,
    },
    lastColumn: {
      paddingRight: 0,
    },
  });

  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  return (
    <View style={styles.container}>
      {columns.map((column, index) => (
        <View
          key={index}
          style={[
            styles.column,
            index === columns.length - 1 ? styles.lastColumn : {},
            { width: `${(column.width / totalWidth) * 100}%` },
          ]}
        >
          {column.children}
        </View>
      ))}
    </View>
  );
}
