import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  TextInput,
  Vibration,
  Platform,
} from 'react-native';
import {
  Flashlight,
  FlashlightOff,
  Crosshair,
  ScanLine,
  CheckCircle2,
  Camera,
  SwitchCamera,
  Keyboard,
  Sparkles,
  AlertCircle,
} from 'lucide-react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
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

  // Camera & Hardware Controls
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [useVirtualCamera, setUseVirtualCamera] = useState(false);

  // Scanning State
  const [scannedFeedback, setScannedFeedback] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const isCoolingDown = useRef(false);

  // Animated Laser Beam
  const laserAnim = useRef(new Animated.Value(0)).current;

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

  // Handle Barcode Scanned Event from CameraView
  const handleBarcodeScanned = (result: { data: string; type?: string }) => {
    if (scannedFeedback || isCoolingDown.current) return;
    const code = result?.data?.trim();
    if (!code) return;

    isCoolingDown.current = true;
    try {
      Vibration.vibrate(80);
    } catch {}

    setScannedFeedback(true);
    setLastScannedCode(code);

    setTimeout(() => {
      setScannedFeedback(false);
      onScanDetected(code);
      setTimeout(() => {
        isCoolingDown.current = false;
      }, 1200);
    }, 600);
  };

  // Quick 1-Tap Sample Scan (for testing without a printed barcode)
  const handleQuickSampleScan = () => {
    const sampleCode =
      currentStep === 1
        ? `BATCH-O-NEG-${Math.floor(1000 + Math.random() * 9000)}`
        : currentStep === 2
        ? `SEAL-VALID-${Math.floor(1000 + Math.random() * 9000)}`
        : `EMP-APOLLO-${Math.floor(1000 + Math.random() * 9000)}`;

    handleBarcodeScanned({ data: sampleCode });
  };

  // Submit Manually Entered Barcode String
  const handleManualSubmit = () => {
    const code = manualCodeInput.trim();
    if (!code) return;
    handleBarcodeScanned({ data: code });
    setManualCodeInput('');
    setShowManualInput(false);
  };

  const isCameraReady = permission?.granted && !useVirtualCamera;

  return (
    <View
      style={[
        styles.scannerCard,
        {
          backgroundColor: isDark ? 'rgba(20, 21, 26, 0.95)' : 'rgba(15, 23, 42, 0.95)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}>
      {/* Top Header Row inside Viewfinder: Target Pill + Torch + Camera Flip */}
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

        {/* Action Controls: Torch Toggle & Camera Switch */}
        <View style={styles.headerButtonsGroup}>
          {/* Torch / Flashlight Toggle */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={torchOn ? 'Turn Off Torch' : 'Turn On Torch'}
            onPress={() => setTorchOn(!torchOn)}
            style={({ pressed }) => [
              styles.controlCircle,
              {
                backgroundColor: torchOn ? '#FFD60A' : 'rgba(255, 255, 255, 0.15)',
              },
              pressed && { opacity: 0.75, transform: [{ scale: 0.94 }] },
            ]}>
            {torchOn ? (
              <Flashlight size={16} color="#000000" strokeWidth={2.5} />
            ) : (
              <FlashlightOff size={16} color="#FFFFFF" strokeWidth={2.2} />
            )}
          </Pressable>

          {/* Camera Lens Flip (Front / Back) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Flip Camera Lens"
            onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
            style={({ pressed }) => [
              styles.controlCircle,
              { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
              pressed && { opacity: 0.75, transform: [{ scale: 0.94 }] },
            ]}>
            <SwitchCamera size={16} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      {/* Center Viewport: Real Camera Feed OR Permission Request Card */}
      <View style={styles.viewportContainer}>
        <View
          style={[
            styles.reticleFrame,
            {
              borderColor: scannedFeedback ? colors.emeraldSafe : 'rgba(255, 255, 255, 0.25)',
              backgroundColor: scannedFeedback
                ? 'rgba(52, 199, 89, 0.16)'
                : 'rgba(0, 0, 0, 0.70)',
            },
          ]}>
          {/* Real CameraView Component */}
          {isCameraReady ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing={facing}
              enableTorch={torchOn}
              barcodeScannerSettings={{
                barcodeTypes: [
                  'qr',
                  'code128',
                  'ean13',
                  'ean8',
                  'code39',
                  'upc_a',
                  'upc_e',
                  'datamatrix',
                  'pdf417',
                ],
              }}
              onBarcodeScanned={scannedFeedback ? undefined : handleBarcodeScanned}
            />
          ) : (
            /* Permission Prompt or Virtual Viewfinder */
            <View style={styles.permissionPlaceholder}>
              <Camera size={26} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
              <Text style={styles.permissionTitle}>Camera Viewfinder</Text>
              {!permission?.granted && !useVirtualCamera ? (
                <View style={styles.permissionActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Enable Device Camera"
                    onPress={requestPermission}
                    style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Enable Camera</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setUseVirtualCamera(true)}
                    style={styles.virtualModeButton}>
                    <Text style={styles.virtualModeText}>Use Without Camera</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.permissionHint}>Point camera at barcode or tap test scan</Text>
              )}
            </View>
          )}

          {/* Torch Flashlight Illuminator Beam Effect */}
          {torchOn && <View style={styles.torchBeamOverlay} pointerEvents="none" />}

          {/* Apple Vision Corner Brackets */}
          <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />

          {/* Center Crosshair */}
          <View style={styles.centerCrosshair} pointerEvents="none">
            <Crosshair size={22} color="rgba(255, 255, 255, 0.25)" />
          </View>

          {/* Animated Laser Beam */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.laserBeam,
              {
                transform: [{ translateY: laserAnim }],
                backgroundColor: scannedFeedback ? colors.emeraldSafe : colors.cobaltBlue,
                shadowColor: scannedFeedback ? colors.emeraldSafe : colors.cobaltBlue,
              },
            ]}
          />

          {/* Verified Success Overlay */}
          {scannedFeedback && (
            <View style={styles.verifiedOverlay}>
              <CheckCircle2 size={36} color={colors.emeraldSafe} strokeWidth={2.8} />
              <Text style={[styles.verifiedText, { color: colors.emeraldSafe }]}>
                Verified ✓
              </Text>
              {lastScannedCode && (
                <Text style={styles.scannedCodeBadge} numberOfLines={1}>
                  {lastScannedCode}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Manual Code Input Drawer / Quick Actions */}
      {showManualInput ? (
        <View style={styles.manualInputCard}>
          <View style={styles.manualInputRow}>
            <TextInput
              style={[
                styles.manualTextInput,
                {
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.20)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              ]}
              placeholder="Type barcode/seal/badge ID..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={manualCodeInput}
              onChangeText={setManualCodeInput}
              autoCapitalize="characters"
              autoFocus
            />
            <Pressable
              onPress={handleManualSubmit}
              style={[styles.manualSubmitButton, { backgroundColor: colors.cobaltBlue }]}>
              <Text style={styles.manualSubmitText}>Verify</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => setShowManualInput(false)}
            style={styles.cancelManualButton}>
            <Text style={styles.cancelManualText}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        /* Action Buttons Row */
        <View style={styles.bottomInstructionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quick Verify Step"
            onPress={handleQuickSampleScan}
            style={({ pressed }) => [
              styles.scanButton,
              { backgroundColor: colors.cobaltBlue },
              pressed && styles.scanButtonPressed,
            ]}>
            <ScanLine size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.scanButtonText}>
              Align &amp; Scan / Test Current Step
            </Text>
          </Pressable>

          {/* Toggle Manual Input */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter Barcode Manually"
            onPress={() => setShowManualInput(true)}
            style={({ pressed }) => [
              styles.manualToggleRow,
              pressed && { opacity: 0.7 },
            ]}>
            <Keyboard size={12} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.manualToggleText}>
              Manual Code Entry (If Label Damaged)
            </Text>
          </Pressable>
        </View>
      )}
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
    paddingVertical: 5,
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
  headerButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewportContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  reticleFrame: {
    width: '100%',
    maxWidth: 320,
    height: 180,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 6,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  permissionActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  permissionButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  virtualModeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  virtualModeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '500',
  },
  permissionHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  torchBeamOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 240, 180, 0.22)',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#FFFFFF',
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
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
    left: 12,
    right: 12,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 6,
    elevation: 4,
  },
  verifiedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    padding: 10,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scannedCodeBadge: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontSize: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  bottomInstructionRow: {
    alignItems: 'center',
    gap: 8,
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  manualToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  manualToggleText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10.5,
    fontWeight: '500',
  },
  manualInputCard: {
    gap: 6,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  manualTextInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  manualSubmitButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualSubmitText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cancelManualButton: {
    alignSelf: 'center',
    paddingVertical: 3,
  },
  cancelManualText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
  },
});
