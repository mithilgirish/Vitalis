import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { BarcodeScannerReticle } from '@/components/BarcodeScannerReticle';
import { CustodyChecklist } from '@/components/CustodyChecklist';
import { ExcursionBanner } from '@/components/ExcursionBanner';
import { useMission } from '@/context/MissionContext';

export default function ScannerScreen() {
  const { step1, step2, step3, completeCustodyStep, colors } = useMission();

  const getInitialStep = (): 1 | 2 | 3 => {
    if (!step1.completed) return 1;
    if (!step2.completed) return 2;
    return 3;
  };

  const [activeScanStep, setActiveScanStep] = useState<1 | 2 | 3>(getInitialStep());

  // Automatically update active step when steps change or reset
  useEffect(() => {
    if (!step1.completed) setActiveScanStep(1);
    else if (!step2.completed) setActiveScanStep(2);
    else if (!step3.completed) setActiveScanStep(3);
  }, [step1.completed, step2.completed, step3.completed]);

  const getTargetLabel = (step: 1 | 2 | 3): string => {
    switch (step) {
      case 1:
        return 'Scan Origin Blood Batch Barcode';
      case 2:
        return 'Scan Cold-Box Security Seal QR';
      case 3:
        return 'Scan Apollo ER Physician ID Badge';
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

      {/* APPLE CODE SCANNER VIEWFINDER */}
      <View style={styles.viewfinderSection}>
        <BarcodeScannerReticle
          currentStep={activeScanStep}
          targetLabel={getTargetLabel(activeScanStep)}
          onScanDetected={handleScanDetected}
        />
      </View>

      {/* APPLE INSET GROUPED VERIFICATION CHECKLIST */}
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
    padding: 14,
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
