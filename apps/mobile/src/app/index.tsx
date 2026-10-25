import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Truck, X, Minimize2, ShieldCheck } from 'lucide-react-native';

import { useMission, formatArrivalTime } from '@/context/MissionContext';
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
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    destination,
    distanceKm,
    etaSeconds,
  } = useMission();

  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const isModalVisible = isDispatchModalOpen || status === 'pending_dispatch';

  const handleAccept = () => {
    acceptMission();
    setIsDispatchModalOpen(false);
  };

  const etaMinutes = Math.max(1, Math.round(etaSeconds / 60));
  const arrivalFormatted = formatArrivalTime(etaMinutes);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 1. Real-time Emergency Dispatch Assignment Banner */}
      {!isMapFullscreen && incomingAssignmentAlert && (
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
            <Pressable
              onPress={() => setIsDispatchModalOpen(true)}
              style={{ flex: 1, paddingRight: 8 }}>
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
                Payload: {incomingAssignmentAlert.units} Units {incomingAssignmentAlert.resource} &bull; TomTom:{' '}
                {incomingAssignmentAlert.distanceKm} km (~{incomingAssignmentAlert.etaMinutes} mins)
              </Text>
            </Pressable>
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
      {!isMapFullscreen && excursionFlag && (
        <View style={styles.alertBannerWrapper}>
          <ExcursionBanner />
        </View>
      )}

      {/* TOP: Immersive Live Navigation Map (Supports Normal & Fullscreen Mode) */}
      <View style={[styles.mapSection, isMapFullscreen && styles.mapSectionFullscreen]}>
        <NavigationMap
          isFullscreen={isMapFullscreen}
          onToggleFullscreen={() => setIsMapFullscreen((prev) => !prev)}
        />
      </View>

      {/* BOTTOM: Standard Biological Viability Sheet OR Fullscreen Apple Floating Dock */}
      {!isMapFullscreen ? (
        <View style={styles.bottomSheetSection}>
          <BiologicalViabilityCard onExpandMap={() => setIsMapFullscreen(true)} />
        </View>
      ) : (
        <View style={styles.fullscreenMiniDockWrapper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Restore split view"
            onPress={() => setIsMapFullscreen(false)}
            style={({ pressed }) => [
              styles.fullscreenMiniDock,
              {
                backgroundColor: isDark ? 'rgba(24, 25, 30, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}>
            <View style={styles.miniDockLeft}>
              <View style={[styles.miniEtaBadge, { backgroundColor: colors.cobaltBlue }]}>
                <Text style={styles.miniEtaNumber}>{etaMinutes}</Text>
                <Text style={styles.miniEtaUnit}>min</Text>
              </View>
              <View style={styles.miniDetails}>
                <Text style={[styles.miniDestText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {destination}
                </Text>
                <Text style={[styles.miniSubText, { color: colors.textMuted }]}>
                  {distanceKm.toFixed(1)} km &bull; {arrivalFormatted} arrival
                </Text>
              </View>
            </View>

            <View style={styles.miniDockRight}>
              <View
                style={[
                  styles.miniSafeBadge,
                  excursionFlag
                    ? { backgroundColor: colors.redAlarm }
                    : {
                        backgroundColor: isDark
                          ? 'rgba(52, 199, 89, 0.15)'
                          : 'rgba(52, 199, 89, 0.12)',
                      },
                ]}>
                <ShieldCheck
                  size={13}
                  color={excursionFlag ? '#FFFFFF' : colors.emeraldSafe}
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.miniSafeText,
                    { color: excursionFlag ? '#FFFFFF' : colors.emeraldSafe },
                  ]}>
                  {excursionFlag ? 'ALARM' : '3.8°C Safe'}
                </Text>
              </View>

              <View
                style={[
                  styles.exitIconPill,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)' },
                ]}>
                <Minimize2 size={15} color={colors.textPrimary} strokeWidth={2.2} />
              </View>
            </View>
          </Pressable>
        </View>
      )}

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
    flex: 5.5,
    position: 'relative',
  },
  mapSectionFullscreen: {
    flex: 1,
  },
  bottomSheetSection: {
    flex: 4.5,
  },
  fullscreenMiniDockWrapper: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    zIndex: 30,
  },
  fullscreenMiniDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  miniDockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  miniEtaBadge: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  miniEtaNumber: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  miniEtaUnit: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '700',
  },
  miniDetails: {
    flex: 1,
  },
  miniDestText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  miniSubText: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  miniDockRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  miniSafeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  miniSafeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  exitIconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
