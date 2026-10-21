import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Bluetooth, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { useMission } from '@/context/MissionContext';

export const RadialGauge: React.FC = () => {
  const {
    temperature,
    excursionFlag,
    safeEnvelopeMin,
    safeEnvelopeMax,
    cargoType,
    colors,
    isDark,
  } = useMission();

  // Compact Apple Health Ring dimensions
  const size = 116;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const rangeMin = cargoType === 'PRBC' ? 0.0 : 16.0;
  const rangeMax = cargoType === 'PRBC' ? 10.0 : 28.0;
  const totalRange = rangeMax - rangeMin;

  const clampTemp = Math.min(Math.max(temperature, rangeMin), rangeMax);
  const tempRatio = (clampTemp - rangeMin) / totalRange;

  const startAngle = -210; // in degrees
  const sweepAngle = 240; // in degrees
  const currentAngle = startAngle + tempRatio * sweepAngle;

  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const pStart = polarToCartesian(x, y, r, end);
    const pEnd = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return ['M', pStart.x, pStart.y, 'A', r, r, 0, largeArcFlag, 0, pEnd.x, pEnd.y].join(' ');
  };

  // Safe envelope arc segment
  const safeStartRatio = Math.max(0, (safeEnvelopeMin - rangeMin) / totalRange);
  const safeEndRatio = Math.min(1, (safeEnvelopeMax - rangeMin) / totalRange);
  const safeStartAngle = startAngle + safeStartRatio * sweepAngle;
  const safeEndAngle = startAngle + safeEndRatio * sweepAngle;

  const bgArc = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);
  const safeArc = describeArc(center, center, radius, safeStartAngle, safeEndAngle);
  const activeArc = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));
  const needleCoords = polarToCartesian(center, center, radius, currentAngle);

  return (
    <View style={styles.cardContainer}>
      {/* LEFT COLUMN: Apple Health Vitals Readout */}
      <View style={styles.leftCol}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
          CURRENT CORE TEMPERATURE
        </Text>

        <View style={styles.tempNumberRow}>
          <Text
            style={[
              styles.tempNumber,
              { color: excursionFlag ? colors.redAlarm : colors.textPrimary },
            ]}>
            {temperature.toFixed(1)}
          </Text>
          <Text style={[styles.tempUnit, { color: colors.textSecondary }]}>°C</Text>
        </View>

        {/* Clinical Status Pill */}
        <View
          style={[
            styles.statusPill,
            excursionFlag
              ? {
                  backgroundColor: isDark
                    ? 'rgba(255, 69, 58, 0.18)'
                    : 'rgba(255, 69, 58, 0.12)',
                  borderColor: colors.redAlarm,
                }
              : {
                  backgroundColor: isDark
                    ? 'rgba(52, 199, 89, 0.14)'
                    : 'rgba(52, 199, 89, 0.10)',
                  borderColor: isDark
                    ? 'rgba(52, 199, 89, 0.32)'
                    : 'rgba(52, 199, 89, 0.22)',
                },
          ]}>
          {excursionFlag ? (
            <AlertTriangle size={12} color={colors.redAlarm} strokeWidth={2.4} />
          ) : (
            <ShieldCheck size={12} color={colors.emeraldSafe} strokeWidth={2.4} />
          )}
          <Text
            style={[
              styles.statusPillText,
              { color: excursionFlag ? colors.redAlarm : colors.emeraldSafe },
            ]}>
            {excursionFlag
              ? 'Excursion (Threshold: ≤ 6.0°C)'
              : `Safe Envelope (${safeEnvelopeMin.toFixed(0)}° – ${safeEnvelopeMax.toFixed(0)}°C)`}
          </Text>
        </View>

        {/* Hardware Status Note */}
        <View style={styles.sensorRow}>
          <Bluetooth size={11} color={colors.cobaltBlue} strokeWidth={2.4} />
          <Text style={[styles.sensorText, { color: colors.textMuted }]}>
            Container Probe #9842 • BLE Active
          </Text>
        </View>
      </View>

      {/* RIGHT COLUMN: Apple Watch Style Vitals Ring */}
      <View style={styles.ringWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="appleRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop
                offset="0%"
                stopColor={excursionFlag ? '#FF453A' : '#0A84FF'}
              />
              <Stop
                offset="100%"
                stopColor={excursionFlag ? '#DC2626' : '#34C759'}
              />
            </LinearGradient>
          </Defs>

          {/* Background Track Arc */}
          <Path
            d={bgArc}
            fill="none"
            stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Safe Envelope Highlight Band */}
          <Path
            d={safeArc}
            fill="none"
            stroke={isDark ? 'rgba(52, 199, 89, 0.28)' : 'rgba(52, 199, 89, 0.20)'}
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
          />

          {/* Active Level Arc */}
          <Path
            d={activeArc}
            fill="none"
            stroke="url(#appleRingGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Indicator Dot */}
          <Circle
            cx={needleCoords.x}
            cy={needleCoords.y}
            r={6.5}
            fill="#FFFFFF"
            stroke={excursionFlag ? colors.redAlarm : colors.emeraldSafe}
            strokeWidth={2.5}
          />
        </Svg>

        {/* Center Mini Value inside Ring */}
        <View style={styles.ringCenterText}>
          <Text
            style={[
              styles.centerMiniTemp,
              { color: excursionFlag ? colors.redAlarm : colors.textPrimary },
            ]}>
            {temperature.toFixed(1)}°
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 12,
  },
  leftCol: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  tempNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  tempNumber: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  tempUnit: {
    fontSize: 20,
    fontWeight: '600',
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 5,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  sensorText: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  ringWrapper: {
    width: 116,
    height: 116,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringCenterText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerMiniTemp: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
});
