import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShieldCheck, Truck, Navigation, X } from 'lucide-react-native';

import { useMission } from '@/context/MissionContext';
import { NavigationMap } from '@/components/NavigationMap';
import { BiologicalViabilityCard } from '@/components/BiologicalViabilityCard';
import { IncomingDispatchModal } from '@/components/IncomingDispatchModal';
import { ExcursionBanner } from '@/components/ExcursionBanner';

export default function MissionScreen() {
  const {
    status,
    acceptMission,
    excursionFlag,
    colors,
    isDark,
    incomingAssignmentAlert,
    dismissAssignmentAlert,
    assignedDriverName,
    courierId,
  } = useMission();
  const [showSimulatedPushModal, setShowSimulatedPushModal] = useState(false);

  const isModalVisible = showSimulatedPushModal || status === 'pending_dispatch';

  const handleAccept = () => {
    acceptMission();
    setShowSimulatedPushModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 1. Real-time Emergency Dispatch Assignment Banner */}
      {incomingAssignmentAlert && (
        <View style={styles.assignmentBannerWrapper}>
          <View
            style={[
              styles.assignmentBanner,
              {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(239, 246, 255, 0.96)',
                borderColor: colors.cobaltBlue,
              },
            ]}>
            <View style={[styles.bannerIcon, { backgroundColor: colors.cobaltBlue }]}>
              <Truck size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
                  {incomingAssignmentAlert.title}
                </Text>
                <View style={styles.livePulse}>
                  <Text style={styles.livePulseText}>SYNCED</Text>
                </View>
              </View>
              <Text style={[styles.bannerText, { color: colors.textPrimary }]} numberOfLines={1}>
                {incomingAssignmentAlert.origin} ➔ {incomingAssignmentAlert.destination}
              </Text>
              <Text style={[styles.bannerSub, { color: colors.textMuted }]}>
                Payload: {incomingAssignmentAlert.units} Units {incomingAssignmentAlert.resource} &bull; Dijkstra:{' '}
                {incomingAssignmentAlert.distanceKm} km (~{incomingAssignmentAlert.etaMinutes} mins)
              </Text>
            </View>
            <Pressable
              onPress={dismissAssignmentAlert}
              style={({ pressed }) => [
                styles.dismissBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' },
                pressed && { opacity: 0.7 },
              ]}>
              <X size={16} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      )}

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
  assignmentBannerWrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 25,
  },
  assignmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  livePulse: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  livePulseText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  bannerSub: {
    fontSize: 10,
    marginTop: 2,
  },
  dismissBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
