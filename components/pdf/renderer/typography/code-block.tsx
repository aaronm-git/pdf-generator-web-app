import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { CodeBlockElement, PDFTheme } from '@/lib/pdf/schema';

// Use built-in Courier font for reliability
const MONO_FONT = 'Courier';

interface Props extends CodeBlockElement {
  theme: PDFTheme;
}

export function PDFCodeBlock({
  code,
  language,
  showLineNumbers,
  marginBottom,
}: Props) {
  const lines = code.split('\n');

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#1e293b',
      borderRadius: 4,
      marginBottom: marginBottom ?? 12,
      overflow: 'hidden',
    },
    header: {
      backgroundColor: '#334155',
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    headerText: {
      fontSize: 9,
      color: '#94a3b8',
      fontFamily: MONO_FONT,
    },
    codeContainer: {
      padding: 12,
    },
    line: {
      flexDirection: 'row',
    },
    lineNumber: {
      width: 30,
      textAlign: 'right',
      paddingRight: 12,
      color: '#64748b',
      fontSize: 9,
      fontFamily: MONO_FONT,
    },
    code: {
      flex: 1,
      fontSize: 9,
      color: '#e2e8f0',
      fontFamily: MONO_FONT,
      lineHeight: 1.5,
    },
  });

  return (
    <View style={styles.container}>
      {language && (
        <View style={styles.header}>
          <Text style={styles.headerText}>{language}</Text>
        </View>
      )}
      <View style={styles.codeContainer}>
        {showLineNumbers ? (
          lines.map((line, index) => (
            <View key={index} style={styles.line}>
              <Text style={styles.lineNumber}>{index + 1}</Text>
              <Text style={styles.code}>{line || ' '}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.code}>{code}</Text>
        )}
      </View>
    </View>
  );
}
