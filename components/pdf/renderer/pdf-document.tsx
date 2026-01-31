import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { PDFInstructions, PDFTheme } from '@/types/pdf';
import { renderElements } from '@/lib/pdf/renderer';

interface Props {
  instructions: PDFInstructions;
}

const defaultTheme: PDFTheme = {
  primaryColor: '#1a365d',
  secondaryColor: '#2d3748',
  accentColor: '#3182ce',
  textColor: '#1a202c',
  mutedColor: '#718096',
  backgroundColor: '#ffffff',
  fontFamily: 'Helvetica',
};

export function PDFDocument({ instructions }: Props) {
  const { metadata, pageSettings, theme, header, footer, content } =
    instructions;

  const mergedTheme: PDFTheme = {
    ...defaultTheme,
    ...theme,
  };

  const margins = pageSettings?.margins || {
    top: 40,
    right: 40,
    bottom: 60,
    left: 40,
  };

  const styles = StyleSheet.create({
    page: {
      fontFamily: mergedTheme.fontFamily || 'Helvetica',
      fontSize: 11,
      paddingTop: margins.top,
      paddingRight: margins.right,
      paddingBottom: margins.bottom,
      paddingLeft: margins.left,
      backgroundColor: mergedTheme.backgroundColor || '#ffffff',
    },
    header: {
      position: 'absolute',
      top: 15,
      left: margins.left,
      right: margins.right,
    },
    content: {
      flex: 1,
    },
    footer: {
      position: 'absolute',
      bottom: 20,
      left: margins.left,
      right: margins.right,
    },
    pageNumber: {
      fontSize: 9,
      color: mergedTheme.mutedColor || '#718096',
      textAlign: 'center',
    },
  });

  return (
    <Document
      title={metadata.title}
      author={metadata.author}
      subject={metadata.subject}
      keywords={metadata.keywords?.join(', ')}
    >
      <Page
        size={pageSettings?.size || 'A4'}
        orientation={pageSettings?.orientation || 'portrait'}
        style={styles.page}
      >
        {/* Header */}
        {header?.enabled && header.content && (
          <View style={styles.header} fixed>
            {renderElements(header.content, mergedTheme)}
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {renderElements(content, mergedTheme)}
        </View>

        {/* Footer */}
        {footer?.enabled && (
          <View style={styles.footer} fixed>
            {footer.content && renderElements(footer.content, mergedTheme)}
            {footer.showPageNumbers && (
              <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) =>
                  (footer.pageNumberFormat || 'Page {current} of {total}')
                    .replace('{current}', String(pageNumber))
                    .replace('{total}', String(totalPages))
                }
              />
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}
