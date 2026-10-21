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
    <View style={styles.dockWrapper}>
      <View
        style={[
          styles.glassDock,
          {
            backgroundColor: isDark ? 'rgba(28, 29, 35, 0.88)' : 'rgba(255, 255, 255, 0.92)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}>
        {/* TAB 1: Mission Navigation */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mission Navigation Tab"
          onPress={() => router.push('/')}
          style={({ pressed }) => [
            styles.tabItem,
            isMissionActive && {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 122, 255, 0.08)',
            },
            pressed && styles.tabPressed,
          ]}>
          <View style={styles.iconContainer}>
            <Navigation
              size={20}
              color={isMissionActive ? colors.cobaltBlue : colors.textMuted}
              strokeWidth={isMissionActive ? 2.4 : 1.9}
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
              {
                color: isMissionActive ? colors.cobaltBlue : colors.textMuted,
                fontWeight: isMissionActive ? '700' : '500',
              },
            ]}>
            Mission
          </Text>
        </Pressable>

        {/* TAB 2: Cold-Chain Telemetry */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cold-Chain Telemetry Tab"
          onPress={() => router.push('/telemetry')}
          style={({ pressed }) => [
            styles.tabItem,
            isTelemetryActive && {
              backgroundColor: excursionFlag
                ? colors.redAlarmBg
                : isDark
                ? 'rgba(255, 255, 255, 0.10)'
                : 'rgba(52, 199, 89, 0.08)',
            },
            pressed && styles.tabPressed,
          ]}>
          <View style={styles.iconContainer}>
            {excursionFlag ? (
              <AlertTriangle size={20} color={colors.redAlarm} strokeWidth={2.4} />
            ) : (
              <Thermometer
                size={20}
                color={isTelemetryActive ? colors.emeraldSafe : colors.textMuted}
                strokeWidth={isTelemetryActive ? 2.4 : 1.9}
              />
            )}
            {/* Live temp badge */}
            <View
              style={[
                styles.miniBadge,
                excursionFlag
                  ? { backgroundColor: colors.redAlarm }
                  : {
                      backgroundColor: isDark
                        ? 'rgba(52, 199, 89, 0.22)'
                        : 'rgba(52, 199, 89, 0.14)',
                    },
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
                  ? colors.emeraldSafe
                  : colors.textMuted,
                fontWeight: isTelemetryActive ? '700' : '500',
              },
            ]}>
            Telemetry
          </Text>
        </Pressable>

        {/* TAB 3: Chain-of-Custody Scanner */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chain-of-Custody Scanner Tab"
          onPress={() => router.push('/scanner')}
          style={({ pressed }) => [
            styles.tabItem,
            isScannerActive && {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 122, 255, 0.08)',
            },
            pressed && styles.tabPressed,
          ]}>
          <View style={styles.iconContainer}>
            <QrCode
              size={20}
              color={isScannerActive ? colors.cobaltBlue : colors.textMuted}
              strokeWidth={isScannerActive ? 2.4 : 1.9}
            />
            <View
              style={[
                styles.stepCounterBadge,
                step3.completed
                  ? { backgroundColor: colors.emeraldSafe }
                  : { backgroundColor: colors.cobaltBlue },
              ]}>
              <Text style={styles.stepCounterText}>
                {step3.completed ? '✓' : '2/3'}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: isScannerActive ? colors.cobaltBlue : colors.textMuted,
                fontWeight: isScannerActive ? '700' : '500',
              },
            ]}>
            Custody
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockWrapper: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
  },
  glassDock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 999, // Apple floating pill dock
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 5,
    paddingHorizontal: 6,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeGlowDot: {
    position: 'absolute',
    top: -3,
    right: -6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  miniBadge: {
    position: 'absolute',
    top: -6,
    right: -24,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
  },
  miniBadgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  stepCounterBadge: {
    position: 'absolute',
    top: -6,
    right: -18,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
  },
  stepCounterText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    marginTop: 3,
  },
});
