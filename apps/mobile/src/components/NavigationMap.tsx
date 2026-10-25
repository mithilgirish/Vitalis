import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  CornerUpRight,
  Navigation,
  Gauge,
  Search,
  Maximize2,
  Minimize2,
  Layers,
  Plus,
  Minus,
} from 'lucide-react-native';
import type { WebView } from 'react-native-webview';
import { useMission } from '@/context/MissionContext';
import { RealRoadmapView, MapTileProvider } from './RealRoadmapView';
import { HospitalSearchModal } from './HospitalSearchModal';

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

export interface NavigationMapProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const NavigationMap: React.FC<NavigationMapProps> = ({
  isFullscreen = false,
  onToggleFullscreen,
}) => {
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
    etaSeconds,
  } = useMission();

  const [tileProvider, setTileProvider] = useState<MapTileProvider>('osm');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const webViewRef = useRef<WebView | null>(null);

  const activeWaypoints = routeCoords && routeCoords.length > 0 ? routeCoords : CHENNAI_ROUTE_COORDS;
  const etaMinutes = Math.max(1, Math.round(etaSeconds / 60));

  const handleRecenter = () => {
    webViewRef.current?.injectJavaScript('if (window.recenterRoute) window.recenterRoute(); true;');
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript('if (window.zoomIn) window.zoomIn(); true;');
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript('if (window.zoomOut) window.zoomOut(); true;');
  };

  const handleCycleTileLayer = () => {
    setTileProvider((prev) => {
      if (prev === 'osm') return 'hot';
      if (prev === 'hot') return 'satellite';
      return 'osm';
    });
  };

  const getTileProviderLabel = () => {
    if (tileProvider === 'osm') return 'OSM';
    if (tileProvider === 'hot') return 'HOT';
    return 'SAT';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 100% REAL OPENSTREETMAP / HOT / SATELLITE ROADMAP (ZERO API KEY) */}
      <RealRoadmapView
        key={`map-${isDark}-${tileProvider}-${origin}-${destination}`}
        isDark={isDark}
        tileProvider={tileProvider}
        vehicleLat={currentLocation.lat}
        vehicleLng={currentLocation.lng}
        routeCoords={activeWaypoints}
        originCoord={[originCoords.lat, originCoords.lng]}
        destCoord={[destinationCoords.lat, destinationCoords.lng]}
        originName={origin}
        destName={destination}
        webViewRef={webViewRef}
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
            DIJKSTRA ROUTING &bull; {distanceKm.toFixed(1)} KM (~{etaMinutes} MINS)
          </Text>
          <Text style={[styles.turnStreet, { color: colors.textPrimary }]} numberOfLines={1}>
            To {destination}
          </Text>
          <Text style={[styles.turnTarget, { color: colors.textMuted }]} numberOfLines={1}>
            From {origin} &bull; Priority Corridor
          </Text>
        </View>

        {/* Top Action Buttons: Change Hospital + Fullscreen Toggle */}
        <View style={styles.topActionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search Destination Hospital"
            onPress={() => setIsSearchModalOpen(true)}
            style={({ pressed }) => [
              styles.actionPillBtn,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 122, 255, 0.08)' },
              pressed && { opacity: 0.7 },
            ]}>
            <Search size={14} color={colors.cobaltBlue} strokeWidth={2.4} />
            <Text style={[styles.actionPillText, { color: colors.cobaltBlue }]}>Change</Text>
          </Pressable>

          {onToggleFullscreen && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              onPress={onToggleFullscreen}
              style={({ pressed }) => [
                styles.iconActionBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)' },
                pressed && { opacity: 0.7 },
              ]}>
              {isFullscreen ? (
                <Minimize2 size={16} color={colors.textPrimary} strokeWidth={2.2} />
              ) : (
                <Maximize2 size={16} color={colors.textPrimary} strokeWidth={2.2} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* FLOATING RIGHT DOCK: Recenter, Layers, Zoom Controls */}
      <View
        style={[
          styles.rightDock,
          {
            backgroundColor: isDark ? 'rgba(24, 25, 30, 0.90)' : 'rgba(255, 255, 255, 0.92)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}>
        {/* Recenter */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recenter Map"
          onPress={handleRecenter}
          style={({ pressed }) => [styles.dockBtn, pressed && { opacity: 0.6 }]}>
          <Navigation size={18} color={colors.cobaltBlue} strokeWidth={2.4} />
        </Pressable>

        <View
          style={[
            styles.dockDivider,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
          ]}
        />

        {/* Tile Layer Switcher */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch Map Layer"
          onPress={handleCycleTileLayer}
          style={({ pressed }) => [styles.dockBtn, pressed && { opacity: 0.6 }]}>
          <Layers size={17} color={colors.textPrimary} strokeWidth={2.2} />
          <Text style={[styles.layerBadgeText, { color: colors.cobaltBlue }]}>
            {getTileProviderLabel()}
          </Text>
        </Pressable>

        <View
          style={[
            styles.dockDivider,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
          ]}
        />

        {/* Zoom In */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom In"
          onPress={handleZoomIn}
          style={({ pressed }) => [styles.dockBtn, pressed && { opacity: 0.6 }]}>
          <Plus size={18} color={colors.textPrimary} strokeWidth={2.4} />
        </Pressable>

        <View
          style={[
            styles.dockDivider,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
          ]}
        />

        {/* Zoom Out */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom Out"
          onPress={handleZoomOut}
          style={({ pressed }) => [styles.dockBtn, pressed && { opacity: 0.6 }]}>
          <Minus size={18} color={colors.textPrimary} strokeWidth={2.4} />
        </Pressable>
      </View>

      {/* BOTTOM-LEFT: Telemetry Speed & GPS Live Pill */}
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
        <View style={styles.speedPulseDot} />
        <Text style={[styles.gpsLiveText, { color: colors.textMuted }]}>GPS Live</Text>
      </View>

      {/* Hospital Search & Destination Picker Modal */}
      <HospitalSearchModal
        visible={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
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
    paddingVertical: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 10,
  },
  turnIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 13,
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
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  turnStreet: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  turnTarget: {
    fontSize: 10,
    marginTop: 1,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },
  actionPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightDock: {
    position: 'absolute',
    top: 86,
    right: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
    overflow: 'hidden',
  },
  dockBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockDivider: {
    height: StyleSheet.hairlineWidth,
    width: '70%',
    alignSelf: 'center',
  },
  layerBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    marginTop: 1,
    letterSpacing: 0.4,
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
    fontSize: 12,
    fontWeight: '800',
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: '600',
  },
  speedPulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginLeft: 3,
  },
  gpsLiveText: {
    fontSize: 8.5,
    fontWeight: '600',
  },
});
