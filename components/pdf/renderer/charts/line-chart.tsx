import React from 'react';
import { View, Text, Svg, Path, Circle, Rect, G, StyleSheet } from '@react-pdf/renderer';
import type { LineChartElement, PDFTheme } from '@/types/pdf';

interface Props extends LineChartElement {
  theme: PDFTheme;
}

const defaultColors = [
  '#3182ce',
  '#38a169',
  '#d69e2e',
  '#e53e3e',
  '#805ad5',
];

export function PDFLineChart({
  title,
  data,
  width = 500,
  height = 200,
  showGrid = true,
  showDots = true,
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
      width: 20,
      height: 3,
      marginRight: 5,
    },
    legendText: {
      fontSize: 8,
      color: theme.textColor || '#1a202c',
    },
  });

  const chartPadding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - chartPadding.left - chartPadding.right;
  const chartHeight = height - chartPadding.top - chartPadding.bottom;

  // Find min and max values across all series
  const allValues = data.flatMap((series) => series.values.map((v) => v.y));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(0, Math.min(...allValues));
  const valueRange = maxValue - minValue;

  // Get all unique x labels
  const xLabels = data[0]?.values.map((v) => String(v.x)) || [];
  const xStep = chartWidth / (xLabels.length - 1 || 1);

  const getY = (value: number) => {
    return (
      chartPadding.top +
      chartHeight -
      ((value - minValue) / valueRange) * chartHeight
    );
  };

  const getX = (index: number) => {
    return chartPadding.left + index * xStep;
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartContainer}>
        <Svg width={width} height={height}>
          {/* Grid lines */}
          {showGrid &&
            [0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
              <Rect
                key={idx}
                x={chartPadding.left}
                y={chartPadding.top + chartHeight * (1 - ratio)}
                width={chartWidth}
                height={0.5}
                fill="#e2e8f0"
              />
            ))}

          {/* Lines for each series */}
          {data.map((series, seriesIdx) => {
            const color = series.color || defaultColors[seriesIdx % defaultColors.length];
            const points = series.values.map((v, i) => ({
              x: getX(i),
              y: getY(v.y),
            }));

            const pathD = points
              .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
              .join(' ');

            return (
              <G key={seriesIdx}>
                <Path d={pathD} stroke={color} strokeWidth={2} fill="none" />
                {showDots &&
                  points.map((p, i) => (
                    <Circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={3}
                      fill={color}
                    />
                  ))}
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      {data.length > 1 && (
        <View style={styles.legend}>
          {data.map((series, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor:
                      series.color || defaultColors[idx % defaultColors.length],
                  },
                ]}
              />
              <Text style={styles.legendText}>{series.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
