import React from 'react';
import { View, Text, Svg, Path, G, StyleSheet } from '@react-pdf/renderer';
import type { PieChartElement, PDFTheme } from '@/lib/pdf/schema';

interface Props extends PieChartElement {
  theme: PDFTheme;
}

const defaultColors = [
  '#3182ce',
  '#38a169',
  '#d69e2e',
  '#e53e3e',
  '#805ad5',
  '#dd6b20',
  '#319795',
  '#d53f8c',
];

export function PDFPieChart({
  title,
  data,
  width = 300,
  height = 200,
  showLabels = true,
  showPercentages = true,
  donut = false,
  colors = defaultColors,
  marginBottom,
  theme,
}: Props) {
  const styles = StyleSheet.create({
    container: {
      marginBottom: marginBottom ?? 20,
    },
    title: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.primaryColor || '#1a202c',
      marginBottom: 10,
      textAlign: 'center',
    },
    chartContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    legend: {
      marginLeft: 20,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    legendColor: {
      width: 12,
      height: 12,
      marginRight: 8,
    },
    legendText: {
      fontSize: 9,
      color: theme.textColor || '#1a202c',
    },
    emptyMessage: {
      fontSize: 10,
      color: theme.mutedColor || '#718096',
      textAlign: 'center',
      padding: 20,
    },
  });

  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.emptyMessage}>No data available</Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1; // Prevent division by zero
  const centerX = 80;
  const centerY = 80;
  const radius = 70;
  const innerRadius = donut ? radius * 0.5 : 0;

  // Calculate pie slices
  let currentAngle = -90; // Start from top
  const slices = data.map((item, idx) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc points
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    let path: string;
    if (donut) {
      const ix1 = centerX + innerRadius * Math.cos(startRad);
      const iy1 = centerY + innerRadius * Math.sin(startRad);
      const ix2 = centerX + innerRadius * Math.cos(endRad);
      const iy2 = centerY + innerRadius * Math.sin(endRad);
      path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`;
    } else {
      path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }

    return {
      ...item,
      path,
      percentage,
      color: item.color || colors[idx % colors.length],
    };
  });

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartContainer}>
        <Svg width={160} height={160}>
          {slices.map((slice, idx) => (
            <Path key={idx} d={slice.path} fill={slice.color} />
          ))}
        </Svg>

        {showLabels && (
          <View style={styles.legend}>
            {slices.map((slice, idx) => (
              <View key={idx} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: slice.color },
                  ]}
                />
                <Text style={styles.legendText}>
                  {slice.label}
                  {showPercentages ? ` (${slice.percentage.toFixed(1)}%)` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
