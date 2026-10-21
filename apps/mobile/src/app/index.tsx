import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { BellRing } from 'lucide-react-native';

import { useMission } from '@/context/MissionContext';
import { NavigationMap } from '@/components/NavigationMap';
import { BiologicalViabilityCard } from '@/components/BiologicalViabilityCard';
import { IncomingDispatchModal } from '@/components/IncomingDispatchModal';
import { ExcursionBanner } from '@/components/ExcursionBanner';

export default function MissionScreen() {
  const { status, acceptMission, excursionFlag, colors, isDark } = useMission();
  const [showSimulatedPushModal, setShowSimulatedPushModal] = useState(false);

  const isModalVisible = status === 'pending_dispatch' || showSimulatedPushModal;

  const handleAccept = () => {
    acceptMission();
    setShowSimulatedPushModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Critical Excursion Banner Alert if triggered */}
      {excursionFlag && (
        <View style={styles.alertBannerWrapper}>
          <ExcursionBanner />
        </View>
      )}

      {/* TOP 60% OF VIEWPORT: Live Navigation Map */}
      <View style={styles.mapSection}>
        <NavigationMap />

        {/* Floating Quick Simulator Toolbar */}
        <View style={styles.floatingToolbar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Simulate Incoming Web Dispatch"
            onPress={() => setShowSimulatedPushModal(true)}
            style={[
              styles.demoPushPill,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
              },
            ]}>
            <BellRing size={11} color={colors.cobaltBlue} />
            <Text style={[styles.demoPushText, { color: colors.textPrimary }]}>
              TEST INCOMING PUSH DISPATCH
            </Text>
          </Pressable>
        </View>
      </View>

      {/* BOTTOM 40% OF VIEWPORT: Biological Viability & Mission Card */}
      <View style={styles.bottomSheetSection}>
        <BiologicalViabilityCard />
      </View>

      {/* Incoming Dispatch Modal (Push State) */}
      <IncomingDispatchModal
        visible={isModalVisible}
        onAccept={handleAccept}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  alertBannerWrapper: {
    paddingHorizontal: 12,
    zIndex: 20,
  },
  mapSection: {
    flex: 6, // 60% of viewport
    position: 'relative',
  },
  floatingToolbar: {
    position: 'absolute',
    bottom: 46,
    left: 12,
    zIndex: 10,
  },
  demoPushPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoPushText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomSheetSection: {
    flex: 4, // 40% of viewport
  },
});
