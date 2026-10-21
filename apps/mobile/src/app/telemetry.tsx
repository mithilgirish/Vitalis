import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import {
  Flame,
  Snowflake,
  ShieldAlert,
  Package,
} from 'lucide-react-native';

import { useMission } from '@/context/MissionContext';
import { RadialGauge } from '@/components/RadialGauge';
import { SparklineGraph } from '@/components/SparklineGraph';
import { ManualCheckInLogger } from '@/components/ManualCheckInLogger';
import { ExcursionBanner } from '@/components/ExcursionBanner';

export default function TelemetryScreen() {
  const {
    cargoType,
    setCargoType,
    isExcursionSimulated,
    toggleExcursion,
    safeEnvelopeMin,
    safeEnvelopeMax,
    colors,
    isDark,
  } = useMission();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Top Banner Alert if excursion active */}
      <ExcursionBanner />

      {/* Apple-style Payload Type Segmented Selector */}
      <View
        style={[
          styles.cargoSelectorCard,
          {
            backgroundColor: isDark ? 'rgba(28, 29, 35, 0.90)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}>
        <View style={styles.cargoSelectorHeader}>
          <View style={styles.cargoHeaderLeft}>
            <Package size={14} color={colors.cobaltBlue} strokeWidth={2.4} />
            <Text style={[styles.cargoHeaderTitle, { color: colors.textPrimary }]}>
              Active Payload Type
            </Text>
          </View>
          <View
            style={[
              styles.envelopePill,
              {
                backgroundColor: isDark
                  ? 'rgba(10, 132, 255, 0.14)'
                  : 'rgba(0, 122, 255, 0.08)',
                borderColor: isDark
                  ? 'rgba(10, 132, 255, 0.28)'
                  : 'rgba(0, 122, 255, 0.18)',
              },
            ]}>
            <Text style={[styles.cargoEnvelopeText, { color: colors.cobaltBlue }]}>
              Target: {safeEnvelopeMin.toFixed(0)}° – {safeEnvelopeMax.toFixed(0)}°C
            </Text>
          </View>
        </View>

        {/* Segmented Control Track */}
        <View
          style={[
            styles.segmentedTrack,
            {
              backgroundColor: isDark ? 'rgba(20, 21, 25, 0.75)' : 'rgba(0, 0, 0, 0.05)',
            },
          ]}>
          {/* PRBC Segment */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select PRBC Cargo"
            onPress={() => setCargoType('PRBC')}
            style={({ pressed }) => [
              styles.segmentedTab,
              cargoType === 'PRBC' && [
                styles.segmentedTabActive,
                {
                  backgroundColor: isDark ? 'rgba(38, 39, 47, 0.96)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                },
              ],
              pressed && { opacity: 0.8 },
            ]}>
            <Snowflake
              size={14}
              color={cargoType === 'PRBC' ? colors.cobaltBlue : colors.textMuted}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.cargoTabText,
                {
                  color: cargoType === 'PRBC' ? colors.textPrimary : colors.textMuted,
                  fontWeight: cargoType === 'PRBC' ? '700' : '500',
                },
              ]}>
              PRBC (1.0° – 6.0°C)
            </Text>
          </Pressable>

          {/* Platelets Segment */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select Platelets Cargo"
            onPress={() => setCargoType('Platelets')}
            style={({ pressed }) => [
              styles.segmentedTab,
              cargoType === 'Platelets' && [
                styles.segmentedTabActive,
                {
                  backgroundColor: isDark ? 'rgba(38, 39, 47, 0.96)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                },
              ],
              pressed && { opacity: 0.8 },
            ]}>
            <Flame
              size={14}
              color={cargoType === 'Platelets' ? colors.cobaltBlue : colors.textMuted}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.cargoTabText,
                {
                  color: cargoType === 'Platelets' ? colors.textPrimary : colors.textMuted,
                  fontWeight: cargoType === 'Platelets' ? '700' : '500',
                },
              ]}>
              Platelets (20° – 24°C)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* CARD 1: Apple Health Hero Vitals Card */}
      <View
        style={[
          styles.gaugeCard,
          {
            backgroundColor: isDark ? 'rgba(28, 29, 35, 0.90)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}>
        <RadialGauge />
      </View>

      {/* CARD 2: Apple Health Temperature History Chart with Safe Band */}
      <SparklineGraph />

      {/* CARD 3: Physical Probe Verification Logger */}
      <ManualCheckInLogger />

      {/* CARD 4: Apple Settings Style Drill Simulator */}
      <View
        style={[
          styles.demoToggleCard,
          {
            backgroundColor: isExcursionSimulated
              ? isDark
                ? 'rgba(45, 18, 22, 0.95)'
                : 'rgba(254, 242, 242, 0.98)'
              : isDark
              ? 'rgba(28, 29, 35, 0.90)'
              : 'rgba(255, 255, 255, 0.94)',
            borderColor: isExcursionSimulated
              ? colors.redAlarm
              : isDark
              ? 'rgba(255, 255, 255, 0.10)'
              : 'rgba(0, 0, 0, 0.08)',
          },
        ]}>
        <View style={styles.demoToggleLeft}>
          <View
            style={[
              styles.demoIconWrapper,
              {
                backgroundColor: isExcursionSimulated
                  ? colors.redAlarm
                  : isDark
                  ? 'rgba(255, 159, 10, 0.16)'
                  : 'rgba(255, 159, 10, 0.10)',
              },
            ]}>
            <ShieldAlert
              size={16}
              color={isExcursionSimulated ? '#FFFFFF' : colors.amberWarning}
              strokeWidth={2.2}
            />
          </View>
          <View style={styles.demoTexts}>
            <Text style={[styles.demoLabel, { color: colors.textPrimary }]}>
              Simulate Excursion Drill
            </Text>
            <Text style={[styles.demoSub, { color: colors.textSecondary }]}>
              Triggers temperature alarm (&gt; 6.0°C) for protocol drills
            </Text>
          </View>
        </View>

        <Switch
          value={isExcursionSimulated}
          onValueChange={(val) => toggleExcursion(val)}
          trackColor={{
            false: isDark ? '#3A3A3C' : '#E5E5EA',
            true: colors.redAlarm,
          }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Quiet Telemetry Footer */}
      <View style={styles.footerInfo}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Vitalis Cold-Chain Sensor Node • NIST Calibrated
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 14,
    gap: 12,
    paddingBottom: 24,
  },
  cargoSelectorCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cargoSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  cargoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cargoHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  envelopePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cargoEnvelopeText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  segmentedTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  segmentedTab: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentedTabActive: {
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cargoTabText: {
    fontSize: 11,
  },
  gaugeCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  demoToggleCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  demoToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  demoIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoTexts: {
    flex: 1,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  demoSub: {
    fontSize: 9.5,
    marginTop: 1,
    lineHeight: 13,
  },
  footerInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  footerText: {
    fontSize: 9,
  },
});
