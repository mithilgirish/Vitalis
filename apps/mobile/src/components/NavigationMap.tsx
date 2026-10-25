import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CornerUpRight, Navigation, Gauge } from 'lucide-react-native';
import { useMission } from '@/context/MissionContext';
import { RealRoadmapView } from './RealRoadmapView';

// Real emergency transit route coordinates (Regional Blood Transfusion Center -> Apollo Greams Rd)
const CHENNAI_ROUTE_COORDS: [number, number][] = [
  [13.0827, 80.2450], // Regional Blood Transfusion Center, Kilpauk
  [13.0805, 80.2480], // Poonamallee High Rd
  [13.0760, 80.2525], // Chetpet junction
  [13.0715, 80.2560], // EVR Periyar Salai
  [13.0670, 80.2585], // Spurtank Rd & College Rd
  [13.0645, 80.2598], // Anna Salai / Thousand Lights (Vehicle Current Location)
  [13.0610, 80.2580], // Anna Flyover approach
  [13.0585, 80.2550], // Mount Road / Greams Road intersection
  [13.0575, 80.2535], // Greams Lane approach
  [13.0569, 80.2525], // Apollo Greams Rd Emergency Trauma Bay
];

export const NavigationMap: React.FC = () => {
  const {
    currentLocation,
    colors,
    isDark,
    routeCoords,
    originCoords,
    destinationCoords,
    origin,
    destination,
    distanceKm,
  } = useMission();
  const [mapKey, setMapKey] = useState(0);

  const activeWaypoints = routeCoords && routeCoords.length > 0 ? routeCoords : CHENNAI_ROUTE_COORDS;

  const handleRecenter = () => {
    setMapKey((k) => k + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 100% REAL OPENSTREETMAP ROADMAP VIEWPORT */}
      <RealRoadmapView
        key={`map-${mapKey}-${isDark}-${origin}-${destination}`}
        isDark={isDark}
        vehicleLat={currentLocation.lat}
        vehicleLng={currentLocation.lng}
        routeCoords={activeWaypoints}
        originCoord={[originCoords.lat, originCoords.lng]}
        destCoord={[destinationCoords.lat, destinationCoords.lng]}
        originName={origin}
        destName={destination}
      />

      {/* TOP OVERLAY: Apple Maps Turn-by-Turn Guidance Banner */}
      <View
        style={[
          styles.turnBanner,
          {
            backgroundColor: isDark ? 'rgba(24, 25, 30, 0.94)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}>
        <View style={[styles.turnIconWrapper, { backgroundColor: colors.cobaltBlue }]}>
          <CornerUpRight size={22} color="#FFFFFF" strokeWidth={2.8} />
        </View>
        <View style={styles.turnDetails}>
          <Text style={[styles.turnDistance, { color: colors.cobaltBlue }]}>
            DIJKSTRA ROUTE &bull; {distanceKm} KM
          </Text>
          <Text style={[styles.turnStreet, { color: colors.textPrimary }]} numberOfLines={1}>
            Corridor to {destination}
          </Text>
          <Text style={[styles.turnTarget, { color: colors.textMuted }]} numberOfLines={1}>
            From {origin} &bull; Emergency Transit Priority
          </Text>
        </View>
      </View>

      {/* BOTTOM-LEFT: Subtle Live Vehicle Speed Pill */}
      <View
        style={[
          styles.speedPill,
          {
            backgroundColor: isDark ? 'rgba(24, 25, 30, 0.90)' : 'rgba(255, 255, 255, 0.92)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}>
        <Gauge size={13} color={colors.cobaltBlue} strokeWidth={2.4} />
        <Text style={[styles.speedValue, { color: colors.textPrimary }]}>
          {currentLocation.speedKmH}
        </Text>
        <Text style={[styles.speedUnit, { color: colors.textMuted }]}>km/h</Text>
      </View>

      {/* BOTTOM-RIGHT: Apple Maps Recenter Circular Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Recenter Map Route"
        onPress={handleRecenter}
        style={({ pressed }) => [
          styles.recenterCircle,
          {
            backgroundColor: isDark ? 'rgba(24, 25, 30, 0.92)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          },
          pressed && { opacity: 0.75, transform: [{ scale: 0.94 }] },
        ]}>
        <Navigation size={18} color={colors.cobaltBlue} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  turnBanner: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 10,
  },
  turnIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  turnDetails: {
    flex: 1,
  },
  turnDistance: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  turnStreet: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  turnTarget: {
    fontSize: 10.5,
    marginTop: 1,
  },
  speedPill: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 5,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  speedValue: {
    fontFamily: 'monospace',
    fontSize: 12.5,
    fontWeight: '800',
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: '600',
  },
  recenterCircle: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
});
