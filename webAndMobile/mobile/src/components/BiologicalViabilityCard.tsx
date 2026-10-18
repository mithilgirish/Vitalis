import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Clock,
  Thermometer,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Truck,
  Building2,
  AlertOctagon,
} from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

export const BiologicalViabilityCard: React.FC = () => {
  const router = useRouter();
  const {
    etaSeconds,
    viabilityLimitSeconds,
    origin,
    destination,
    temperature,
    excursionFlag,
    step3,
    colors,
  } = useMission();

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const etaFormatted = formatTime(etaSeconds);
  const viabilityFormatted = formatTime(viabilityLimitSeconds);
  const isViabilityCritical = viabilityLimitSeconds < 15 * 60;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
        },
      ]}>
      {/* Top Handle bar */}
      <View style={[styles.handleBar, { backgroundColor: colors.borderActive }]} />

      {/* Viability Countdown Monospace Header */}
      <View
        style={[
          styles.viabilityRow,
          {
            backgroundColor: colors.bgCardElevated,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.timerGroup}>
          <View style={styles.timerHeader}>
            <Clock size={14} color={colors.cobaltBlue} />
            <Text style={[styles.timerTitle, { color: colors.cobaltBlue }]}>TRANSIT ETA</Text>
          </View>
          <Text style={[styles.timerMonospace, { color: colors.textPrimary }]}>
            {etaFormatted}
          </Text>
        </View>

        <View style={[styles.timerDivider, { backgroundColor: colors.border }]} />

        <View style={styles.timerGroup}>
          <View style={styles.timerHeader}>
            <AlertOctagon
              size={14}
              color={isViabilityCritical ? colors.redAlarm : colors.amberWarning}
            />
            <Text
              style={[
                styles.timerTitle,
                { color: isViabilityCritical ? colors.redAlarm : colors.amberWarning },
              ]}>
              VIABILITY LIMIT
            </Text>
          </View>
          <Text
            style={[
              styles.timerMonospace,
              { color: isViabilityCritical ? colors.redAlarm : colors.amberWarning },
            ]}>
            {viabilityFormatted}
          </Text>
        </View>
      </View>

      {/* Route Stepper: Pickup Facility -> In Transit -> Destination Handoff */}
      <View
        style={[
          styles.stepperContainer,
          {
            backgroundColor: colors.bgCardElevated,
            borderColor: colors.border,
          },
        ]}>
        {/* Step 1: Pickup Facility */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepIconBubble,
              { backgroundColor: colors.emeraldSafe },
            ]}>
            <CheckCircle2 size={15} color="#FFFFFF" strokeWidth={3} />
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.emeraldSafe }]}>PICKUP</Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {origin}
            </Text>
            <Text style={[styles.stepTime, { color: colors.textMuted }]}>14:35 IST • Sealed</Text>
          </View>
        </View>

        {/* Connector Line 1 */}
        <View style={[styles.connectorLine, { backgroundColor: colors.cobaltBlue }]} />

        {/* Step 2: In Transit */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepIconBubble,
              { backgroundColor: colors.cobaltBlue },
            ]}>
            <Truck size={15} color="#FFFFFF" />
          </View>
          <View style={styles.stepContent}>
            <View style={styles.activeStepTag}>
              <Text style={[styles.stepHeading, { color: colors.cobaltBlue }]}>EN ROUTE</Text>
              <View style={[styles.activePulseDot, { backgroundColor: colors.cobaltBlue }]} />
            </View>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]}>Anna Salai Rd</Text>
            <Text style={[styles.stepTime, { color: colors.textMuted }]}>68 km/h • GPS Sync</Text>
          </View>
        </View>

        {/* Connector Line 2 */}
        <View
          style={[
            styles.connectorLine,
            { backgroundColor: step3.completed ? colors.emeraldSafe : colors.border },
          ]}
        />

        {/* Step 3: Destination Handoff */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepIconBubble,
              {
                backgroundColor: step3.completed ? colors.emeraldSafe : colors.bgSurface,
                borderColor: colors.border,
                borderWidth: step3.completed ? 0 : 1,
              },
            ]}>
            {step3.completed ? (
              <CheckCircle2 size={15} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Building2 size={15} color={colors.textMuted} />
            )}
          </View>
          <View style={styles.stepContent}>
            <Text
              style={[
                styles.stepHeading,
                { color: step3.completed ? colors.emeraldSafe : colors.textMuted },
              ]}>
              HANDOFF
            </Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {destination}
            </Text>
            <Text style={[styles.stepTime, { color: colors.textMuted }]}>
              {step3.completed ? 'Delivered' : 'Awaiting Scan'}
            </Text>
          </View>
        </View>
      </View>

      {/* QUICK-ACTION BUTTONS (Minimum 56px height) */}
      <View style={styles.actionsRow}>
        {/* Button 1: Cold-Chain Telemetry */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Cold-Chain Telemetry"
          onPress={() => router.push('/telemetry')}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: colors.bgCardElevated,
              borderColor: excursionFlag ? colors.redAlarm : colors.border,
            },
            excursionFlag && { backgroundColor: colors.redAlarmBg },
            pressed && styles.actionButtonPressed,
          ]}>
          <View
            style={[
              styles.actionIconContainer,
              {
                backgroundColor: excursionFlag ? colors.redAlarmBg : colors.emeraldSafeBg,
              },
            ]}>
            <Thermometer
              size={20}
              color={excursionFlag ? colors.redAlarm : colors.emeraldSafe}
            />
          </View>
          <View style={styles.actionDetails}>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>COLD-CHAIN</Text>
            <Text
              style={[
                styles.actionStatus,
                { color: excursionFlag ? colors.redAlarm : colors.emeraldSafe },
              ]}>
              {excursionFlag ? 'ALARM: 7.4°C' : `${temperature.toFixed(1)}°C SAFE`}
            </Text>
          </View>
          <ChevronRight size={17} color={colors.textMuted} />
        </Pressable>

        {/* Button 2: Scan Chain-of-Custody */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Chain of Custody Scanner"
          onPress={() => router.push('/scanner')}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: colors.bgCardElevated,
              borderColor: colors.cobaltBlue,
            },
            pressed && styles.actionButtonPressed,
          ]}>
          <View
            style={[
              styles.actionIconContainer,
              { backgroundColor: colors.cobaltBlueBg },
            ]}>
            <QrCode size={20} color={colors.cobaltBlue} />
          </View>
          <View style={styles.actionDetails}>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>CUSTODY SCAN</Text>
            <Text style={[styles.actionStatusScanner, { color: colors.cobaltBlue }]}>
              {step3.completed ? 'COMPLETED ✓' : 'STEP 3: RECIPIENT'}
            </Text>
          </View>
          <ChevronRight size={17} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderTopLeftRadius: ERGONOMICS.radiusXl,
    borderTopRightRadius: ERGONOMICS.radiusXl,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  viabilityRow: {
    borderRadius: ERGONOMICS.radiusMd,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timerGroup: {
    alignItems: 'center',
    gap: 2,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timerTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timerMonospace: {
    fontFamily: 'monospace',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timerDivider: {
    width: 1,
    height: 32,
  },
  stepperContainer: {
    borderRadius: ERGONOMICS.radiusMd,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  stepIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
  },
  stepHeading: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeStepTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  stepSub: {
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  stepTime: {
    fontSize: 7.5,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  connectorLine: {
    width: 22,
    height: 1.5,
    marginTop: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: ERGONOMICS.minTouchTarget, // Minimum 56px touch target
    borderRadius: ERGONOMICS.radiusMd,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDetails: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionStatus: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
    marginTop: 1,
  },
  actionStatusScanner: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
    marginTop: 1,
  },
});
