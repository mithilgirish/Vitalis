import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  G,
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
    bleDeviceId,
    bleRssi,
    colors,
    isDark,
  } = useMission();

  const size = 250;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const rangeMin = cargoType === 'PRBC' ? 0.0 : 16.0;
  const rangeMax = cargoType === 'PRBC' ? 10.0 : 28.0;
  const totalRange = rangeMax - rangeMin;

  const clampTemp = Math.min(Math.max(temperature, rangeMin), rangeMax);
  const tempRatio = (clampTemp - rangeMin) / totalRange;

  const startAngle = -220; // in degrees
  const sweepAngle = 260; // in degrees
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

  // Safe envelope angles
  const safeStartRatio = Math.max(0, (safeEnvelopeMin - rangeMin) / totalRange);
  const safeEndRatio = Math.min(1, (safeEnvelopeMax - rangeMin) / totalRange);
  const safeStartAngle = startAngle + safeStartRatio * sweepAngle;
  const safeEndAngle = startAngle + safeEndRatio * sweepAngle;

  const bgArc = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);
  const safeArc = describeArc(center, center, radius, safeStartAngle, safeEndAngle);
  const activeArc = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));
  const needleCoords = polarToCartesian(center, center, radius - 2, currentAngle);

  return (
    <View style={styles.container}>
      {/* SVG Radial Gauge Visualizer */}
      <View style={styles.gaugeWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop
                offset="0%"
                stopColor={excursionFlag ? colors.redAlarm : colors.cobaltBlueLight}
              />
              <Stop
                offset="100%"
                stopColor={excursionFlag ? '#991B1B' : colors.emeraldSafe}
              />
            </LinearGradient>
          </Defs>

          {/* Background Track Arc */}
          <Path
            d={bgArc}
            fill="none"
            stroke={isDark ? '#20242E' : '#E2E8F0'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Safe Zone Highlight Arc */}
          <Path
            d={safeArc}
            fill="none"
            stroke={colors.emeraldSafeGlow}
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
          />

          {/* Active Temperature Level Arc */}
          <Path
            d={activeArc}
            fill="none"
            stroke="url(#activeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Dial Scale Tick Marks */}
          {Array.from({ length: 9 }).map((_, i) => {
            const tickRatio = i / 8;
            const tickAngle = startAngle + tickRatio * sweepAngle;
            const p1 = polarToCartesian(center, center, radius - 14, tickAngle);
            const p2 = polarToCartesian(center, center, radius - 20, tickAngle);
            return (
              <G key={`tick-${i}`}>
                <Line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={colors.borderActive}
                  strokeWidth={i % 2 === 0 ? 1.5 : 1}
                />
              </G>
            );
          })}

          {/* Needle / Pointer Marker on Ring */}
          <Circle
            cx={needleCoords.x}
            cy={needleCoords.y}
            r={8.5}
            fill="#FFFFFF"
            stroke={excursionFlag ? colors.redAlarm : colors.emeraldSafe}
            strokeWidth={2.5}
          />
        </Svg>

        {/* Centerpiece Monospace Readout */}
        <View style={styles.centerReadout}>
          <Text style={[styles.sensorBadgeLabel, { color: colors.textMuted }]}>
            COLD-BOX SENSOR
          </Text>
          <Text
            style={[
              styles.tempMonospace,
              { color: excursionFlag ? colors.redAlarm : colors.textPrimary },
            ]}>
            {temperature.toFixed(1)}
            <Text style={[styles.tempUnit, { color: colors.textMuted }]}>°C</Text>
          </Text>

          {/* Status Label */}
          <View
            style={[
              styles.envelopePill,
              excursionFlag
                ? { backgroundColor: colors.redAlarm, borderColor: colors.redAlarm }
                : { backgroundColor: colors.emeraldSafeBg, borderColor: colors.emeraldSafe },
            ]}>
            {excursionFlag ? (
              <AlertTriangle size={12} color="#FFFFFF" />
            ) : (
              <ShieldCheck size={12} color={colors.emeraldSafe} />
            )}
            <Text
              style={[
                styles.envelopePillText,
                { color: excursionFlag ? '#FFFFFF' : colors.emeraldSafe },
              ]}>
              {excursionFlag ? 'THERMAL EXCURSION' : 'SAFE ENVELOPE'}
            </Text>
          </View>
        </View>
      </View>

      {/* Dynamic Safe-Zone Indicator Bar */}
      <View
        style={[
          styles.envelopeInfoCard,
          {
            backgroundColor: colors.bgCardElevated,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.envelopeHeader}>
          <Text style={[styles.envelopeLabel, { color: colors.textMuted }]}>
            TARGET THERMAL ENVELOPE
          </Text>
          <Text
            style={[
              styles.cargoTypeTag,
              {
                color: colors.cobaltBlue,
                backgroundColor: colors.cobaltBlueBg,
              },
            ]}>
            {cargoType}
          </Text>
        </View>
        <Text style={[styles.envelopeRangeText, { color: colors.textPrimary }]}>
          {safeEnvelopeMin.toFixed(1)}°C – {safeEnvelopeMax.toFixed(1)}°C
          <Text style={[styles.envelopeSubtext, { color: colors.textSecondary }]}>
            {' '}({cargoType === 'PRBC' ? 'Packed Red Cells' : 'Platelets'})
          </Text>
        </Text>

        {/* Hardware Telemetry Bar */}
        <View style={[styles.hwInfoRow, { borderTopColor: colors.border }]}>
          <View style={styles.hwInfoItem}>
            <Bluetooth size={12} color={colors.cobaltBlue} />
            <Text style={[styles.hwInfoText, { color: colors.textSecondary }]}>
              {bleDeviceId}
            </Text>
          </View>
          <Text style={[styles.hwInfoDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.hwInfoText, { color: colors.textSecondary }]}>
            RSSI: {bleRssi} dBm
          </Text>
          <Text style={[styles.hwInfoDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.hwInfoText, { color: colors.textSecondary }]}>
            NIST Traceable
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  gaugeWrapper: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerReadout: {
    position: 'absolute',
    top: 45,
    bottom: 25,
    left: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  sensorBadgeLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  tempMonospace: {
    fontFamily: 'monospace',
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  tempUnit: {
    fontSize: 24,
    fontWeight: '600',
  },
  envelopePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  envelopePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  envelopeInfoCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginTop: 6,
    gap: 6,
  },
  envelopeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  envelopeLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cargoTypeTag: {
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  envelopeRangeText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
  },
  envelopeSubtext: {
    fontSize: 11,
    fontWeight: '500',
  },
  hwInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hwInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hwInfoText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
  },
  hwInfoDot: {
    fontSize: 10,
  },
});
