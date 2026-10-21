import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { useMission } from '@/context/MissionContext';
import { NavigationMap } from '@/components/NavigationMap';
import { BiologicalViabilityCard } from '@/components/BiologicalViabilityCard';
import { IncomingDispatchModal } from '@/components/IncomingDispatchModal';
import { ExcursionBanner } from '@/components/ExcursionBanner';

export default function MissionScreen() {
  const { status, acceptMission, excursionFlag, colors } = useMission();
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

      {/* TOP: Immersive Live Navigation Map */}
      <View style={styles.mapSection}>
        <NavigationMap />
      </View>

      {/* BOTTOM: Ergonomic Apple Maps Biological Viability Sheet */}
      <View style={styles.bottomSheetSection}>
        <BiologicalViabilityCard
          onSimulateDispatch={() => setShowSimulatedPushModal(true)}
        />
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
    flex: 6,
    position: 'relative',
  },
  bottomSheetSection: {
    flex: 4,
  },
});
