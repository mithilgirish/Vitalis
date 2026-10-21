import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Line,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Activity } from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

export const SparklineGraph: React.FC = () => {
  const { sparklineHistory, safeEnvelopeMin, safeEnvelopeMax, excursionFlag, cargoType, colors, isDark } =
    useMission();

  const width = 340;
  const height = 115;
  const paddingX = 20;
  const paddingY = 18;

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

  const temps = sparklineHistory.map((p) => p.temp);
  const minTemp = Math.min(...temps).toFixed(1);
  const maxTemp = Math.max(...temps).toFixed(1);
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCardElevated,
          borderColor: colors.border,
        },
      ]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Activity size={13} color={colors.cobaltBlue} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            15-MIN TEMPERATURE MONITOR
          </Text>
        </View>
        <Text style={[styles.sampleFreq, { color: colors.textMuted }]}>
          SAMPLED EVERY 60S
        </Text>
      </View>

      {/* SVG Canvas */}
      <View style={styles.chartWrapper}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="sparklineArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor={excursionFlag ? colors.redAlarm : colors.emeraldSafe}
                stopOpacity={isDark ? '0.3' : '0.15'}
              />
              <Stop
                offset="100%"
                stopColor={excursionFlag ? colors.redAlarm : colors.emeraldSafe}
                stopOpacity="0.0"
              />
            </LinearGradient>
          </Defs>

          {/* Grid Guideline */}
          <Line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke={colors.border}
            strokeWidth="1"
          />

          {/* Upper Safe Threshold line */}
          <Line
            x1={paddingX}
            y1={upperY}
            x2={width - paddingX}
            y2={upperY}
            stroke={colors.redAlarm}
            strokeWidth="1"
            strokeDasharray="4, 4"
            opacity={0.65}
          />
          <SvgText
            x={width - paddingX - 4}
            y={upperY - 3}
            fill={colors.redAlarm}
            fontSize="7"
            fontFamily="monospace"
            textAnchor="end">
            MAX {safeEnvelopeMax.toFixed(1)}°C
          </SvgText>

          {/* Lower Safe Threshold line */}
          <Line
            x1={paddingX}
            y1={lowerY}
            x2={width - paddingX}
            y2={lowerY}
            stroke={colors.cobaltBlue}
            strokeWidth="1"
            strokeDasharray="4, 4"
            opacity={0.65}
          />
          <SvgText
            x={width - paddingX - 4}
            y={lowerY + 8}
            fill={colors.cobaltBlue}
            fontSize="7"
            fontFamily="monospace"
            textAnchor="end">
            MIN {safeEnvelopeMin.toFixed(1)}°C
          </SvgText>

          {/* Area Fill */}
          <Path d={areaPath} fill="url(#sparklineArea)" />

          {/* Line Path */}
          <Path
            d={linePath}
            fill="none"
            stroke={excursionFlag ? colors.redAlarm : colors.emeraldSafe}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Points */}
          {sparklineHistory.map((point, index) => {
            const px = getX(index);
            const py = getY(point.temp);
            const isLast = index === sparklineHistory.length - 1;
            return (
              <Circle
                key={`pt-${index}`}
                cx={px}
                cy={py}
                r={isLast ? 4 : 2}
                fill={isLast ? '#FFFFFF' : excursionFlag ? colors.redAlarm : colors.emeraldSafe}
                stroke={isLast ? (excursionFlag ? colors.redAlarm : colors.emeraldSafe) : 'none'}
                strokeWidth={isLast ? 2 : 0}
              />
            );
          })}
        </Svg>
      </View>

      {/* Time Axis Labels */}
      <View style={styles.timeAxisRow}>
        <Text style={[styles.timeLabel, { color: colors.textMuted }]}>-15m</Text>
        <Text style={[styles.timeLabel, { color: colors.textMuted }]}>-10m</Text>
        <Text style={[styles.timeLabel, { color: colors.textMuted }]}>-5m</Text>
        <Text style={[styles.timeLabel, { color: colors.emeraldSafe, fontWeight: '800' }]}>
          Now (Live)
        </Text>
      </View>

      {/* Summary Metrics */}
      <View
        style={[
          styles.metricsRow,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MIN TEMP</Text>
          <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{minTemp}°C</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>AVG 15M</Text>
          <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{avgTemp}°C</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>PEAK TEMP</Text>
          <Text
            style={[
              styles.metricVal,
              { color: colors.textPrimary },
              parseFloat(maxTemp) > safeEnvelopeMax && { color: colors.redAlarm },
            ]}>
            {maxTemp}°C
          </Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>VARIANCE</Text>
          <Text style={[styles.metricVal, { color: colors.emeraldSafe }]}>±0.2°C</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: ERGONOMICS.radiusLg,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sampleFreq: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  chartWrapper: {
    width: '100%',
    height: 115,
  },
  timeAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeLabel: {
    fontSize: 8.5,
    fontFamily: 'monospace',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: ERGONOMICS.radiusSm,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  metricDivider: {
    width: 1,
    height: 18,
  },
});
