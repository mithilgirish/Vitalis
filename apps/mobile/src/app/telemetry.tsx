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
  Radio,
  Sliders,
} from 'lucide-react-native';

import { useMission } from '@/context/MissionContext';
import { RadialGauge } from '@/components/RadialGauge';
import { SparklineGraph } from '@/components/SparklineGraph';
import { ManualCheckInLogger } from '@/components/ManualCheckInLogger';
import { ExcursionBanner } from '@/components/ExcursionBanner';
import { ERGONOMICS } from '@/theme/vitalis-theme';

export default function TelemetryScreen() {
  const {
    cargoType,
    setCargoType,
    isExcursionSimulated,
    toggleExcursion,
    safeEnvelopeMin,
    safeEnvelopeMax,
    colors,
  } = useMission();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Top Banner Alert if excursion active */}
      <ExcursionBanner />

      {/* Cargo Type Envelope Selector Switch */}
      <View
        style={[
          styles.cargoSelectorCard,
          {
            backgroundColor: colors.bgCardElevated,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.cargoSelectorHeader}>
          <View style={styles.cargoHeaderLeft}>
            <Sliders size={13} color={colors.cobaltBlue} />
            <Text style={[styles.cargoHeaderTitle, { color: colors.textPrimary }]}>
              ACTIVE PAYLOAD ENVELOPE
            </Text>
          </View>
          <Text style={[styles.cargoEnvelopeText, { color: colors.cobaltBlue }]}>
            {safeEnvelopeMin}°C – {safeEnvelopeMax}°C
          </Text>
        </View>

        <View style={styles.cargoButtonsRow}>
          {/* PRBC Option */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select PRBC Cargo"
            onPress={() => setCargoType('PRBC')}
            style={[
              styles.cargoTab,
              {
                backgroundColor: cargoType === 'PRBC' ? colors.cobaltBlueBg : colors.bgCard,
                borderColor: cargoType === 'PRBC' ? colors.cobaltBlue : colors.border,
              },
            ]}>
            <Snowflake
              size={15}
              color={cargoType === 'PRBC' ? colors.cobaltBlue : colors.textMuted}
            />
            <View>
              <Text
                style={[
                  styles.cargoTabText,
                  {
                    color: cargoType === 'PRBC' ? colors.cobaltBlue : colors.textMuted,
                    fontWeight: cargoType === 'PRBC' ? '900' : '700',
                  },
                ]}>
                PRBC (Red Cells)
              </Text>
              <Text style={[styles.cargoTabRange, { color: colors.textSecondary }]}>
                1.0°C – 6.0°C
              </Text>
            </View>
          </Pressable>

          {/* Platelets Option */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select Platelets Cargo"
            onPress={() => setCargoType('Platelets')}
            style={[
              styles.cargoTab,
              {
                backgroundColor: cargoType === 'Platelets' ? colors.cobaltBlueBg : colors.bgCard,
                borderColor: cargoType === 'Platelets' ? colors.cobaltBlue : colors.border,
              },
            ]}>
            <Flame
              size={15}
              color={cargoType === 'Platelets' ? colors.cobaltBlue : colors.textMuted}
            />
            <View>
              <Text
                style={[
                  styles.cargoTabText,
                  {
                    color: cargoType === 'Platelets' ? colors.cobaltBlue : colors.textMuted,
                    fontWeight: cargoType === 'Platelets' ? '900' : '700',
                  },
                ]}>
                Platelets (Apheresis)
              </Text>
              <Text style={[styles.cargoTabRange, { color: colors.textSecondary }]}>
                20.0°C – 24.0°C
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* CENTERPIECE: Live Sensor Gauge */}
      <View
        style={[
          styles.gaugeCard,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
          },
        ]}>
        <RadialGauge />
      </View>

      {/* Live Sparkline Graph (15-min history sampled every 60s) */}
      <SparklineGraph />

      {/* Manual Check-In Logger */}
      <ManualCheckInLogger />

      {/* INTERACTIVE DEMO SIMULATION TOGGLE (For Presentation Pitch) */}
      <View
        style={[
          styles.demoToggleCard,
          {
            backgroundColor: isExcursionSimulated ? colors.redAlarmBg : colors.bgCardElevated,
            borderColor: isExcursionSimulated ? colors.redAlarm : colors.border,
          },
        ]}>
        <View style={styles.demoToggleLeft}>
          <View
            style={[
              styles.demoIconWrapper,
              {
                backgroundColor: isExcursionSimulated ? colors.redAlarm : colors.amberWarningBg,
              },
            ]}>
            <ShieldAlert
              size={18}
              color={isExcursionSimulated ? '#FFFFFF' : colors.amberWarning}
            />
          </View>
          <View style={styles.demoTexts}>
            <Text style={[styles.demoBadgeTitle, { color: colors.amberWarning }]}>
              PRESENTATION PITCH SIMULATOR
            </Text>
            <Text style={[styles.demoLabel, { color: colors.textPrimary }]}>
              Simulate Thermal Excursion (&gt; 6.0°C)
            </Text>
            <Text style={[styles.demoSub, { color: colors.textSecondary }]}>
              Spikes temp to 7.4°C, flashes perimeter alarm, and emits excursion_flag.
            </Text>
          </View>
        </View>

        <Switch
          value={isExcursionSimulated}
          onValueChange={(val) => toggleExcursion(val)}
          trackColor={{
            false: colors.border,
            true: colors.redAlarm,
          }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Telemetry Footer Meta */}
      <View style={styles.footerInfo}>
        <Radio size={12} color={colors.textMuted} />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Vitalis Cold-Chain IoT Node • BLE 5.3 Connected • NIST Calibrated
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
    paddingBottom: 28,
  },
  cargoSelectorCard: {
    borderRadius: ERGONOMICS.radiusLg,
    borderWidth: 1,
    padding: 11,
    gap: 8,
  },
  cargoSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cargoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cargoHeaderTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cargoEnvelopeText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '800',
  },
  cargoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cargoTab: {
    flex: 1,
    borderRadius: ERGONOMICS.radiusSm,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  cargoTabText: {
    fontSize: 10,
  },
  cargoTabRange: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  gaugeCard: {
    borderRadius: ERGONOMICS.radiusXl,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  demoToggleCard: {
    borderRadius: ERGONOMICS.radiusLg,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
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
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoTexts: {
    flex: 1,
  },
  demoBadgeTitle: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  demoSub: {
    fontSize: 8.5,
    lineHeight: 12,
    marginTop: 2,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
  },
  footerText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
  },
});
