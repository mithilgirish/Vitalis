import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Truck,
  ArrowRight,
  Clock,
  Droplet,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RotateCw,
  Search,
  Building2,
  Navigation,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { useMission, TransferTask } from '@/context/MissionContext';

export default function TasksScreen() {
  const router = useRouter();
  const {
    allTasks,
    switchToTask,
    refreshTasks,
    destination,
    origin,
    colors,
    isDark,
  } = useMission();

  const [activeFilter, setActiveFilter] = useState<'all' | 'in_transit' | 'pending' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setIsRefreshing(false);
  };

  const filteredTasks = allTasks.filter((task) => {
    // Filter by status
    if (activeFilter === 'in_transit' && task.status !== 'in_transit') return false;
    if (activeFilter === 'pending' && task.status !== 'pending_approval' && task.status !== 'pending_dispatch') return false;
    if (activeFilter === 'delivered' && task.status !== 'delivered') return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrigin = task.origin_facility_name?.toLowerCase().includes(q);
      const matchDest = task.destination_facility_name?.toLowerCase().includes(q);
      const matchCargo = `${task.blood_group} ${task.resource_type}`.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      const matchDriver = task.assigned_driver_name?.toLowerCase().includes(q);
      return matchOrigin || matchDest || matchCargo || matchId || matchDriver;
    }
    return true;
  });

  const inTransitCount = allTasks.filter((t) => t.status === 'in_transit').length;
  const pendingCount = allTasks.filter((t) => t.status === 'pending_approval' || t.status === 'pending_dispatch').length;

  const handleSelectTask = (task: TransferTask) => {
    switchToTask(task);
    router.push('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 1. Header Bar with Title, KPI count & Refresh */}
      <View
        style={[
          styles.headerSection,
          {
            backgroundColor: isDark ? 'rgba(24, 25, 30, 0.94)' : 'rgba(255, 255, 255, 0.96)',
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          },
        ]}>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                Delivery Tasks
              </Text>
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.16)' : 'rgba(0, 122, 255, 0.10)' },
                ]}>
                <Text style={[styles.countPillText, { color: colors.cobaltBlue }]}>
                  {allTasks.length} Active
                </Text>
              </View>
            </View>
            <Text style={[styles.screenSub, { color: colors.textMuted }]}>
              Hospital-to-Hospital Transit Ledger & Corridor Routing
            </Text>
          </View>

          {/* Sync Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh Tasks from Database"
            onPress={onRefresh}
            style={({ pressed }) => [
              styles.refreshButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
              pressed && { opacity: 0.6 },
            ]}>
            <RotateCw size={15} color={colors.cobaltBlue} />
            <Text style={[styles.refreshText, { color: colors.cobaltBlue }]}>Sync</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}>
          <Search size={15} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by hospital, blood group, or order..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          <Pressable
            onPress={() => setActiveFilter('all')}
            style={[
              styles.filterPill,
              activeFilter === 'all'
                ? { backgroundColor: colors.cobaltBlue }
                : { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
            ]}>
            <Text
              style={[
                styles.filterPillText,
                { color: activeFilter === 'all' ? '#FFFFFF' : colors.textMuted },
              ]}>
              All ({allTasks.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('in_transit')}
            style={[
              styles.filterPill,
              activeFilter === 'in_transit'
                ? { backgroundColor: colors.cobaltBlue }
                : { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
            ]}>
            <Text
              style={[
                styles.filterPillText,
                { color: activeFilter === 'in_transit' ? '#FFFFFF' : colors.textMuted },
              ]}>
              In Transit ({inTransitCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('pending')}
            style={[
              styles.filterPill,
              activeFilter === 'pending'
                ? { backgroundColor: '#F59E0B' }
                : { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
            ]}>
            <Text
              style={[
                styles.filterPillText,
                { color: activeFilter === 'pending' ? '#FFFFFF' : colors.textMuted },
              ]}>
              Pending ({pendingCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('delivered')}
            style={[
              styles.filterPill,
              activeFilter === 'delivered'
                ? { backgroundColor: colors.emeraldSafe }
                : { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
            ]}>
            <Text
              style={[
                styles.filterPillText,
                { color: activeFilter === 'delivered' ? '#FFFFFF' : colors.textMuted },
              ]}>
              Delivered
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Tasks Scroll List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.cobaltBlue} />
        }>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Building2 size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Delivery Tasks Found</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'New dispatches from the Web Command Center will appear here.'}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const isCurrentlyActive =
              task.destination_facility_name === destination &&
              task.origin_facility_name === origin;

            const isPending = task.status === 'pending_approval' || task.status === 'pending_dispatch';
            const isDelivered = task.status === 'delivered';
            const isInTransit = task.status === 'in_transit';

            return (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor: isDark ? 'rgba(28, 29, 35, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                    borderColor: isCurrentlyActive
                      ? colors.cobaltBlue
                      : isDark
                      ? 'rgba(255, 255, 255, 0.09)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                  isCurrentlyActive && styles.activeTaskGlow,
                ]}>
                {/* Top Row: Order ID + Urgency + Status */}
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.orderIdText, { color: colors.textMuted }]}>
                      #{task.id.slice(-8).toUpperCase()}
                    </Text>
                    <View
                      style={[
                        styles.urgencyPill,
                        task.urgency_tier === 1
                          ? { backgroundColor: 'rgba(255, 59, 48, 0.12)' }
                          : { backgroundColor: 'rgba(245, 158, 11, 0.12)' },
                      ]}>
                      <Text
                        style={[
                          styles.urgencyPillText,
                          { color: task.urgency_tier === 1 ? '#FF3B30' : '#F59E0B' },
                        ]}>
                        {task.urgency_tier === 1 ? 'Level 1 Critical' : 'Level 2 Urgent'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      isInTransit
                        ? { backgroundColor: 'rgba(0, 122, 255, 0.12)' }
                        : isPending
                        ? { backgroundColor: 'rgba(245, 158, 11, 0.12)' }
                        : { backgroundColor: 'rgba(52, 199, 89, 0.12)' },
                    ]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isInTransit
                            ? colors.cobaltBlue
                            : isPending
                            ? '#F59E0B'
                            : colors.emeraldSafe,
                        },
                      ]}>
                      {isInTransit ? '🚚 In Transit' : isPending ? '⏳ Awaiting Sign-off' : '✓ Delivered'}
                    </Text>
                  </View>
                </View>

                {/* Corridor Route Visual: Origin ➔ Destination */}
                <View
                  style={[
                    styles.corridorContainer,
                    {
                      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  ]}>
                  {/* Origin */}
                  <View style={styles.corridorPoint}>
                    <View style={[styles.pointDot, { backgroundColor: '#10B981' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pointRoleText, { color: '#10B981' }]}>DONOR FACILITY (ORIGIN)</Text>
                      <Text style={[styles.pointHospitalName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {task.origin_facility_name || 'Regional Blood Transfusion Center'}
                      </Text>
                    </View>
                  </View>

                  {/* Connecting Line with Distance & ETA */}
                  <View style={styles.corridorLineWrapper}>
                    <View style={styles.verticalDottedLine} />
                    <View
                      style={[
                        styles.distanceEtaBadge,
                        {
                          backgroundColor: isDark ? 'rgba(0, 122, 255, 0.14)' : 'rgba(0, 122, 255, 0.08)',
                          borderColor: isDark ? 'rgba(0, 122, 255, 0.25)' : 'rgba(0, 122, 255, 0.15)',
                        },
                      ]}>
                      <Navigation size={11} color={colors.cobaltBlue} />
                      <Text style={[styles.distanceEtaText, { color: colors.cobaltBlue }]}>
                        {task.distance_km || 3.56} km &bull; ~{task.estimated_minutes || 6} mins drive
                      </Text>
                    </View>
                  </View>

                  {/* Destination */}
                  <View style={styles.corridorPoint}>
                    <View style={[styles.pointDot, { backgroundColor: '#EF4444' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pointRoleText, { color: '#EF4444' }]}>RECEIVING HOSPITAL (DESTINATION)</Text>
                      <Text style={[styles.pointHospitalName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {task.destination_facility_name || 'Apollo Hospitals, Greams Rd'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Cargo & Cold-Chain Safety Specs */}
                <View style={styles.cargoInfoRow}>
                  <View
                    style={[
                      styles.cargoPill,
                      {
                        backgroundColor: isDark ? 'rgba(255, 59, 48, 0.10)' : 'rgba(255, 59, 48, 0.07)',
                        borderColor: isDark ? 'rgba(255, 59, 48, 0.24)' : 'rgba(255, 59, 48, 0.15)',
                      },
                    ]}>
                    <Droplet size={12} color="#FF3B30" fill="#FF3B30" />
                    <Text style={[styles.cargoPillText, { color: colors.textPrimary }]}>
                      {task.units_requested || 4} Units &bull; {task.blood_group || 'O-'} {task.resource_type || 'PRBC'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.tempTargetPill,
                      {
                        backgroundColor: isDark ? 'rgba(52, 199, 89, 0.10)' : 'rgba(52, 199, 89, 0.07)',
                        borderColor: isDark ? 'rgba(52, 199, 89, 0.24)' : 'rgba(52, 199, 89, 0.15)',
                      },
                    ]}>
                    <ShieldCheck size={12} color={colors.emeraldSafe} />
                    <Text style={[styles.tempTargetText, { color: colors.emeraldSafe }]}>
                      2°C – 6°C Cold Chain
                    </Text>
                  </View>
                </View>

                {/* Driver / Transport info */}
                <View style={styles.driverInfoRow}>
                  <Truck size={13} color={colors.textMuted} />
                  <Text style={[styles.driverInfoText, { color: colors.textSecondary }]}>
                    Courier: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{task.assigned_driver_name || 'Vikramaditya Rao'}</Text> ({task.courier_id || 'COU-CH-104'})
                  </Text>
                </View>

                {/* Action CTA Button */}
                <View style={styles.actionRow}>
                  {isCurrentlyActive ? (
                    <View
                      style={[
                        styles.activeBannerPill,
                        {
                          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.10)',
                          borderColor: '#10B981',
                        },
                      ]}>
                      <CheckCircle2 size={14} color="#10B981" />
                      <Text style={[styles.activeBannerText, { color: '#10B981' }]}>
                        Currently Loaded in Cockpit Map ✓
                      </Text>
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Navigate to ${task.destination_facility_name}`}
                      onPress={() => handleSelectTask(task)}
                      style={({ pressed }) => [
                        styles.navigateButton,
                        { backgroundColor: colors.cobaltBlue },
                        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                      ]}>
                      <Navigation size={14} color="#FFFFFF" />
                      <Text style={styles.navigateButtonText}>Navigate This Route</Text>
                      <ArrowRight size={14} color="#FFFFFF" />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  countPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  screenSub: {
    fontSize: 11,
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 2,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 28,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 240,
  },
  taskCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.2,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  activeTaskGlow: {
    borderColor: '#0A84FF',
    shadowOpacity: 0.18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  urgencyPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgencyPillText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  corridorContainer: {
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  corridorPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pointRoleText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  pointHospitalName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  corridorLineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 3.5,
    gap: 8,
    paddingVertical: 2,
  },
  verticalDottedLine: {
    width: 1.5,
    height: 18,
    backgroundColor: '#0A84FF',
    opacity: 0.4,
  },
  distanceEtaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  distanceEtaText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  cargoInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cargoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cargoPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tempTargetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tempTargetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverInfoText: {
    fontSize: 10.5,
  },
  actionRow: {
    marginTop: 2,
  },
  activeBannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
