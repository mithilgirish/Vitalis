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
  Clock,
  ShieldCheck,
  Edit3,
} from 'lucide-react-native';
import { useMission } from '@/context/MissionContext';

export const ManualCheckInLogger: React.FC = () => {
  const { manualLogs, logManualTemperature, temperature, safeEnvelopeMin, safeEnvelopeMax, colors, isDark } =
    useMission();

  const [inputTemp, setInputTemp] = useState<string>(temperature.toFixed(1));
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>(
    'Destination ER Handoff'
  );
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  const checkpoints = [
    { label: 'Pickup', full: 'Pickup Facility Loading' },
    { label: 'Midway', full: 'Midway Transit Audit' },
    { label: 'ER Handoff', full: 'Destination ER Handoff' },
  ];

  const handleLog = (tempToLog: number) => {
    Keyboard.dismiss();
    if (isNaN(tempToLog) || tempToLog < -20 || tempToLog > 50) {
      Alert.alert('Invalid Reading', 'Please enter a valid calibrated Celsius temperature reading.');
      return;
    }

    logManualTemperature(tempToLog, selectedCheckpoint);
    setJustLogged(true);
    setShowCustomInput(false);
    setTimeout(() => setJustLogged(false), 2500);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(28, 29, 35, 0.90)' : 'rgba(255, 255, 255, 0.94)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <ClipboardCheck size={14} color={colors.cobaltBlue} strokeWidth={2.4} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Physical Probe Check-In
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.emeraldSafe }]}>
          SOP Required
        </Text>
      </View>

      {/* Apple-style 3-way Segmented Control */}
      <View
        style={[
          styles.segmentedTrack,
          {
            backgroundColor: isDark ? 'rgba(20, 21, 25, 0.75)' : 'rgba(0, 0, 0, 0.05)',
          },
        ]}>
        {checkpoints.map((cp) => {
          const isSelected = selectedCheckpoint === cp.full;
          return (
            <Pressable
              key={cp.full}
              onPress={() => setSelectedCheckpoint(cp.full)}
              style={({ pressed }) => [
                styles.segmentedTab,
                isSelected && [
                  styles.segmentedTabActive,
                  {
                    backgroundColor: isDark ? 'rgba(38, 39, 47, 0.96)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                  },
                ],
                pressed && { opacity: 0.8 },
              ]}>
              <Text
                style={[
                  styles.checkpointText,
                  {
                    color: isSelected ? colors.textPrimary : colors.textMuted,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}>
                {cp.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* One-Tap Primary Action Button */}
      {!showCustomInput ? (
        <View style={styles.actionContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Record Probe Reading"
            onPress={() => handleLog(parseFloat(temperature.toFixed(1)))}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor: justLogged ? colors.emeraldSafe : colors.cobaltBlue,
              },
              pressed && styles.submitButtonPressed,
            ]}>
            {justLogged ? (
              <>
                <CheckCircle2 size={17} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.submitButtonText}>Verification Recorded ✓</Text>
              </>
            ) : (
              <>
                <ShieldCheck size={17} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.submitButtonText}>
                  Record Check-In ({temperature.toFixed(1)}°C)
                </Text>
              </>
            )}
          </Pressable>

          {/* Secondary subtle toggle for custom manual probe entry */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter custom probe reading"
            onPress={() => {
              setInputTemp(temperature.toFixed(1));
              setShowCustomInput(true);
            }}
            style={({ pressed }) => [
              styles.customToggle,
              pressed && { opacity: 0.7 },
            ]}>
            <Edit3 size={11} color={colors.textMuted} />
            <Text style={[styles.customToggleText, { color: colors.textMuted }]}>
              Enter custom physical probe reading
            </Text>
          </Pressable>
        </View>
      ) : (
        /* Inline Custom Temperature Field */
        <View style={styles.customInputContainer}>
          <View
            style={[
              styles.textInputBox,
              {
                backgroundColor: isDark ? 'rgba(20, 21, 25, 0.75)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary }]}
              value={inputTemp}
              onChangeText={setInputTemp}
              keyboardType="numeric"
              autoFocus
              placeholder="e.g. 4.1"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.inputUnit, { color: colors.textMuted }]}>°C</Text>
          </View>

          <View style={styles.customButtonsRow}>
            <Pressable
              onPress={() => handleLog(parseFloat(inputTemp))}
              style={[styles.customSaveButton, { backgroundColor: colors.cobaltBlue }]}>
              <Text style={styles.customSaveText}>Save</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowCustomInput(false)}
              style={styles.customCancelButton}>
              <Text style={[styles.customCancelText, { color: colors.textMuted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Audit History (Apple Inset Grouped) */}
      <View style={styles.historySection}>
        <Text style={[styles.historyTitle, { color: colors.textMuted }]}>
          VERIFIED AUDITS ({manualLogs.length})
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
                    backgroundColor: isDark ? 'rgba(20, 21, 25, 0.65)' : 'rgba(242, 242, 247, 0.75)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}>
                <View style={styles.logLeft}>
                  <Text style={[styles.logCheckpointText, { color: colors.textPrimary }]}>
                    {log.checkpoint}
                  </Text>
                  <View style={styles.logMeta}>
                    <Clock size={10} color={colors.textMuted} />
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>
                      {log.timestamp} • {log.driverId}
                    </Text>
                  </View>
                </View>

                {/* Logged Temp */}
                <View
                  style={[
                    styles.logTempBadge,
                    {
                      backgroundColor: isSafe
                        ? isDark
                          ? 'rgba(52, 199, 89, 0.16)'
                          : 'rgba(52, 199, 89, 0.10)'
                        : isDark
                        ? 'rgba(255, 69, 58, 0.18)'
                        : 'rgba(255, 69, 58, 0.12)',
                      borderColor: isSafe ? colors.emeraldSafe : colors.redAlarm,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.logTempText,
                      { color: isSafe ? colors.emeraldSafe : colors.redAlarm },
                    ]}>
                    {log.temp.toFixed(1)}°C
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
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '700',
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
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedTabActive: {
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  checkpointText: {
    fontSize: 11,
  },
  actionContainer: {
    gap: 6,
  },
  submitButton: {
    height: 48,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  customToggle: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
  },
  customToggleText: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  customInputContainer: {
    gap: 8,
  },
  textInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '800',
  },
  inputUnit: {
    fontSize: 13,
    fontWeight: '600',
  },
  customButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customSaveButton: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customSaveText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  customCancelButton: {
    height: 40,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCancelText: {
    fontSize: 11,
    fontWeight: '500',
  },
  historySection: {
    marginTop: 2,
    gap: 6,
  },
  historyTitle: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  historyList: {
    gap: 5,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  logLeft: {
    flex: 1,
    gap: 2,
  },
  logCheckpointText: {
    fontSize: 11,
    fontWeight: '700',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 9,
    fontFamily: 'monospace',
  },
  logTempBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  logTempText: {
    fontSize: 11.5,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
});
