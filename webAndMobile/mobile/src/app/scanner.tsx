import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { BarcodeScannerReticle } from '@/components/BarcodeScannerReticle';
import { CustodyChecklist } from '@/components/CustodyChecklist';
import { ExcursionBanner } from '@/components/ExcursionBanner';
import { useMission } from '@/context/MissionContext';

export default function ScannerScreen() {
  const { step1, step2, completeCustodyStep, colors } = useMission();

  const getInitialStep = (): 1 | 2 | 3 => {
    if (!step1.completed) return 1;
    if (!step2.completed) return 2;
    return 3;
  };

  const [activeScanStep, setActiveScanStep] = useState<1 | 2 | 3>(getInitialStep());

  const getTargetLabel = (step: 1 | 2 | 3): string => {
    switch (step) {
      case 1:
        return 'Origin Blood Bank Batch Barcode (Batch UUID & O- PRBC)';
      case 2:
        return 'Cold-Box Security Seal QR & Temperature Verification';
      case 3:
        return 'Apollo Greams ER Receiving Physician ID Badge';
    }
  };

  const handleScanDetected = (scannedCode: string) => {
    completeCustodyStep(activeScanStep, {
      batchId: scannedCode,
      sealId: scannedCode,
      staffId: scannedCode,
    });

    if (activeScanStep === 1) setActiveScanStep(2);
    else if (activeScanStep === 2) setActiveScanStep(3);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Excursion Banner if alarm active */}
      <ExcursionBanner />

      {/* CAMERA VIEWFINDER: Full-screen scanner interface with targeting reticle and animated laser scan line */}
      <View style={styles.viewfinderSection}>
        <BarcodeScannerReticle
          currentStep={activeScanStep}
          targetLabel={getTargetLabel(activeScanStep)}
          onScanDetected={handleScanDetected}
        />
      </View>

      {/* VERIFICATION CHECKLIST & COMPLETION ACTION */}
      <View style={styles.checklistSection}>
        <CustodyChecklist
          activeScanStep={activeScanStep}
          onSelectStepToScan={(step) => setActiveScanStep(step)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    gap: 12,
    paddingBottom: 28,
  },
  viewfinderSection: {
    width: '100%',
  },
  checklistSection: {
    width: '100%',
  },
});
