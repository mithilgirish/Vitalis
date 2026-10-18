import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Navigation, Thermometer, QrCode, AlertTriangle } from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

export const BottomCockpitNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { excursionFlag, temperature, step3, colors, isDark } = useMission();

  const isMissionActive = pathname === '/' || pathname === '';
  const isTelemetryActive = pathname === '/telemetry';
  const isScannerActive = pathname === '/scanner';

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
        },
      ]}>
      <View style={styles.navBar}>
        {/* TAB 1: Mission Navigation */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mission Navigation Tab"
          onPress={() => router.push('/')}
          style={({ pressed }) => [
            styles.tabButton,
            {
              backgroundColor: isMissionActive ? colors.bgCardElevated : colors.bgCard,
              borderColor: isMissionActive ? colors.cobaltBlue : colors.border,
            },
            pressed && styles.tabButtonPressed,
          ]}>
          <View style={styles.iconContainer}>
            <Navigation
              size={21}
              color={isMissionActive ? colors.cobaltBlue : colors.textMuted}
              strokeWidth={isMissionActive ? 2.5 : 2}
            />
            {isMissionActive && (
              <View
                style={[
                  styles.activeGlowDot,
                  { backgroundColor: colors.cobaltBlue },
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isMissionActive ? colors.textPrimary : colors.textMuted },
            ]}>
            MISSION
          </Text>
        </Pressable>

        {/* TAB 2: Cold-Chain Telemetry */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cold-Chain Telemetry Tab"
          onPress={() => router.push('/telemetry')}
          style={({ pressed }) => [
            styles.tabButton,
            {
              backgroundColor: isTelemetryActive ? colors.bgCardElevated : colors.bgCard,
              borderColor: excursionFlag
                ? colors.redAlarm
                : isTelemetryActive
                ? colors.emeraldSafe
                : colors.border,
            },
            excursionFlag && { backgroundColor: colors.redAlarmBg },
            pressed && styles.tabButtonPressed,
          ]}>
          <View style={styles.iconContainer}>
            {excursionFlag ? (
              <AlertTriangle size={21} color={colors.redAlarm} strokeWidth={2.5} />
            ) : (
              <Thermometer
                size={21}
                color={isTelemetryActive ? colors.emeraldSafe : colors.textMuted}
                strokeWidth={isTelemetryActive ? 2.5 : 2}
              />
            )}
            {/* Live temp badge */}
            <View
              style={[
                styles.miniBadge,
                excursionFlag
                  ? { backgroundColor: colors.redAlarm }
                  : { backgroundColor: colors.emeraldSafeBg },
              ]}>
              <Text
                style={[
                  styles.miniBadgeText,
                  { color: excursionFlag ? '#FFFFFF' : colors.emeraldSafe },
                ]}>
                {temperature.toFixed(1)}°
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: excursionFlag
                  ? colors.redAlarm
                  : isTelemetryActive
                  ? colors.textPrimary
                  : colors.textMuted,
              },
            ]}>
            COLD-CHAIN
          </Text>
        </Pressable>

        {/* TAB 3: Chain-of-Custody Scanner */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chain-of-Custody Scanner Tab"
          onPress={() => router.push('/scanner')}
          style={({ pressed }) => [
            styles.tabButton,
            {
              backgroundColor: isScannerActive ? colors.bgCardElevated : colors.bgCard,
              borderColor: isScannerActive ? colors.cobaltBlue : colors.border,
            },
            pressed && styles.tabButtonPressed,
          ]}>
          <View style={styles.iconContainer}>
            <QrCode
              size={21}
              color={isScannerActive ? colors.cobaltBlue : colors.textMuted}
              strokeWidth={isScannerActive ? 2.5 : 2}
            />
            <View
              style={[
                styles.stepCounterBadge,
                step3.completed
                  ? { backgroundColor: colors.emeraldSafe }
                  : { backgroundColor: colors.cobaltBlueDark },
              ]}>
              <Text style={styles.stepCounterText}>
                {step3.completed ? '✓' : '2/3'}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isScannerActive ? colors.textPrimary : colors.textMuted },
            ]}>
            CUSTODY
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    height: ERGONOMICS.minTouchTarget, // Minimum 56px touch target
    borderRadius: ERGONOMICS.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 6,
  },
  tabButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeGlowDot: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  miniBadge: {
    position: 'absolute',
    top: -7,
    right: -24,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  stepCounterBadge: {
    position: 'absolute',
    top: -7,
    right: -18,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  stepCounterText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 4,
  },
});
