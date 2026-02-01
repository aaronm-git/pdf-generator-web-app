import React from 'react';
import { View, Text, Svg, Rect, G, StyleSheet } from '@react-pdf/renderer';
import type { BarChartElement, PDFTheme } from '@/lib/pdf/schema';

interface Props extends BarChartElement {
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

export function PDFBarChart({
  title,
  data,
  width = 500,
  height = 200,
  showValues = true,
  orientation = 'horizontal',
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
      alignItems: 'center',
    },
    // Horizontal bar styles
    horizontalBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    horizontalLabel: {
      width: 80,
      fontSize: 9,
      color: theme.textColor || '#1a202c',
    },
    horizontalBarContainer: {
      flex: 1,
      height: 16,
      backgroundColor: '#f1f5f9',
      borderRadius: 2,
    },
    horizontalValue: {
      width: 50,
      fontSize: 9,
      color: theme.textColor || '#1a202c',
      textAlign: 'right',
    },
    // Legend for vertical charts
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
      marginBottom: 5,
    },
    legendColor: {
      width: 10,
      height: 10,
      marginRight: 5,
    },
    legendText: {
      fontSize: 8,
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

  const maxValue = Math.max(...data.map((d) => d.value)) || 1; // Prevent division by zero
  const isVertical = orientation === 'vertical';

  if (isVertical) {
    // Vertical bars (bars grow upward)
    const chartPadding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - chartPadding.left - chartPadding.right;
    const chartHeight = height - chartPadding.top - chartPadding.bottom;
    const barWidth = Math.min(40, chartWidth / data.length - 10);
    const barGap = (chartWidth - barWidth * data.length) / (data.length + 1);

    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.chartContainer}>
          <Svg width={width} height={height}>
            {/* Y-axis grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
              <G key={idx}>
                <Rect
                  x={chartPadding.left}
                  y={chartPadding.top + chartHeight * (1 - ratio)}
                  width={chartWidth}
                  height={0.5}
                  fill="#e2e8f0"
                />
              </G>
            ))}

            {/* Bars */}
            {data.map((item, idx) => {
              const barHeight = (item.value / maxValue) * chartHeight;
              const x = chartPadding.left + barGap + idx * (barWidth + barGap);
              const y = chartPadding.top + chartHeight - barHeight;
              const color = item.color || colors[idx % colors.length];

              return (
                <G key={idx}>
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                  />
                </G>
              );
            })}
          </Svg>
        </View>

        {/* Legend with labels */}
        <View style={styles.legend}>
          {data.map((item, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor:
                      item.color || colors[idx % colors.length],
                  },
                ]}
              />
              <Text style={styles.legendText}>
                {item.label}
                {showValues ? `: ${item.value.toLocaleString()}` : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Horizontal bars (default - bars grow to the right)
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {data.map((item, idx) => {
        const barWidthPercent = (item.value / maxValue) * 100;
        const color = item.color || colors[idx % colors.length];

        return (
          <View key={idx} style={styles.horizontalBarRow}>
            <Text style={styles.horizontalLabel}>{item.label}</Text>
            <View style={styles.horizontalBarContainer}>
              <View
                style={{
                  width: `${barWidthPercent}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: 2,
                }}
              />
            </View>
            {showValues && (
              <Text style={styles.horizontalValue}>
                {item.value.toLocaleString()}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
