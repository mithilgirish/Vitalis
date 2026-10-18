import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import {
  Flashlight,
  FlashlightOff,
  Crosshair,
  ScanLine,
  CheckCircle2,
} from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

interface BarcodeScannerReticleProps {
  currentStep: 1 | 2 | 3;
  targetLabel: string;
  onScanDetected: (code: string) => void;
}

export const BarcodeScannerReticle: React.FC<BarcodeScannerReticleProps> = ({
  currentStep,
  targetLabel,
  onScanDetected,
}) => {
  const { colors, isDark } = useMission();
  const [torchOn, setTorchOn] = useState(false);
  const [scannedFeedback, setScannedFeedback] = useState(false);

  const laserAnim = useRef(new Animated.Value(0)).current;

  // Animated laser scan sweep
  useEffect(() => {
    const laserLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 190,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    laserLoop.start();
    return () => laserLoop.stop();
  }, [laserAnim]);

  const handleSimulateScan = () => {
    setScannedFeedback(true);
    const mockCode =
      currentStep === 1
        ? 'BATCH-O-NEG-9842'
        : currentStep === 2
        ? 'SEAL-VALID-4029'
        : 'EMP-APOLLO-9041';

    setTimeout(() => {
      setScannedFeedback(false);
      onScanDetected(mockCode);
    }, 600);
  };

  return (
    <View
      style={[
        styles.viewfinderContainer,
        {
          backgroundColor: isDark ? '#0F1116' : '#E2E8F0',
          borderColor: colors.border,
        },
      ]}>
      {/* Darkened Mask Vignette */}
      <View
        style={[
          styles.maskTop,
          { backgroundColor: isDark ? 'rgba(15, 17, 22, 0.75)' : 'rgba(15, 23, 42, 0.45)' },
        ]}
      />
      <View style={styles.maskMiddle}>
        <View
          style={[
            styles.maskSide,
            { backgroundColor: isDark ? 'rgba(15, 17, 22, 0.75)' : 'rgba(15, 23, 42, 0.45)' },
          ]}
        />

        {/* Clean Rounded Square Targeting Reticle (230x230) */}
        <View
          style={[
            styles.reticle,
            {
              borderColor: scannedFeedback ? colors.emeraldSafe : 'rgba(255, 255, 255, 0.4)',
              backgroundColor: scannedFeedback
                ? colors.emeraldSafeBg
                : isDark
                ? 'rgba(26, 29, 36, 0.35)'
                : 'rgba(255, 255, 255, 0.25)',
            },
          ]}>
          {/* Corner Targeting Brackets */}
          <View style={[styles.cornerBracket, styles.bracketTL, { borderColor: colors.esiCrimson }]} />
          <View style={[styles.cornerBracket, styles.bracketTR, { borderColor: colors.esiCrimson }]} />
          <View style={[styles.cornerBracket, styles.bracketBL, { borderColor: colors.esiCrimson }]} />
          <View style={[styles.cornerBracket, styles.bracketBR, { borderColor: colors.esiCrimson }]} />

          {/* Center Crosshair */}
          <View style={styles.crosshair}>
            <Crosshair size={26} color="rgba(255, 255, 255, 0.3)" />
          </View>

          {/* Animated Laser Scan Line */}
          <Animated.View
            style={[
              styles.laserLine,
              {
                transform: [{ translateY: laserAnim }],
                backgroundColor: scannedFeedback ? colors.emeraldSafe : colors.esiCrimson,
                shadowColor: scannedFeedback ? colors.emeraldSafe : colors.esiCrimson,
              },
            ]}
          />

          {/* Scanned Success Overlay */}
          {scannedFeedback && (
            <View style={styles.scannedOverlay}>
              <CheckCircle2 size={44} color={colors.emeraldSafe} />
              <Text style={styles.scannedText}>BARCODE VERIFIED</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.maskSide,
            { backgroundColor: isDark ? 'rgba(15, 17, 22, 0.75)' : 'rgba(15, 23, 42, 0.45)' },
          ]}
        />
      </View>
      <View
        style={[
          styles.maskBottom,
          { backgroundColor: isDark ? 'rgba(15, 17, 22, 0.75)' : 'rgba(15, 23, 42, 0.45)' },
        ]}
      />

      {/* Floating Target Label Card */}
      <View
        style={[
          styles.floatingTargetBadge,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.cobaltBlue,
          },
        ]}>
        <View style={[styles.stepCircle, { backgroundColor: colors.cobaltBlue }]}>
          <Text style={styles.stepNum}>{currentStep}</Text>
        </View>
        <View style={styles.targetTexts}>
          <Text style={[styles.targetHeader, { color: colors.cobaltBlue }]}>
            TARGET ACQUISITION (STEP {currentStep}/3)
          </Text>
          <Text style={[styles.targetLabelText, { color: colors.textPrimary }]}>
            {targetLabel}
          </Text>
        </View>
      </View>

      {/* Floating Controls: Torch Toggle & Simulate Scan Button (56px Target) */}
      <View style={styles.floatingControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle Torch"
          onPress={() => setTorchOn(!torchOn)}
          style={[
            styles.torchButton,
            {
              backgroundColor: torchOn ? '#FACC15' : colors.bgCard,
              borderColor: colors.border,
            },
          ]}>
          {torchOn ? (
            <Flashlight size={20} color="#000000" />
          ) : (
            <FlashlightOff size={20} color={colors.textPrimary} />
          )}
          <Text
            style={[
              styles.torchText,
              { color: torchOn ? '#000000' : colors.textPrimary },
            ]}>
            {torchOn ? 'ON' : 'TORCH'}
          </Text>
        </Pressable>

        {/* 56px+ Touch Target Scan Simulator */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trigger Barcode Scan"
          onPress={handleSimulateScan}
          style={({ pressed }) => [
            styles.scanTriggerButton,
            { backgroundColor: colors.esiCrimson },
            pressed && styles.scanTriggerButtonPressed,
          ]}>
          <ScanLine size={22} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.scanTriggerText}>ALIGN &amp; SCAN CODE</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewfinderContainer: {
    height: 310,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: ERGONOMICS.radiusLg,
    borderWidth: 1,
  },
  maskTop: {
    height: 32,
  },
  maskMiddle: {
    height: 230,
    flexDirection: 'row',
  },
  maskSide: {
    flex: 1,
  },
  reticle: {
    width: 230,
    height: 230,
    borderRadius: 18,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  bracketTL: {
    top: 5,
    left: 5,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  bracketTR: {
    top: 5,
    right: 5,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bracketBL: {
    bottom: 5,
    left: 5,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bracketBR: {
    bottom: 5,
    right: 5,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  crosshair: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2.2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    gap: 6,
  },
  scannedText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  maskBottom: {
    flex: 1,
  },
  floatingTargetBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    borderRadius: ERGONOMICS.radiusMd,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  targetTexts: {
    flex: 1,
  },
  targetHeader: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  targetLabelText: {
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 1,
  },
  floatingControls: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  torchButton: {
    height: ERGONOMICS.buttonHeight,
    paddingHorizontal: 12,
    borderRadius: ERGONOMICS.radiusMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
  },
  torchText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  scanTriggerButton: {
    flex: 1,
    height: ERGONOMICS.buttonHeight, // Minimum 56px touch target
    borderRadius: ERGONOMICS.radiusMd,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanTriggerButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  scanTriggerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
