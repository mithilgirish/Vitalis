import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CornerUpRight, Compass, Radio, Gauge, MapPin, Navigation } from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
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
  const { gpsPulseCountdown, currentLocation, distanceKm, etaSeconds, colors, isDark } = useMission();
  const [mapKey, setMapKey] = useState(0);

  const etaMinutes = Math.floor(etaSeconds / 60);

  const handleRecenter = () => {
    setMapKey((k) => k + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 100% REAL OPENSTREETMAP ROADMAP VIEWPORT (NO API KEY REQUIRED) */}
      <RealRoadmapView
        key={`map-${mapKey}-${isDark}`}
        isDark={isDark}
        vehicleLat={currentLocation.lat}
        vehicleLng={currentLocation.lng}
        routeCoords={CHENNAI_ROUTE_COORDS}
        originCoord={[13.0827, 80.2450]}
        destCoord={[13.0569, 80.2525]}
        originName="Regional Blood Bank"
        destName="Apollo Greams ER"
      />

      {/* TOP OVERLAY: Turn-by-Turn Instruction Card */}
      <View
        style={[
          styles.turnCard,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.cobaltBlue,
          },
        ]}>
        <View style={[styles.turnIconWrapper, { backgroundColor: colors.cobaltBlue }]}>
          <CornerUpRight size={22} color="#FFFFFF" strokeWidth={3} />
        </View>
        <View style={styles.turnDetails}>
          <Text style={[styles.turnDistance, { color: colors.cobaltBlue }]}>IN 450 METERS</Text>
          <Text style={[styles.turnStreet, { color: colors.textPrimary }]} numberOfLines={1}>
            Turn Right onto Anna Salai / Greams Rd
          </Text>
        </View>
      </View>

      {/* TOP-RIGHT OVERLAY: Live 15s GPS Telemetry Pulse Badge */}
      <View
        style={[
          styles.gpsSyncBadge,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.emeraldSafe,
          },
        ]}>
        <View style={[styles.gpsSyncDot, { backgroundColor: colors.emeraldSafe }]} />
        <Radio size={11} color={colors.emeraldSafe} />
        <View>
          <Text style={[styles.gpsSyncTitle, { color: colors.textPrimary }]}>
            15s GPS PULSE
          </Text>
          <Text style={[styles.gpsSyncSub, { color: colors.textMuted }]}>
            Sync in {gpsPulseCountdown}s
          </Text>
        </View>
      </View>

      {/* FLOATING OSM ROADMAP BADGE & RECENTER BUTTON */}
      <View style={styles.floatingRightActions}>
        <View
          style={[
            styles.osmBadge,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
          ]}>
          <MapPin size={11} color={colors.emeraldSafe} />
          <Text style={[styles.osmBadgeText, { color: colors.textSecondary }]}>
            OPENSTREETMAP LIVE
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recenter Route"
          onPress={handleRecenter}
          style={({ pressed }) => [
            styles.recenterButton,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
            },
            pressed && { opacity: 0.75 },
          ]}>
          <Navigation size={13} color={colors.cobaltBlue} />
          <Text style={[styles.recenterText, { color: colors.textPrimary }]}>
            RECENTER
          </Text>
        </Pressable>
      </View>

      {/* BOTTOM OVERLAY: Live Telemetry HUD Bar */}
      <View
        style={[
          styles.hudBar,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.hudItem}>
          <Gauge size={13} color={colors.cobaltBlue} />
          <Text style={[styles.hudValue, { color: colors.textPrimary }]}>
            {currentLocation.speedKmH}
          </Text>
          <Text style={[styles.hudLabel, { color: colors.textMuted }]}>KM/H</Text>
        </View>

        <View style={[styles.hudDivider, { backgroundColor: colors.border }]} />

        <View style={styles.hudItem}>
          <Text style={[styles.hudValue, { color: colors.textPrimary }]}>
            {distanceKm.toFixed(1)}
          </Text>
          <Text style={[styles.hudLabel, { color: colors.textMuted }]}>KM TO ER</Text>
        </View>

        <View style={[styles.hudDivider, { backgroundColor: colors.border }]} />

        <View style={styles.hudItem}>
          <Compass size={13} color={colors.textSecondary} />
          <Text style={[styles.hudValue, { color: colors.textPrimary }]}>242°</Text>
          <Text style={[styles.hudLabel, { color: colors.textMuted }]}>HEADING</Text>
        </View>

        <View style={[styles.hudDivider, { backgroundColor: colors.border }]} />

        <View style={styles.hudItem}>
          <Text style={[styles.hudValue, { color: colors.emeraldSafe }]}>
            {etaMinutes}m
          </Text>
          <Text style={[styles.hudLabel, { color: colors.textMuted }]}>LIVE ETA</Text>
        </View>
      </View>
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
  turnCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 155,
    borderRadius: ERGONOMICS.radiusMd,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  turnIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  turnDetails: {
    flex: 1,
  },
  turnDistance: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  turnStreet: {
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 1,
  },
  gpsSyncBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: ERGONOMICS.radiusSm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  gpsSyncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gpsSyncTitle: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gpsSyncSub: {
    fontSize: 7.5,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  floatingRightActions: {
    position: 'absolute',
    top: 58,
    right: 12,
    gap: 6,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  osmBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  osmBadgeText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  recenterButton: {
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recenterText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  hudBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: ERGONOMICS.radiusMd,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  hudItem: {
    alignItems: 'center',
    gap: 2,
  },
  hudValue: {
    fontFamily: 'monospace',
    fontSize: 12.5,
    fontWeight: '900',
  },
  hudLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudDivider: {
    width: 1,
    height: 20,
  },
});
