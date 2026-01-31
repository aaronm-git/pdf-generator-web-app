import { StyleSheet } from '@react-pdf/renderer';
import type { PDFTheme } from '@/types/pdf';

export const createTypographyStyles = (theme: PDFTheme) =>
  StyleSheet.create({
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.primaryColor || '#1a202c',
      marginBottom: 16,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.primaryColor || '#1a202c',
      marginBottom: 12,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 18,
      fontWeight: 'semibold',
      color: theme.secondaryColor || '#2d3748',
      marginBottom: 10,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 16,
      fontWeight: 'semibold',
      color: theme.secondaryColor || '#2d3748',
      marginBottom: 8,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 14,
      fontWeight: 'medium',
      color: theme.textColor || '#1a202c',
      marginBottom: 6,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 12,
      fontWeight: 'medium',
      color: theme.textColor || '#1a202c',
      marginBottom: 4,
      lineHeight: 1.4,
    },
    body: {
      fontSize: 11,
      color: theme.textColor || '#1a202c',
      lineHeight: 1.6,
      marginBottom: 10,
    },
    bodySmall: {
      fontSize: 10,
      color: theme.textColor || '#1a202c',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 9,
      color: theme.mutedColor || '#718096',
      lineHeight: 1.4,
    },
    label: {
      fontSize: 10,
      fontWeight: 'medium',
      color: theme.mutedColor || '#718096',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

export const getHeadingStyle = (level: number, theme: PDFTheme) => {
  const styles = createTypographyStyles(theme);
  const styleMap: Record<number, ReturnType<typeof createTypographyStyles>['h1']> = {
    1: styles.h1,
    2: styles.h2,
    3: styles.h3,
    4: styles.h4,
    5: styles.h5,
    6: styles.h6,
  };
  return styleMap[level] || styles.h1;
};
