import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import {
  Search,
  MapPin,
  Route,
  Navigation,
  X,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { useMission } from '@/context/MissionContext';
import {
  searchHospitalsMobile,
  calculateTomTomRoute,
  MobileHospitalSearchItem,
} from '@/services/tomtomRoutingService';

interface HospitalSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HospitalSearchModal: React.FC<HospitalSearchModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    colors,
    isDark,
    origin,
    originCoords,
    destination,
    destinationCoords,
    distanceKm,
    updateMissionDestination,
  } = useMission();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRouting, setIsRouting] = useState(false);

  // Filter hospitals
  const searchResults = useMemo(() => {
    return searchHospitalsMobile(searchQuery);
  }, [searchQuery]);

  const handleSelectHospital = async (item: MobileHospitalSearchItem) => {
    setIsRouting(true);
    try {
      // Calculate route from current origin to the new destination hospital
      const routeResult = await calculateTomTomRoute(
        [originCoords.lat, originCoords.lng],
        [item.lat, item.lng],
        origin,
        item.shortName,
        undefined,
        item.id
      );

      // Update MissionContext with new destination and computed TomTom / Dijkstra route
      updateMissionDestination(
        item.name,
        { lat: item.lat, lng: item.lng },
        routeResult.waypoints,
        routeResult.totalDistanceKm,
        routeResult.estimatedMinutes * 60
      );

      // Dismiss modal
      onClose();
    } catch (err) {
      console.warn('Failed to calculate mobile route:', err);
      onClose();
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={[
          styles.backdrop,
          { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.65)' },
        ]}
      >
        <View
          style={[
            styles.sheetCard,
            {
              backgroundColor: isDark ? 'rgba(28, 29, 35, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.iconWrap, { backgroundColor: colors.cobaltBlue }]}>
                <Navigation size={18} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Search Destination Hospital
                </Text>
                <Text style={[styles.subTitle, { color: colors.textMuted }]}>
                  TomTom Real-Time Traffic Routing
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={18} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Search Input Bar */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? 'rgba(20, 21, 26, 0.8)' : 'rgba(241, 245, 249, 0.9)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            <Search size={16} color={colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by hospital name or area (e.g. Apollo, Fortis)..."
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary }]}
              autoFocus={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={14} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Active Routing Engine Indicator */}
          <View style={styles.engineRow}>
            <Text style={[styles.engineLabel, { color: colors.textMuted }]}>Routing Engine:</Text>
            <View
              style={[
                styles.enginePillGroup,
                {
                  backgroundColor: isDark ? 'rgba(20, 21, 26, 0.7)' : 'rgba(241, 245, 249, 0.8)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
            >
              <View
                style={[
                  styles.enginePill,
                  {
                    backgroundColor: colors.cobaltBlue,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.engineText,
                    {
                      color: '#FFFFFF',
                      fontWeight: '700',
                    },
                  ]}
                >
                  TomTom Real-Time Traffic
                </Text>
              </View>
            </View>
          </View>

          {/* Hospital Results List */}
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isCurrentDest = item.name.includes(destination) || destination.includes(item.shortName);

              return (
                <Pressable
                  onPress={() => handleSelectHospital(item)}
                  style={({ pressed }) => [
                    styles.hospitalItem,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.02)',
                      borderColor: isCurrentDest
                        ? colors.cobaltBlue
                        : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.06)',
                    },
                    pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={[
                          styles.hospName,
                          { color: colors.textPrimary },
                          isCurrentDest && { color: colors.cobaltBlue },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <View style={styles.traumaBadge}>
                        <Text style={styles.traumaText}>Level {item.traumaLevel}</Text>
                      </View>
                    </View>

                    <Text style={[styles.hospArea, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.area} &bull; {item.address}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.routeBtn,
                      {
                        backgroundColor: isCurrentDest
                          ? colors.cobaltBlue
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 122, 255, 0.1)',
                      },
                    ]}
                  >
                    <Route
                      size={14}
                      color={isCurrentDest ? '#FFFFFF' : colors.cobaltBlue}
                    />
                    <Text
                      style={[
                        styles.routeBtnText,
                        { color: isCurrentDest ? '#FFFFFF' : colors.cobaltBlue },
                      ]}
                    >
                      {isCurrentDest ? 'Active' : 'Route'}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '80%',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  engineLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  enginePillGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  enginePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  engineText: {
    fontSize: 10,
  },
  listContent: {
    paddingBottom: 16,
    gap: 8,
  },
  hospitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  hospName: {
    fontSize: 13,
    fontWeight: '700',
  },
  traumaBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  traumaText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3B82F6',
  },
  hospArea: {
    fontSize: 11,
    marginTop: 2,
  },
  routeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  routeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
