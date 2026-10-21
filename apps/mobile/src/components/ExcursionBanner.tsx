import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react-native';
import { useMission } from '@/context/MissionContext';

export const ExcursionBanner: React.FC = () => {
  const { excursionFlag, temperature, safeEnvelopeMax, colors, isDark } = useMission();
  const [expanded, setExpanded] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!excursionFlag) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [excursionFlag, pulseAnim]);

  if (!excursionFlag) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: isDark ? 'rgba(45, 18, 22, 0.95)' : 'rgba(254, 242, 242, 0.98)',
          borderColor: colors.redAlarm,
        },
      ]}>
      {/* Top Banner Alert Bar */}
      <View style={styles.topRow}>
        <Animated.View
          style={[
            styles.iconPulse,
            { backgroundColor: colors.redAlarm, opacity: pulseAnim },
          ]}>
          <AlertTriangle size={18} color="#FFFFFF" strokeWidth={2.4} />
        </Animated.View>

        <View style={styles.headerDetails}>
          <Text style={[styles.alertHeader, { color: colors.redAlarm }]}>
            Cold-Chain Thermal Excursion
          </Text>
          <Text style={[styles.telemetryStatus, { color: colors.textSecondary }]}>
            Temperature at <Text style={styles.monoRed}>{temperature.toFixed(1)}°C</Text> (Limit: ≤ {safeEnvelopeMax.toFixed(1)}°C)
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle Emergency Protocols"
          onPress={() => setExpanded(!expanded)}
          style={({ pressed }) => [
            styles.expandChevron,
            pressed && { opacity: 0.7 },
          ]}>
          {expanded ? (
            <ChevronUp size={18} color={colors.redAlarm} />
          ) : (
            <ChevronDown size={18} color={colors.redAlarm} />
          )}
        </Pressable>
      </View>

      {/* Expanded Clinical Protocols */}
      {expanded && (
        <View
          style={[
            styles.protocolBody,
            {
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDark ? 'rgba(255, 69, 58, 0.2)' : 'rgba(239, 68, 68, 0.15)',
            },
          ]}>
          <View style={styles.instructionRow}>
            <ShieldAlert size={14} color={colors.redAlarm} strokeWidth={2.2} />
            <Text style={[styles.instructionText, { color: colors.textPrimary }]}>
              Engage PCM cold stabilization pack inside container collar.
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <ShieldAlert size={14} color={colors.redAlarm} strokeWidth={2.2} />
            <Text style={[styles.instructionText, { color: colors.textPrimary }]}>
              Do NOT break primary biological seal until Apollo ER handoff.
            </Text>
          </View>
          <View style={styles.instructionRow}>
            <PhoneCall size={14} color={colors.cobaltBlue} strokeWidth={2.2} />
            <Text style={[styles.instructionText, { color: colors.textPrimary }]}>
              Emergency Dispatch Support: <Text style={styles.phoneText}>+91 44 2829 0200</Text>
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    marginVertical: 4,
    gap: 8,
    shadowColor: '#FF453A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconPulse: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDetails: {
    flex: 1,
  },
  alertHeader: {
    fontWeight: '700',
    fontSize: 12.5,
    letterSpacing: -0.2,
  },
  telemetryStatus: {
    fontSize: 10.5,
    marginTop: 1,
  },
  monoRed: {
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#FF453A',
  },
  expandChevron: {
    padding: 4,
  },
  protocolBody: {
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionText: {
    fontSize: 10.5,
    flex: 1,
    lineHeight: 14,
  },
  phoneText: {
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
