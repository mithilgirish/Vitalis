import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import {
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  FileCheck,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  QrCode,
} from 'lucide-react-native';
import { useMission, getRealDateString, getRealTimeIST } from '@/context/MissionContext';

interface CustodyChecklistProps {
  onSelectStepToScan: (step: 1 | 2 | 3) => void;
  activeScanStep: 1 | 2 | 3;
}

export const CustodyChecklist: React.FC<CustodyChecklistProps> = ({
  onSelectStepToScan,
  activeScanStep,
}) => {
  const {
    step1,
    step2,
    step3,
    status,
    completeHandoff,
    deliveredAt,
    excursionFlag,
    origin,
    destination,
    cargo,
    id: missionId,
    resetToDispatchModal,
    resetCustodySteps,
    colors,
    isDark,
  } = useMission();

  const [showCertificate, setShowCertificate] = useState(false);

  const allCompleted = step1.completed && step2.completed && step3.completed;
  const isDelivered = status === 'delivered';

  const handleFinishHandoff = () => {
    completeHandoff();
    setShowCertificate(true);
  };

  const handleResetChecklist = () => {
    resetCustodySteps();
    onSelectStepToScan(1);
  };

  const completedCount = Number(step1.completed) + Number(step2.completed) + Number(step3.completed);

  return (
    <View style={styles.container}>
      {/* Apple Inset Grouped Verification Card */}
      <View
        style={[
          styles.checklistCard,
          {
            backgroundColor: isDark ? 'rgba(28, 29, 35, 0.90)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <FileCheck size={14} color={colors.cobaltBlue} strokeWidth={2.4} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Chain of Custody
            </Text>
          </View>
          <View
            style={[
              styles.countPill,
              {
                backgroundColor: allCompleted
                  ? isDark
                    ? 'rgba(52, 199, 89, 0.16)'
                    : 'rgba(52, 199, 89, 0.10)'
                  : isDark
                  ? 'rgba(10, 132, 255, 0.14)'
                  : 'rgba(0, 122, 255, 0.08)',
                borderColor: allCompleted
                  ? isDark
                    ? 'rgba(52, 199, 89, 0.30)'
                    : 'rgba(52, 199, 89, 0.22)'
                  : isDark
                  ? 'rgba(10, 132, 255, 0.28)'
                  : 'rgba(0, 122, 255, 0.18)',
              },
            ]}>
            <Text
              style={[
                styles.countText,
                { color: allCompleted ? colors.emeraldSafe : colors.cobaltBlue },
              ]}>
              {completedCount} of 3 Verified
            </Text>
          </View>
        </View>

        {/* STEP 1: Origin Batch */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Step 1: Origin Blood Batch"
          onPress={() => onSelectStepToScan(1)}
          style={({ pressed }) => [
            styles.stepRow,
            activeScanStep === 1 && !step1.completed && {
              backgroundColor: isDark ? 'rgba(10, 132, 255, 0.08)' : 'rgba(0, 122, 255, 0.05)',
            },
            pressed && { opacity: 0.8 },
          ]}>
          <View style={styles.stepLeft}>
            <View
              style={[
                styles.stepIcon,
                {
                  backgroundColor: step1.completed
                    ? isDark
                      ? 'rgba(52, 199, 89, 0.16)'
                      : 'rgba(52, 199, 89, 0.10)'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}>
              {step1.completed ? (
                <CheckCircle2 size={16} color={colors.emeraldSafe} strokeWidth={2.6} />
              ) : (
                <Text style={[styles.stepNum, { color: colors.cobaltBlue }]}>1</Text>
              )}
            </View>

            <View style={styles.stepTexts}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                Origin Blood Bank Batch
              </Text>
              <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
                {step1.completed
                  ? `Batch ${step1.verifiedData} • O- PRBC`
                  : 'Scan barcode on blood unit package'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.stepStatusPill,
              step1.completed
                ? {
                    backgroundColor: isDark
                      ? 'rgba(52, 199, 89, 0.14)'
                      : 'rgba(52, 199, 89, 0.08)',
                    borderColor: colors.emeraldSafe,
                  }
                : {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
                  },
            ]}>
            <Text
              style={[
                styles.stepStatusText,
                { color: step1.completed ? colors.emeraldSafe : colors.textMuted },
              ]}>
              {step1.completed ? 'Verified ✓' : 'Scan'}
            </Text>
          </View>
        </Pressable>

        <View
          style={[
            styles.rowDivider,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        />

        {/* STEP 2: Container Security Seal */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Step 2: Cold-Box Security Seal"
          onPress={() => onSelectStepToScan(2)}
          style={({ pressed }) => [
            styles.stepRow,
            activeScanStep === 2 && !step2.completed && {
              backgroundColor: isDark ? 'rgba(10, 132, 255, 0.08)' : 'rgba(0, 122, 255, 0.05)',
            },
            pressed && { opacity: 0.8 },
          ]}>
          <View style={styles.stepLeft}>
            <View
              style={[
                styles.stepIcon,
                {
                  backgroundColor: step2.completed
                    ? isDark
                      ? 'rgba(52, 199, 89, 0.16)'
                      : 'rgba(52, 199, 89, 0.10)'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}>
              {step2.completed ? (
                <CheckCircle2 size={16} color={colors.emeraldSafe} strokeWidth={2.6} />
              ) : (
                <Text style={[styles.stepNum, { color: colors.cobaltBlue }]}>2</Text>
              )}
            </View>

            <View style={styles.stepTexts}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                Cold-Box Security Seal
              </Text>
              <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
                {step2.completed
                  ? `Seal ${step2.verifiedData} Intact • 4.2°C`
                  : 'Scan tamper-evident seal on cooler box'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.stepStatusPill,
              step2.completed
                ? {
                    backgroundColor: isDark
                      ? 'rgba(52, 199, 89, 0.14)'
                      : 'rgba(52, 199, 89, 0.08)',
                    borderColor: colors.emeraldSafe,
                  }
                : {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
                  },
            ]}>
            <Text
              style={[
                styles.stepStatusText,
                { color: step2.completed ? colors.emeraldSafe : colors.textMuted },
              ]}>
              {step2.completed ? 'Intact ✓' : 'Scan'}
            </Text>
          </View>
        </Pressable>

        <View
          style={[
            styles.rowDivider,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        />

        {/* STEP 3: Receiving ER Physician Badge */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Step 3: Receiving ER Physician Badge"
          onPress={() => onSelectStepToScan(3)}
          style={({ pressed }) => [
            styles.stepRow,
            activeScanStep === 3 && !step3.completed && {
              backgroundColor: isDark ? 'rgba(10, 132, 255, 0.08)' : 'rgba(0, 122, 255, 0.05)',
            },
            pressed && { opacity: 0.8 },
          ]}>
          <View style={styles.stepLeft}>
            <View
              style={[
                styles.stepIcon,
                {
                  backgroundColor: step3.completed
                    ? isDark
                      ? 'rgba(52, 199, 89, 0.16)'
                      : 'rgba(52, 199, 89, 0.10)'
                    : isDark
                    ? 'rgba(10, 132, 255, 0.14)'
                    : 'rgba(0, 122, 255, 0.08)',
                },
              ]}>
              {step3.completed ? (
                <CheckCircle2 size={16} color={colors.emeraldSafe} strokeWidth={2.6} />
              ) : (
                <UserCheck size={16} color={colors.cobaltBlue} strokeWidth={2.2} />
              )}
            </View>

            <View style={styles.stepTexts}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                Receiving ER Physician Badge
              </Text>
              <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
                {step3.completed
                  ? `${step3.metadata?.recipientName} (${step3.metadata?.role}) • ${step3.timestamp}`
                  : 'Scan doctor ID badge at Apollo Greams ER'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.stepStatusPill,
              step3.completed
                ? {
                    backgroundColor: isDark
                      ? 'rgba(52, 199, 89, 0.14)'
                      : 'rgba(52, 199, 89, 0.08)',
                    borderColor: colors.emeraldSafe,
                  }
                : {
                    backgroundColor: isDark
                      ? 'rgba(10, 132, 255, 0.16)'
                      : 'rgba(0, 122, 255, 0.10)',
                    borderColor: colors.cobaltBlue,
                  },
            ]}>
            <Text
              style={[
                styles.stepStatusText,
                { color: step3.completed ? colors.emeraldSafe : colors.cobaltBlue },
              ]}>
              {step3.completed ? 'Verified ✓' : 'Scan Badge'}
            </Text>
          </View>
        </Pressable>

        {/* Reset & Restart Flow Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset all 3 verification steps"
          onPress={handleResetChecklist}
          style={({ pressed }) => [
            styles.resetFlowRow,
            pressed && { opacity: 0.65 },
          ]}>
          <RotateCcw size={12} color={colors.cobaltBlue} />
          <Text style={[styles.resetFlowText, { color: colors.cobaltBlue }]}>
            Reset All Steps (Test Camera from Step 1)
          </Text>
        </Pressable>
      </View>

      {/* Primary Completion Button */}
      <View style={styles.completionContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Complete Handoff & View Receipt"
          disabled={!allCompleted}
          onPress={handleFinishHandoff}
          style={({ pressed }) => [
            styles.handoffButton,
            {
              backgroundColor: isDelivered
                ? colors.cobaltBlue
                : allCompleted
                ? colors.emeraldSafe
                : isDark
                ? 'rgba(38, 39, 47, 0.60)'
                : 'rgba(0, 0, 0, 0.06)',
            },
            allCompleted && {
              shadowColor: colors.emeraldSafe,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.28,
              shadowRadius: 10,
              elevation: 6,
            },
            pressed && styles.handoffButtonPressed,
          ]}>
          <ShieldCheck
            size={18}
            color={allCompleted || isDelivered ? '#FFFFFF' : colors.textMuted}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.handoffButtonText,
              { color: allCompleted || isDelivered ? '#FFFFFF' : colors.textMuted },
            ]}>
            {isDelivered
              ? 'View Digital Delivery Receipt'
              : allCompleted
              ? 'Complete Transfer & Generate Receipt'
              : 'Scan Doctor Badge to Finish'}
          </Text>
          {(allCompleted || isDelivered) && (
            <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.4} />
          )}
        </Pressable>
      </View>

      {/* APPLE HEALTH STYLE DIGITAL RECEIPT MODAL */}
      <Modal visible={showCertificate} transparent animationType="fade">
        <View
          style={[
            styles.modalBackdrop,
            { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.65)' },
          ]}>
          <View
            style={[
              styles.certCard,
              {
                backgroundColor: isDark ? 'rgba(28, 29, 35, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}>
            {/* Header: Green Apple Medical Pass */}
            <View style={[styles.certHeader, { backgroundColor: colors.emeraldSafe }]}>
              <View style={styles.certShieldIcon}>
                <ShieldCheck size={22} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.certHeaderText}>
                <Text style={styles.certTitle}>Chain-of-Custody Delivery Receipt</Text>
                <Text style={styles.certSub}>LEGAL MEDICAL TRANSFER CONFIRMED</Text>
              </View>
            </View>

            {/* Receipt Body */}
            <View style={styles.certBody}>
              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>TRANSFER ID</Text>
                <Text style={[styles.certValBold, { color: colors.textPrimary }]}>
                  {missionId}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>TRANSFER DATE</Text>
                <Text style={[styles.certValBold, { color: colors.textPrimary }]}>
                  {getRealDateString()}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>BIOLOGICAL PAYLOAD</Text>
                <Text style={[styles.certValHighlight, { color: colors.cobaltBlue }]}>
                  {cargo}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>ORIGIN & BATCH CODE</Text>
                <Text style={[styles.certVal, { color: colors.textSecondary }]}>
                  {origin} • {step1.verifiedData || 'BATCH-O-NEG-9842'}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>COOLER SEAL</Text>
                <Text style={[styles.certVal, { color: colors.textSecondary }]}>
                  {step2.verifiedData || 'SEAL-VALID-4029'} (Verified Intact)
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>DESTINATION</Text>
                <Text style={[styles.certVal, { color: colors.textSecondary }]}>
                  {destination}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>RECEIVING PHYSICIAN</Text>
                <Text style={[styles.certValBold, { color: colors.textPrimary }]}>
                  {step3.metadata?.recipientName || 'Dr. Arvind Swaminathan, MD'} ({step3.verifiedData || 'STAFF ID'})
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>DELIVERY TIME</Text>
                <Text style={[styles.certValMono, { color: colors.textPrimary }]}>
                  {deliveredAt || getRealTimeIST(0)}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>COLD-CHAIN AUDIT</Text>
                <Text
                  style={[
                    styles.certValBold,
                    { color: excursionFlag ? colors.redAlarm : colors.emeraldSafe },
                  ]}>
                  {excursionFlag ? 'Excursion Alert (7.4°C)' : 'Pass (≤ 6.0°C Nominal)'}
                </Text>
              </View>

              {/* Digital Verification Seal */}
              <View
                style={[
                  styles.cryptoBadge,
                  {
                    backgroundColor: isDark
                      ? 'rgba(52, 199, 89, 0.12)'
                      : 'rgba(52, 199, 89, 0.08)',
                    borderColor: isDark
                      ? 'rgba(52, 199, 89, 0.28)'
                      : 'rgba(52, 199, 89, 0.20)',
                  },
                ]}>
                <Sparkles size={13} color={colors.emeraldSafe} />
                <Text style={[styles.cryptoText, { color: colors.emeraldSafe }]}>
                  Digitally Signed &amp; Stamped for Medical Audit
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={[styles.certActions, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={() => setShowCertificate(false)}
                style={({ pressed }) => [
                  styles.certCloseButton,
                  { backgroundColor: colors.emeraldSafe },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}>
                <Text style={styles.certCloseText}>Done</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowCertificate(false);
                  resetToDispatchModal();
                }}
                style={({ pressed }) => [
                  styles.certResetButton,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.08)',
                  },
                  pressed && { opacity: 0.75 },
                ]}>
                <RotateCcw size={13} color={colors.textSecondary} />
                <Text style={[styles.certResetText, { color: colors.textSecondary }]}>
                  Reset Demo for Next Dispatch
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  checklistCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  countPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  stepTexts: {
    flex: 1,
    gap: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  stepSub: {
    fontSize: 10,
  },
  stepStatusPill: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepStatusText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  completionContainer: {
    gap: 6,
  },
  handoffButton: {
    height: 50,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  handoffButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  handoffButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  certCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 14,
  },
  certHeader: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  certShieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certHeaderText: {
    flex: 1,
  },
  certTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: -0.2,
  },
  certSub: {
    color: '#ECFDF5',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  certBody: {
    padding: 14,
    gap: 6,
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 5,
  },
  certKey: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  certVal: {
    fontSize: 10,
    fontWeight: '500',
  },
  certValBold: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  certValHighlight: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  certValMono: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  cryptoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    gap: 6,
  },
  cryptoText: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  certActions: {
    padding: 12,
    gap: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  certCloseButton: {
    height: 46,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  certCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  certResetButton: {
    height: 38,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  certResetText: {
    fontWeight: '600',
    fontSize: 10,
  },
  resetFlowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 2,
  },
  resetFlowText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
