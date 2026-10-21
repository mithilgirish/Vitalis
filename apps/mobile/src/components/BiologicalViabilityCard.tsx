import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  QrCode,
  Building2,
  Clock,
  Thermometer,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useMission } from '@/context/MissionContext';

interface BiologicalViabilityCardProps {
  onSimulateDispatch?: () => void;
}

export const BiologicalViabilityCard: React.FC<BiologicalViabilityCardProps> = ({
  onSimulateDispatch,
}) => {
  const router = useRouter();
  const {
    etaSeconds,
    viabilityLimitSeconds,
    destination,
    cargo,
    temperature,
    excursionFlag,
    step3,
    distanceKm,
    colors,
    isDark,
  } = useMission();

  const etaMinutes = Math.max(1, Math.round(etaSeconds / 60));
  const viabilityHours = Math.floor(viabilityLimitSeconds / 3600);
  const viabilityMins = Math.floor((viabilityLimitSeconds % 3600) / 60);

  // Calculate estimated arrival clock time (e.g., 14:43)
  const now = new Date();
  const arrivalTime = new Date(now.getTime() + etaSeconds * 1000);
  const arrivalFormatted = arrivalTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <View
      style={[
        styles.sheet,
        {
          backgroundColor: isDark ? 'rgba(24, 25, 30, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}>
      {/* Apple Drag Handle Pill */}
      <View
        style={[
          styles.dragHandle,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.16)',
          },
        ]}
      />

      {/* TOP ROW: Apple Maps Hero ETA & Live Cold Chain Status */}
      <View style={styles.heroRow}>
        <View style={styles.etaGroup}>
          <View style={styles.etaNumberRow}>
            <Text style={[styles.etaValue, { color: colors.cobaltBlue }]}>{etaMinutes}</Text>
            <Text style={[styles.etaUnit, { color: colors.cobaltBlue }]}>min</Text>
          </View>
          <Text style={[styles.etaSub, { color: colors.textSecondary }]}>
            {distanceKm.toFixed(1)} km • {arrivalFormatted} arrival
          </Text>
        </View>

        {/* Cold-Chain Status Pill */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Cold-Chain Telemetry"
          onPress={() => router.push('/telemetry')}
          style={({ pressed }) => [
            styles.tempStatusPill,
            excursionFlag
              ? {
                  backgroundColor: colors.redAlarm,
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
            pressed && { opacity: 0.8 },
          ]}>
          <Thermometer
            size={14}
            color={excursionFlag ? '#FFFFFF' : colors.emeraldSafe}
            strokeWidth={2.4}
          />
          <View>
            <Text
              style={[
                styles.tempStatusText,
                { color: excursionFlag ? '#FFFFFF' : colors.emeraldSafe },
              ]}>
              {temperature.toFixed(1)}°C {excursionFlag ? 'ALARM' : 'SAFE'}
            </Text>
            <Text
              style={[
                styles.tempEnvelopeSub,
                { color: excursionFlag ? 'rgba(255,255,255,0.85)' : colors.textMuted },
              ]}>
              1.0°C – 6.0°C Target
            </Text>
          </View>
        </Pressable>
      </View>

      {/* CLINICAL DESTINATION & PAYLOAD CARD */}
      <View
        style={[
          styles.clinicalCard,
          {
            backgroundColor: isDark ? 'rgba(32, 33, 40, 0.75)' : 'rgba(242, 242, 247, 0.85)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          },
        ]}>
        {/* Hospital Destination */}
        <View style={styles.destinationRow}>
          <View style={[styles.destIconWrapper, { backgroundColor: colors.cobaltBlueBg }]}>
            <Building2 size={16} color={colors.cobaltBlue} strokeWidth={2.2} />
          </View>
          <View style={styles.destTexts}>
            <Text style={[styles.destHospital, { color: colors.textPrimary }]} numberOfLines={1}>
              {destination}
            </Text>
            <Text style={[styles.destSub, { color: colors.textSecondary }]}>
              Emergency Trauma Bay 2 • Priority Intake
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.cardDivider,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        />

        {/* Payload & Viability Info */}
        <View style={styles.payloadRow}>
          <View style={styles.payloadItem}>
            <ShieldCheck size={13} color={colors.emeraldSafe} strokeWidth={2.4} />
            <Text style={[styles.payloadText, { color: colors.textPrimary }]}>
              {cargo}
            </Text>
          </View>

          <View style={styles.viabilityItem}>
            <Clock size={13} color={colors.amberWarning} strokeWidth={2.2} />
            <Text style={[styles.viabilityText, { color: colors.textSecondary }]}>
              Viability: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{viabilityHours}h {viabilityMins}m</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* PRIMARY HEALTHCARE ACTION BUTTON */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Proceed to Custody Verification"
        onPress={() => router.push('/scanner')}
        style={({ pressed }) => [
          styles.primaryCtaButton,
          {
            backgroundColor: step3.completed ? colors.emeraldSafe : colors.cobaltBlue,
          },
          pressed && styles.primaryCtaPressed,
        ]}>
        <QrCode size={19} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.primaryCtaText}>
          {step3.completed
            ? 'Custody Transfer Complete ✓'
            : 'Arrive & Scan Recipient Badge'}
        </Text>
        <ChevronRight size={17} color="#FFFFFF" strokeWidth={2.4} />
      </Pressable>

      {/* Discreet Demo Push Trigger */}
      {onSimulateDispatch && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Test Incoming Dispatch Alert"
          onPress={onSimulateDispatch}
          style={({ pressed }) => [
            styles.demoTrigger,
            pressed && { opacity: 0.6 },
          ]}>
          <Text style={[styles.demoTriggerText, { color: colors.textMuted }]}>
            Simulate Incoming Push Dispatch
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
  dragHandle: {
    width: 36,
    height: 4.5,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 2,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaGroup: {
    gap: 1,
  },
  etaNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  etaValue: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 38,
  },
  etaUnit: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  etaSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  tempStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  tempStatusText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  tempEnvelopeSub: {
    fontSize: 8.5,
    fontWeight: '500',
  },
  clinicalCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 8,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  destIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destTexts: {
    flex: 1,
  },
  destHospital: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  destSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  payloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  payloadText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viabilityText: {
    fontSize: 10.5,
  },
  primaryCtaButton: {
    height: 52,
    borderRadius: 999, // Apple floating pill button
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 8,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryCtaPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  demoTrigger: {
    alignSelf: 'center',
    paddingVertical: 4,
    marginTop: 2,
  },
  demoTriggerText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
