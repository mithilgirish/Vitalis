import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import {
  Flashlight,
  FlashlightOff,
  Crosshair,
  ScanLine,
  CheckCircle2,
} from 'lucide-react-native';
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

  // Smooth laser sweep
  useEffect(() => {
    const laserLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 140,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1500,
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
    }, 500);
  };

  return (
    <View
      style={[
        styles.scannerCard,
        {
          backgroundColor: isDark ? 'rgba(20, 21, 26, 0.95)' : 'rgba(15, 23, 42, 0.95)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}>
      {/* Top Header Row inside Viewfinder: Target Pill + Torch Button */}
      <View style={styles.topControlRow}>
        <View
          style={[
            styles.targetPill,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.18)',
              borderColor: 'rgba(255, 255, 255, 0.20)',
            },
          ]}>
          <View style={[styles.stepDot, { backgroundColor: colors.cobaltBlue }]}>
            <Text style={styles.stepDotText}>{currentStep}</Text>
          </View>
          <Text style={styles.targetPillText} numberOfLines={1}>
            {targetLabel}
          </Text>
        </View>

        {/* Circular Torch Toggle */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle Torch"
          onPress={() => setTorchOn(!torchOn)}
          style={({ pressed }) => [
            styles.torchCircle,
            {
              backgroundColor: torchOn
                ? '#FFD60A'
                : 'rgba(255, 255, 255, 0.15)',
            },
            pressed && { opacity: 0.75, transform: [{ scale: 0.94 }] },
          ]}>
          {torchOn ? (
            <Flashlight size={16} color="#000000" strokeWidth={2.4} />
          ) : (
            <FlashlightOff size={16} color="#FFFFFF" strokeWidth={2.2} />
          )}
        </Pressable>
      </View>

      {/* Center Apple-style Code Reticle Viewport */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tap to Scan Code"
        onPress={handleSimulateScan}
        style={styles.reticleTouchArea}>
        <View
          style={[
            styles.reticleFrame,
            {
              borderColor: scannedFeedback ? colors.emeraldSafe : 'rgba(255, 255, 255, 0.25)',
              backgroundColor: scannedFeedback
                ? 'rgba(52, 199, 89, 0.16)'
                : 'rgba(255, 255, 255, 0.04)',
            },
          ]}>
          {/* Apple Vision Corner Brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Center Crosshair */}
          <View style={styles.centerCrosshair}>
            <Crosshair size={22} color="rgba(255, 255, 255, 0.20)" />
          </View>

          {/* Animated Laser Beam */}
          <Animated.View
            style={[
              styles.laserBeam,
              {
                transform: [{ translateY: laserAnim }],
                backgroundColor: scannedFeedback ? colors.emeraldSafe : colors.cobaltBlue,
                shadowColor: scannedFeedback ? colors.emeraldSafe : colors.cobaltBlue,
              },
            ]}
          />

          {/* Success Overlay */}
          {scannedFeedback && (
            <View style={styles.verifiedOverlay}>
              <CheckCircle2 size={36} color={colors.emeraldSafe} strokeWidth={2.8} />
              <Text style={[styles.verifiedText, { color: colors.emeraldSafe }]}>
                Verified ✓
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Bottom Hint & Action */}
      <View style={styles.bottomInstructionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trigger Barcode Scan"
          onPress={handleSimulateScan}
          style={({ pressed }) => [
            styles.scanButton,
            { backgroundColor: colors.cobaltBlue },
            pressed && styles.scanButtonPressed,
          ]}>
          <ScanLine size={17} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.scanButtonText}>
            Align &amp; Tap to Scan
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scannerCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  targetPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  targetPillText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  torchCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  reticleFrame: {
    width: 220,
    height: 160,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF',
  },
  bracketTL: {
    top: 5,
    left: 5,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 6,
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 6,
  },
  centerCrosshair: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserBeam: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  verifiedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomInstructionRow: {
    alignItems: 'center',
  },
  scanButton: {
    width: '100%',
    height: 44,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
