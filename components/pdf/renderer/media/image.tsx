import React from 'react';
import { View, Image, StyleSheet } from '@react-pdf/renderer';
import type { ImageElement, PDFTheme } from '@/types/pdf';

interface Props extends ImageElement {
  theme: PDFTheme;
}

export function PDFImage({
  src,
  alt,
  width,
  height,
  align = 'left',
  marginBottom,
  theme,
}: Props) {
  // Skip rendering if no valid source
  if (!src || src.trim() === '') {
    return null;
  }

  const alignmentStyles = {
    left: 'flex-start' as const,
    center: 'center' as const,
    right: 'flex-end' as const,
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: alignmentStyles[align],
      marginBottom: marginBottom ?? 12,
    },
    image: {
      maxWidth: width || 400,
      height: height || 'auto',
      objectFit: 'contain' as const,
    },
  });

  return (
    <View style={styles.container}>
      <Image src={src} style={styles.image} />
    </View>
  );
}
