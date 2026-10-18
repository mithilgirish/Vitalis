import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import {
  Radio,
  AlertOctagon,
  BatteryMedium,
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

export const HeaderCockpit: React.FC = () => {
  const {
    urgencyLabel,
    gpsPulseCountdown,
    excursionFlag,
    temperature,
    batteryLevel,
    colors,
    isDark,
    toggleTheme,
  } = useMission();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for GPS sync indicator and excursion alarm
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: excursionFlag ? 0.3 : 0.6,
          duration: excursionFlag ? 400 : 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: excursionFlag ? 400 : 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [excursionFlag, pulseAnim]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderBottomColor: excursionFlag ? colors.redAlarm : colors.border,
        },
        excursionFlag && { backgroundColor: colors.redAlarmBg },
      ]}>
      {/* Top row: Brand, ESI Badge, and Theme Toggle */}
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <View style={[styles.brandIconWrapper, { backgroundColor: colors.esiCrimson }]}>
            <Text style={styles.brandIconText}>V+</Text>
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>VITALIS</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
              MEDICAL COURIER DISPATCH
            </Text>
          </View>
        </View>

        <View style={styles.topRightControls}>
          {/* ESI TIER 1 BADGE */}
          <View style={[styles.esiBadge, { backgroundColor: colors.esiCrimson }]}>
            <ShieldAlert size={13} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.esiBadgeText}>{urgencyLabel}</Text>
          </View>

          {/* Theme Mode Toggle Button (Charcoal Dark <-> Clinical Light) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle Theme Mode"
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.themeToggleButton,
              {
                backgroundColor: colors.bgCardElevated,
                borderColor: colors.border,
              },
              pressed && { opacity: 0.7 },
            ]}>
            {isDark ? (
              <Sun size={15} color="#FBBF24" />
            ) : (
              <Moon size={15} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Bottom row: Live 15s GPS Telemetry Pulse & Cold Chain Status */}
      <View style={styles.telemetryRow}>
        {/* 15s GPS Telemetry Pulse badge */}
        <View
          style={[
            styles.pulseBadge,
            {
              backgroundColor: colors.cobaltBlueBg,
              borderColor: colors.cobaltBlueGlow,
            },
          ]}>
          <Animated.View
            style={[
              styles.pulseDot,
              {
                backgroundColor: colors.cobaltBlue,
                opacity: pulseAnim,
              },
            ]}
          />
          <Radio size={12} color={colors.cobaltBlue} strokeWidth={2.5} />
          <Text style={[styles.pulseText, { color: colors.cobaltBlue }]}>
            GPS PULSE: <Text style={[styles.pulseMono, { color: colors.textPrimary }]}>{gpsPulseCountdown}s</Text>
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.syncText, { color: colors.emeraldSafe }]}>LIVE SYNC</Text>
        </View>

        {/* Hardware Status & Temperature Mini-Readout */}
        <View style={styles.statusGroup}>
          <View
            style={[
              styles.tempBadge,
              excursionFlag
                ? { backgroundColor: colors.redAlarm, borderColor: '#FFFFFF' }
                : { backgroundColor: colors.emeraldSafeBg, borderColor: colors.emeraldSafe },
            ]}>
            {excursionFlag && <AlertOctagon size={12} color="#FFFFFF" />}
            <Text
              style={[
                styles.tempText,
                excursionFlag ? { color: '#FFFFFF' } : { color: colors.emeraldSafe },
              ]}>
              {temperature.toFixed(1)}°C
            </Text>
          </View>

          <View style={styles.batteryBadge}>
            <BatteryMedium size={14} color={colors.textMuted} />
            <Text style={[styles.batteryText, { color: colors.textSecondary }]}>
              {batteryLevel}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: -0.5,
  },
  brandTitle: {
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1.1,
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  esiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: ERGONOMICS.radiusSm,
    gap: 5,
  },
  esiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  themeToggleButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3.5,
    paddingHorizontal: 9,
    borderRadius: ERGONOMICS.radiusFull,
    borderWidth: 1,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulseText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pulseMono: {
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  divider: {
    width: 1,
    height: 10,
  },
  syncText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: ERGONOMICS.radiusSm,
    borderWidth: 1,
    gap: 4,
  },
  tempText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  batteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  batteryText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
