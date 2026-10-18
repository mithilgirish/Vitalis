import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import {
  AlertTriangle,
  Radio,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

export const ExcursionBanner: React.FC = () => {
  const { excursionFlag, temperature, safeEnvelopeMax, colors } = useMission();
  const [expanded, setExpanded] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!excursionFlag) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 350,
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
          backgroundColor: colors.redAlarmBg,
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
          <AlertTriangle size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>

        <View style={styles.headerDetails}>
          <Text style={[styles.alertHeader, { color: colors.redAlarm }]}>
            CRITICAL EXCURSION BROADCASTED TO COMMAND CENTER
          </Text>
          <Text style={[styles.telemetryStatus, { color: colors.textSecondary }]}>
            Sensor Temp: <Text style={styles.monoRed}>{temperature.toFixed(1)}°C</Text> (Threshold: &gt;{safeEnvelopeMax.toFixed(1)}°C)
          </Text>
        </View>
      </View>

      {/* Broadcast Meta Badge */}
      <View
        style={[
          styles.broadcastMeta,
          {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: colors.redAlarm,
          },
        ]}>
        <View style={styles.telemetryTag}>
          <Radio size={11} color={colors.redAlarm} />
          <Text style={[styles.telemetryTagText, { color: colors.redAlarm }]}>
            EMITTED: excursion_flag: true
          </Text>
        </View>
        <Text style={[styles.packetId, { color: colors.textMuted }]}>
          PACKET: #EXC-9921-VTL
        </Text>
      </View>

      {/* Emergency Action Checklist Toggle */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.expandHeader}>
        <View style={styles.expandLeft}>
          <FileText size={13} color={colors.redAlarm} />
          <Text style={[styles.expandTitle, { color: colors.redAlarm }]}>
            EMERGENCY PROTOCOL CHECKLIST
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={15} color={colors.redAlarm} />
        ) : (
          <ChevronDown size={15} color={colors.redAlarm} />
        )}
      </Pressable>

      {expanded && (
        <View
          style={[
            styles.protocolBody,
            { backgroundColor: 'rgba(0, 0, 0, 0.15)' },
          ]}>
          <Text style={[styles.protocolStep, { color: colors.textPrimary }]}>
            1. DO NOT open primary container seal without command authorization.
          </Text>
          <Text style={[styles.protocolStep, { color: colors.textPrimary }]}>
            2. Inspect thermoelectric Peltier collar and cooling vents.
          </Text>
          <Text style={[styles.protocolStep, { color: colors.textPrimary }]}>
            3. Contact Emergency Logistics Dispatcher: <Text style={styles.monoPhone}>+91 44 2829 0200</Text>.
          </Text>
          <Text style={[styles.protocolStep, { color: colors.textPrimary }]}>
            4. Prepare secondary dry ice transfer upon arrival at Apollo Trauma Bay.
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: ERGONOMICS.radiusMd,
    borderWidth: 1.5,
    padding: 10,
    marginVertical: 4,
    gap: 7,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  iconPulse: {
    width: 34,
    height: 34,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDetails: {
    flex: 1,
  },
  alertHeader: {
    fontWeight: '900',
    fontSize: 10.5,
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  telemetryStatus: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 2,
  },
  monoRed: {
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#DC2626',
  },
  broadcastMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  telemetryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  telemetryTagText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  packetId: {
    fontSize: 8.5,
    fontFamily: 'monospace',
  },
  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 3,
  },
  expandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expandTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  protocolBody: {
    padding: 8,
    borderRadius: 6,
    gap: 3,
  },
  protocolStep: {
    fontSize: 9,
    lineHeight: 13,
  },
  monoPhone: {
    fontFamily: 'monospace',
    fontWeight: '900',
  },
});
