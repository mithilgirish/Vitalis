import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  Alert,
} from 'react-native';
import {
  ClipboardCheck,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

export const ManualCheckInLogger: React.FC = () => {
  const { manualLogs, logManualTemperature, temperature, safeEnvelopeMin, safeEnvelopeMax, colors } =
    useMission();

  const [inputTemp, setInputTemp] = useState<string>(temperature.toFixed(1));
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>(
    'Destination ER Handoff'
  );
  const [justLogged, setJustLogged] = useState(false);

  const checkpoints = [
    'Pickup Facility Loading',
    'Midway Transit Audit',
    'Destination ER Handoff',
  ];

  const handleLog = () => {
    Keyboard.dismiss();
    const parsed = parseFloat(inputTemp);
    if (isNaN(parsed) || parsed < -20 || parsed > 50) {
      Alert.alert('Invalid Reading', 'Please enter a valid calibrated Celsius temperature reading.');
      return;
    }

    logManualTemperature(parsed, selectedCheckpoint);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2500);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCardElevated,
          borderColor: colors.border,
        },
      ]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <ClipboardCheck size={14} color={colors.cobaltBlue} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            MANUAL CHECK-IN LOGGER
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.emeraldSafe }]}>MANDATORY SOP</Text>
      </View>

      <Text style={[styles.instruction, { color: colors.textSecondary }]}>
        Driver confirmation required at Pickup and Delivery Handoff using calibrated physical probe.
      </Text>

      {/* Checkpoint selector pills */}
      <View style={styles.checkpointRow}>
        {checkpoints.map((cp) => {
          const isSelected = selectedCheckpoint === cp;
          return (
            <Pressable
              key={cp}
              onPress={() => setSelectedCheckpoint(cp)}
              style={[
                styles.checkpointPill,
                {
                  backgroundColor: isSelected ? colors.cobaltBlueBg : colors.bgCard,
                  borderColor: isSelected ? colors.cobaltBlue : colors.border,
                },
              ]}>
              <Text
                style={[
                  styles.checkpointText,
                  {
                    color: isSelected ? colors.cobaltBlue : colors.textMuted,
                    fontWeight: isSelected ? '900' : '700',
                  },
                ]}>
                {cp === 'Pickup Facility Loading'
                  ? '1. PICKUP'
                  : cp === 'Midway Transit Audit'
                  ? '2. TRANSIT'
                  : '3. HANDOFF'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Input row */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
            PROBE READING (°C):
          </Text>
          <View
            style={[
              styles.textInputBox,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
              },
            ]}>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              value={inputTemp}
              onChangeText={setInputTemp}
              keyboardType="numeric"
              placeholder="e.g. 3.8"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.inputUnit, { color: colors.textMuted }]}>°C</Text>
          </View>
        </View>

        {/* Quick set current sensor temp */}
        <Pressable
          onPress={() => setInputTemp(temperature.toFixed(1))}
          style={[
            styles.syncProbeButton,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.syncProbeText, { color: colors.cobaltBlue }]}>
            USE BLE SENSOR
          </Text>
          <Text style={[styles.syncProbeVal, { color: colors.textPrimary }]}>
            {temperature.toFixed(1)}°C
          </Text>
        </Pressable>
      </View>

      {/* Primary Action Button: Minimum 56px height for ergonomic one-handed operation */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Verify & Log Temperature"
        onPress={handleLog}
        style={({ pressed }) => [
          styles.submitButton,
          {
            backgroundColor: justLogged ? colors.emeraldSafe : colors.cobaltBlue,
          },
          pressed && styles.submitButtonPressed,
        ]}>
        {justLogged ? (
          <>
            <CheckCircle2 size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>LOGGED TO AUDIT TRAIL ✓</Text>
          </>
        ) : (
          <>
            <ShieldCheck size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>VERIFY &amp; LOG TEMPERATURE</Text>
          </>
        )}
      </Pressable>

      {/* Recent Check-In Audit Logs */}
      <View style={styles.historySection}>
        <Text style={[styles.historyTitle, { color: colors.textMuted }]}>
          VERIFIED AUDIT LOG ({manualLogs.length})
        </Text>
        <View style={styles.historyList}>
          {manualLogs.map((log) => {
            const isSafe = log.temp >= safeEnvelopeMin && log.temp <= safeEnvelopeMax;
            return (
              <View
                key={log.id}
                style={[
                  styles.logItem,
                  {
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                  },
                ]}>
                <View style={styles.logLeft}>
                  <View
                    style={[
                      styles.logCheckpointTag,
                      { backgroundColor: colors.bgSurface },
                    ]}>
                    <Text style={[styles.logCheckpointText, { color: colors.textPrimary }]}>
                      {log.checkpoint}
                    </Text>
                  </View>
                  <View style={styles.logMeta}>
                    <View style={styles.metaIconText}>
                      <Clock size={10} color={colors.textMuted} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        {log.timestamp}
                      </Text>
                    </View>
                    <View style={styles.metaIconText}>
                      <MapPin size={10} color={colors.textMuted} />
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        {log.location}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Logged Temp */}
                <View
                  style={[
                    styles.logTempBadge,
                    {
                      backgroundColor: isSafe ? colors.emeraldSafeBg : colors.redAlarmBg,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.logTempText,
                      { color: isSafe ? colors.emeraldSafe : colors.redAlarm },
                    ]}>
                    {log.temp.toFixed(1)}°C
                  </Text>
                  <Text style={[styles.logVerifiedBy, { color: colors.textMuted }]}>
                    {log.driverId}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: ERGONOMICS.radiusLg,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 8.5,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  instruction: {
    fontSize: 9.5,
    lineHeight: 14,
  },
  checkpointRow: {
    flexDirection: 'row',
    gap: 6,
  },
  checkpointPill: {
    flex: 1,
    borderRadius: ERGONOMICS.radiusSm,
    paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 1,
  },
  checkpointText: {
    fontSize: 9,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    gap: 3,
  },
  inputLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ERGONOMICS.radiusSm,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
  },
  inputUnit: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  syncProbeButton: {
    borderRadius: ERGONOMICS.radiusSm,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncProbeText: {
    fontSize: 7.5,
    fontWeight: '900',
  },
  syncProbeVal: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  submitButton: {
    height: ERGONOMICS.buttonHeight, // Minimum 56px height
    borderRadius: ERGONOMICS.radiusMd,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  historySection: {
    marginTop: 2,
    gap: 5,
  },
  historyTitle: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  historyList: {
    gap: 5,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: ERGONOMICS.radiusSm,
    borderWidth: 1,
    padding: 7,
  },
  logLeft: {
    flex: 1,
    gap: 3,
  },
  logCheckpointTag: {
    alignSelf: 'flex-start',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  logCheckpointText: {
    fontSize: 9,
    fontWeight: '800',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 8,
    fontFamily: 'monospace',
  },
  logTempBadge: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 5,
    alignItems: 'center',
  },
  logTempText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  logVerifiedBy: {
    fontSize: 7.5,
    fontFamily: 'monospace',
  },
});
