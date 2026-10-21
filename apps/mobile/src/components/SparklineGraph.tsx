import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Line,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { TrendingUp } from 'lucide-react-native';
import { useMission } from '@/context/MissionContext';

export const SparklineGraph: React.FC = () => {
  const { sparklineHistory, safeEnvelopeMin, safeEnvelopeMax, excursionFlag, cargoType, colors, isDark } =
    useMission();

  const width = 330;
  const height = 120;
  const paddingX = 16;
  const paddingY = 16;

  const graphMin = cargoType === 'PRBC' ? 0.0 : 18.0;
  const graphMax = cargoType === 'PRBC' ? 8.0 : 26.0;
  const graphRange = graphMax - graphMin;

  const getX = (index: number) => {
    const totalPoints = Math.max(1, sparklineHistory.length - 1);
    return paddingX + (index / totalPoints) * (width - 2 * paddingX);
  };

  const getY = (temp: number) => {
    const clamped = Math.min(Math.max(temp, graphMin), graphMax);
    const ratio = (clamped - graphMin) / graphRange;
    return height - paddingY - ratio * (height - 2 * paddingY);
  };

  let linePath = '';
  let areaPath = '';

  sparklineHistory.forEach((point, i) => {
    const x = getX(i);
    const y = getY(point.temp);
    if (i === 0) {
      linePath = `M ${x} ${y}`;
      areaPath = `M ${x} ${height - paddingY} L ${x} ${y}`;
    } else {
      const prevX = getX(i - 1);
      const prevY = getY(sparklineHistory[i - 1].temp);
      const midX = (prevX + x) / 2;
      linePath += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
      areaPath += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
    }
  });

  const lastPoint = sparklineHistory[sparklineHistory.length - 1];
  const lastX = getX(sparklineHistory.length - 1);
  areaPath += ` L ${lastX} ${height - paddingY} Z`;

  const upperY = getY(safeEnvelopeMax);
  const lowerY = getY(safeEnvelopeMin);
  const safeBandHeight = Math.max(4, lowerY - upperY);

  const temps = sparklineHistory.map((p) => p.temp);
  const minTemp = Math.min(...temps).toFixed(1);
  const maxTemp = Math.max(...temps).toFixed(1);
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(28, 29, 35, 0.90)' : 'rgba(255, 255, 255, 0.94)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <TrendingUp size={14} color={colors.cobaltBlue} strokeWidth={2.4} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Temperature History
          </Text>
        </View>
        <Text style={[styles.sampleFreq, { color: colors.textMuted }]}>
          Past 15 Minutes
        </Text>
      </View>

      {/* Apple Health Style SVG Chart with Safe Band */}
      <View style={styles.chartWrapper}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="appleSparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor={excursionFlag ? '#FF453A' : '#34C759'}
                stopOpacity={isDark ? '0.22' : '0.12'}
              />
              <Stop
                offset="100%"
                stopColor={excursionFlag ? '#FF453A' : '#34C759'}
                stopOpacity="0.0"
              />
            </LinearGradient>
          </Defs>

          {/* Shaded Apple Safe Zone Band */}
          <Rect
            x={paddingX}
            y={upperY}
            width={width - 2 * paddingX}
            height={safeBandHeight}
            fill={isDark ? 'rgba(52, 199, 89, 0.08)' : 'rgba(52, 199, 89, 0.06)'}
            rx={4}
          />

          {/* Safe Threshold Upper Line */}
          <Line
            x1={paddingX}
            y1={upperY}
            x2={width - paddingX}
            y2={upperY}
            stroke={isDark ? 'rgba(52, 199, 89, 0.45)' : 'rgba(52, 199, 89, 0.35)'}
            strokeWidth="1"
            strokeDasharray="4, 3"
          />

          {/* Safe Target Annotation */}
          <SvgText
            x={width - paddingX - 4}
            y={upperY - 4}
            fill={colors.emeraldSafe}
            fontSize="8"
            fontWeight="600"
            textAnchor="end">
            Safe Envelope Max: {safeEnvelopeMax.toFixed(0)}°C
          </SvgText>

          {/* Shaded Area under Curve */}
          <Path d={areaPath} fill="url(#appleSparklineGradient)" />

          {/* Temperature Polyline */}
          <Path
            d={linePath}
            fill="none"
            stroke={excursionFlag ? '#FF453A' : '#34C759'}
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Current Reading Dot */}
          {lastPoint && (
            <Circle
              cx={lastX}
              cy={getY(lastPoint.temp)}
              r={4}
              fill="#FFFFFF"
              stroke={excursionFlag ? '#FF453A' : '#34C759'}
              strokeWidth={2}
            />
          )}
        </Svg>
      </View>

      {/* Glanceable Metrics Row */}
      <View
        style={[
          styles.metricsRow,
          {
            backgroundColor: isDark ? 'rgba(20, 21, 25, 0.65)' : 'rgba(242, 242, 247, 0.75)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          },
        ]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MINIMUM</Text>
          <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{minTemp}°C</Text>
        </View>

        <View
          style={[
            styles.metricDivider,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>AVERAGE</Text>
          <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{avgTemp}°C</Text>
        </View>

        <View
          style={[
            styles.metricDivider,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>PEAK</Text>
          <Text
            style={[
              styles.metricVal,
              { color: parseFloat(maxTemp) > safeEnvelopeMax ? colors.redAlarm : colors.textPrimary },
            ]}>
            {maxTemp}°C
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sampleFreq: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  chartWrapper: {
    width: '100%',
    height: 120,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  metricVal: {
    fontSize: 11.5,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
  },
});
