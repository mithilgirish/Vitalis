import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import {
  CheckCircle2,
  QrCode,
  ShieldCheck,
  UserCheck,
  FileCheck,
  ChevronRight,
  RotateCcw,
} from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

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

  return (
    <View style={styles.container}>
      {/* Verification Checklist Title */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <FileCheck size={14} color={colors.cobaltBlue} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            CHAIN-OF-CUSTODY VERIFICATION
          </Text>
        </View>
        <Text style={[styles.statusCount, { color: colors.emeraldSafe }]}>
          {Number(step1.completed) + Number(step2.completed) + Number(step3.completed)} / 3 VERIFIED
        </Text>
      </View>

      {/* STEP 1: Scan Origin Blood Bank Batch Barcode */}
      <Pressable
        onPress={() => onSelectStepToScan(1)}
        style={[
          styles.stepCard,
          {
            backgroundColor: colors.bgCardElevated,
            borderColor: activeScanStep === 1 ? colors.cobaltBlue : colors.border,
          },
          step1.completed && { borderColor: colors.emeraldSafe },
        ]}>
        <View style={styles.stepLeft}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: step1.completed ? colors.emeraldSafe : colors.bgSurface,
              },
            ]}>
            {step1.completed ? (
              <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <QrCode size={16} color={colors.textMuted} />
            )}
          </View>
          <View style={styles.stepInfo}>
            <View style={styles.stepHeaderLine}>
              <Text style={[styles.stepNumLabel, { color: colors.cobaltBlue }]}>STEP 1</Text>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                Origin Blood Bank Batch Barcode
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Verifies Batch UUID &amp; O- PRBC match with web dispatch record.
            </Text>
            {step1.completed && (
              <View
                style={[
                  styles.verifiedMetaBox,
                  {
                    backgroundColor: colors.emeraldSafeBg,
                    borderColor: colors.emeraldSafe,
                  },
                ]}>
                <Text style={[styles.verifiedBadgeText, { color: colors.emeraldSafe }]}>
                  MATCH VERIFIED: <Text style={[styles.monoHighlight, { color: colors.textPrimary }]}>{step1.verifiedData}</Text>
                </Text>
                <Text style={[styles.verifiedSubText, { color: colors.textSecondary }]}>
                  Cargo: {step1.metadata?.cargo} • {step1.timestamp}
                </Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight
          size={16}
          color={activeScanStep === 1 ? colors.cobaltBlue : colors.textMuted}
        />
      </Pressable>

      {/* STEP 2: Confirm Cold-Box Seal & Pickup Temperature (<= 6.0°C) */}
      <Pressable
        onPress={() => onSelectStepToScan(2)}
        style={[
          styles.stepCard,
          {
            backgroundColor: colors.bgCardElevated,
            borderColor: activeScanStep === 2 ? colors.cobaltBlue : colors.border,
          },
          step2.completed && { borderColor: colors.emeraldSafe },
        ]}>
        <View style={styles.stepLeft}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: step2.completed ? colors.emeraldSafe : colors.bgSurface,
              },
            ]}>
            {step2.completed ? (
              <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <ShieldCheck size={16} color={colors.textMuted} />
            )}
          </View>
          <View style={styles.stepInfo}>
            <View style={styles.stepHeaderLine}>
              <Text style={[styles.stepNumLabel, { color: colors.cobaltBlue }]}>STEP 2</Text>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                Cold-Box Seal &amp; Pickup Temp (&le; 6.0°C)
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Tamper-evident barcode integrity check and thermal envelope audit.
            </Text>
            {step2.completed && (
              <View
                style={[
                  styles.verifiedMetaBox,
                  {
                    backgroundColor: colors.emeraldSafeBg,
                    borderColor: colors.emeraldSafe,
                  },
                ]}>
                <Text style={[styles.verifiedBadgeText, { color: colors.emeraldSafe }]}>
                  SEAL INTACT: <Text style={[styles.monoHighlight, { color: colors.textPrimary }]}>{step2.verifiedData}</Text>
                </Text>
                <Text style={[styles.verifiedSubText, { color: colors.textSecondary }]}>
                  Temp: {step2.metadata?.pickupTemp} • {step2.timestamp}
                </Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight
          size={16}
          color={activeScanStep === 2 ? colors.cobaltBlue : colors.textMuted}
        />
      </Pressable>

      {/* STEP 3: Scan Receiving ER Nurse/Doctor ID Badge at Destination */}
      <Pressable
        onPress={() => onSelectStepToScan(3)}
        style={[
          styles.stepCard,
          {
            backgroundColor: colors.bgCardElevated,
            borderColor: activeScanStep === 3 ? colors.cobaltBlue : colors.border,
          },
          step3.completed && { borderColor: colors.emeraldSafe },
        ]}>
        <View style={styles.stepLeft}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: step3.completed ? colors.emeraldSafe : colors.bgSurface,
              },
            ]}>
            {step3.completed ? (
              <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <UserCheck size={16} color={colors.textMuted} />
            )}
          </View>
          <View style={styles.stepInfo}>
            <View style={styles.stepHeaderLine}>
              <Text style={[styles.stepNumLabel, { color: colors.cobaltBlue }]}>STEP 3</Text>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                Receiving ER Physician ID Badge
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Scan staff badge at Apollo Greams Rd Trauma Dept for legal transfer.
            </Text>
            {step3.completed ? (
              <View
                style={[
                  styles.verifiedMetaBox,
                  {
                    backgroundColor: colors.emeraldSafeBg,
                    borderColor: colors.emeraldSafe,
                  },
                ]}>
                <Text style={[styles.verifiedBadgeText, { color: colors.emeraldSafe }]}>
                  PHYSICIAN VERIFIED: <Text style={[styles.monoHighlight, { color: colors.textPrimary }]}>{step3.verifiedData}</Text>
                </Text>
                <Text style={[styles.verifiedSubText, { color: colors.textSecondary }]}>
                  {step3.metadata?.recipientName} ({step3.metadata?.role}) • {step3.timestamp}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.pendingActionPill,
                  {
                    backgroundColor: colors.cobaltBlueBg,
                    borderColor: colors.cobaltBlue,
                  },
                ]}>
                <Text style={[styles.pendingActionText, { color: colors.cobaltBlue }]}>
                  POINT CAMERA TO SCAN DR. ID BADGE
                </Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight
          size={16}
          color={activeScanStep === 3 ? colors.cobaltBlue : colors.textMuted}
        />
      </Pressable>

      {/* COMPLETION ACTION: "Complete Handoff & Close Mission" (56px+ Touch Target) */}
      <View style={styles.completionContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Complete Handoff & Close Mission"
          disabled={!allCompleted}
          onPress={handleFinishHandoff}
          style={({ pressed }) => [
            styles.handoffButton,
            {
              backgroundColor: isDelivered
                ? colors.cobaltBlue
                : allCompleted
                ? colors.emeraldSafe
                : colors.bgSurface,
            },
            pressed && styles.handoffButtonPressed,
          ]}>
          <ShieldCheck size={22} color="#FFFFFF" strokeWidth={2.5} />
          <Text
            style={[
              styles.handoffButtonText,
              { color: allCompleted || isDelivered ? '#FFFFFF' : colors.textMuted },
            ]}>
            {isDelivered
              ? 'VIEW HANDOFF CERTIFICATE & RECEIPT'
              : allCompleted
              ? 'COMPLETE HANDOFF & CLOSE MISSION'
              : 'COMPLETE ALL 3 VERIFICATION STEPS'}
          </Text>
        </Pressable>

        {isDelivered && (
          <Text style={[styles.deliveredTimestamp, { color: colors.emeraldSafe }]}>
            DELIVERED &amp; SEAL TRANSFERRED AT {deliveredAt}
          </Text>
        )}
      </View>

      {/* DIGITAL HANDOFF CERTIFICATE MODAL */}
      <Modal visible={showCertificate} transparent animationType="slide">
        <View
          style={[
            styles.modalBackdrop,
            { backgroundColor: isDark ? 'rgba(10, 12, 16, 0.92)' : 'rgba(15, 23, 42, 0.65)' },
          ]}>
          <View
            style={[
              styles.certCard,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.emeraldSafe,
              },
            ]}>
            {/* Modal Header */}
            <View style={[styles.certHeader, { backgroundColor: colors.emeraldSafe }]}>
              <View style={styles.certShieldIcon}>
                <ShieldCheck size={26} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.certHeaderText}>
                <Text style={styles.certTitle}>CHAIN-OF-CUSTODY CERTIFICATE</Text>
                <Text style={styles.certSub}>LEGAL MEDICAL DISPATCH HANDOFF COMPLETE</Text>
              </View>
            </View>

            {/* Cert Body */}
            <View style={styles.certBody}>
              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>MISSION ID:</Text>
                <Text style={[styles.certValMono, { color: colors.textPrimary }]}>{missionId}</Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>CARGO TRANSFERRED:</Text>
                <Text style={[styles.certValBold, { color: colors.textPrimary }]}>{cargo}</Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>ORIGIN FACILITY:</Text>
                <Text style={[styles.certVal, { color: colors.textSecondary }]}>{origin}</Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>RECEIVING FACILITY:</Text>
                <Text style={[styles.certValBold, { color: colors.textPrimary }]}>{destination}</Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>RECEIVING DOCTOR:</Text>
                <Text style={[styles.certValHighlight, { color: colors.emeraldSafe }]}>
                  {step3.metadata?.recipientName || 'Dr. Arvind Swaminathan, MD'}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>RECEIVER STAFF ID:</Text>
                <Text style={[styles.certValMono, { color: colors.textPrimary }]}>
                  {step3.verifiedData || 'EMP-APOLLO-9041'}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>COLD-CHAIN AUDIT:</Text>
                <Text
                  style={[
                    styles.certValMono,
                    { color: excursionFlag ? colors.redAlarm : colors.emeraldSafe },
                  ]}>
                  {excursionFlag ? 'EXCURSION LOGGED (7.4°C)' : 'PASS (3.8°C ENVELOPE SAFE)'}
                </Text>
              </View>

              <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.certKey, { color: colors.textMuted }]}>DELIVERY TIMESTAMP:</Text>
                <Text style={[styles.certValMono, { color: colors.textPrimary }]}>
                  {deliveredAt || 'Just Now'}
                </Text>
              </View>

              {/* Cryptographic hash badge */}
              <View
                style={[
                  styles.cryptoBadge,
                  {
                    backgroundColor: colors.bgCardElevated,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={[styles.cryptoLabel, { color: colors.textMuted }]}>
                  SHA-256 AUDIT LOG VERIFICATION HASH
                </Text>
                <Text style={[styles.cryptoHash, { color: colors.cobaltBlue }]}>
                  e8a2f4c91b7d3019a4e09f83bbd7261a84f3299c15e8
                </Text>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={[styles.certActions, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={() => setShowCertificate(false)}
                style={[styles.certCloseButton, { backgroundColor: colors.cobaltBlue }]}>
                <Text style={styles.certCloseText}>CLOSE AUDIT RECEIPT</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowCertificate(false);
                  resetToDispatchModal();
                }}
                style={[
                  styles.certResetButton,
                  {
                    backgroundColor: colors.bgCardElevated,
                    borderColor: colors.border,
                  },
                ]}>
                <RotateCcw size={15} color={colors.textPrimary} />
                <Text style={[styles.certResetText, { color: colors.textPrimary }]}>
                  RESET TO NEW DISPATCH
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
    width: '100%',
    gap: 9,
  },
  header: {
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
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statusCount: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  stepCard: {
    borderRadius: ERGONOMICS.radiusLg,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: {
    flex: 1,
    gap: 2,
  },
  stepHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepNumLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  stepDescription: {
    fontSize: 9.5,
    lineHeight: 13,
  },
  verifiedMetaBox: {
    borderRadius: 5,
    padding: 5,
    marginTop: 3,
    borderWidth: 1,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  monoHighlight: {
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  verifiedSubText: {
    fontSize: 8,
    marginTop: 2,
  },
  pendingActionPill: {
    alignSelf: 'flex-start',
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    borderRadius: 4,
    marginTop: 3,
    borderWidth: 1,
  },
  pendingActionText: {
    fontSize: 8,
    fontWeight: '800',
  },
  completionContainer: {
    marginTop: 6,
    gap: 5,
  },
  handoffButton: {
    height: ERGONOMICS.buttonHeight, // Minimum 56px touch target
    borderRadius: ERGONOMICS.radiusMd,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },
  handoffButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  handoffButtonText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  deliveredTimestamp: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  certCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: ERGONOMICS.radiusXl,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  certHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  certShieldIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certHeaderText: {
    flex: 1,
  },
  certTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  certSub: {
    color: '#ECFDF5',
    fontSize: 8.5,
    fontWeight: '800',
    marginTop: 1,
  },
  certBody: {
    padding: 16,
    gap: 8,
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  certKey: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  certVal: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  certValBold: {
    fontSize: 11,
    fontWeight: '800',
  },
  certValHighlight: {
    fontSize: 11,
    fontWeight: '800',
  },
  certValMono: {
    fontFamily: 'monospace',
    fontSize: 10.5,
    fontWeight: '900',
  },
  cryptoBadge: {
    borderRadius: 7,
    padding: 7,
    borderWidth: 1,
    marginTop: 3,
    gap: 2,
  },
  cryptoLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cryptoHash: {
    fontFamily: 'monospace',
    fontSize: 8.5,
  },
  certActions: {
    padding: 14,
    gap: 8,
    borderTopWidth: 1,
  },
  certCloseButton: {
    height: ERGONOMICS.buttonHeight,
    borderRadius: ERGONOMICS.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
  },
  certCloseText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  certResetButton: {
    height: 46,
    borderRadius: ERGONOMICS.radiusMd,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
  },
  certResetText: {
    fontWeight: '800',
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
});
