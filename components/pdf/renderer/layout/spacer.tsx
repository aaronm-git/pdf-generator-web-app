import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import type { SpacerElement } from '@/lib/pdf/schema';

type Props = SpacerElement;

export function PDFSpacer({ height }: Props) {
  const styles = StyleSheet.create({
    spacer: {
      height: height,
    },
  });

  return <View style={styles.spacer} />;
}
