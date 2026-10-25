import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  ShieldCheck,
  Truck,
  Boxes,
  FileSearch,
  X,
  CheckCircle,
  LogOut,
  User,
  Building,
  Key,
} from 'lucide-react-native';
import { useMission, MobileUserRole, MOBILE_DEMO_USERS } from '@/context/MissionContext';

export const AuthRoleModal: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    isAuthModalVisible,
    setAuthModalVisible,
    logoutUser,
    colors,
    isDark,
  } = useMission();

  if (!isAuthModalVisible) return null;

  const roleIcons: Record<MobileUserRole, React.ComponentType<{ size?: number; color?: string }>> = {
    courier: Truck,
    coordinator: ShieldCheck,
    inventory_officer: Boxes,
    auditor: FileSearch,
  };

  const roleColors: Record<MobileUserRole, { badgeBg: string; badgeBorder: string; text: string }> = {
    courier: {
      badgeBg: 'rgba(255, 179, 0, 0.12)',
      badgeBorder: 'rgba(255, 179, 0, 0.35)',
      text: '#FFB300',
    },
    coordinator: {
      badgeBg: 'rgba(255, 59, 48, 0.12)',
      badgeBorder: 'rgba(255, 59, 48, 0.35)',
      text: '#FF3B30',
    },
    inventory_officer: {
      badgeBg: 'rgba(52, 199, 89, 0.12)',
      badgeBorder: 'rgba(52, 199, 89, 0.35)',
      text: '#34C759',
    },
    auditor: {
      badgeBg: 'rgba(10, 132, 255, 0.12)',
      badgeBorder: 'rgba(10, 132, 255, 0.35)',
      text: '#0A84FF',
    },
  };

  const currentColor = roleColors[currentUser.role];

  return (
    <Modal
      visible={isAuthModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setAuthModalVisible(false)}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? 'rgba(26, 27, 34, 0.98)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.headerRow,
              { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
            ]}
          >
            <View style={styles.headerTitleGroup}>
              <User size={16} color={currentColor.text} />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Operator Identity & Role Access
              </Text>
            </View>
            <Pressable
              onPress={() => setAuthModalVisible(false)}
              hitSlop={10}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Current Active User Profile Banner */}
            <View
              style={[
                styles.userProfileCard,
                {
                  backgroundColor: isDark ? 'rgba(36, 37, 46, 0.65)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: currentColor.badgeBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarBox,
                  {
                    backgroundColor: currentColor.badgeBg,
                    borderColor: currentColor.badgeBorder,
                  },
                ]}
              >
                <Text style={[styles.avatarText, { color: currentColor.text }]}>
                  {currentUser.avatarInitials}
                </Text>
              </View>

              <View style={styles.userInfoCol}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, { color: colors.textPrimary }]}>
                    {currentUser.name}
                  </Text>
                  <View
                    style={[
                      styles.rolePill,
                      {
                        backgroundColor: currentColor.badgeBg,
                        borderColor: currentColor.badgeBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.rolePillText, { color: currentColor.text }]}>
                      {currentUser.role.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.roleTitle, { color: colors.textSecondary }]}>
                  {currentUser.roleTitle}
                </Text>

                <View style={styles.metaRow}>
                  <Building size={12} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    {currentUser.facilityName}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Key size={12} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>
                    Badge: {currentUser.driverId} • Plate: {currentUser.vehiclePlate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Role Switcher Section (Demo) */}
            <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
              SWITCH USER ROLE (ONE-TAP DEMO)
            </Text>

            <View style={styles.roleGrid}>
              {(Object.keys(MOBILE_DEMO_USERS) as MobileUserRole[]).map((rKey) => {
                const target = MOBILE_DEMO_USERS[rKey];
                const isCurrent = currentUser.role === rKey;
                const Icon = roleIcons[rKey];
                const cfg = roleColors[rKey];

                return (
                  <Pressable
                    key={rKey}
                    onPress={() => switchUserRole(rKey)}
                    style={({ pressed }) => [
                      styles.roleButton,
                      {
                        backgroundColor: isCurrent
                          ? cfg.badgeBg
                          : isDark
                          ? 'rgba(34, 35, 42, 0.6)'
                          : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isCurrent
                          ? cfg.badgeBorder
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.06)',
                      },
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <View
                      style={[
                        styles.roleIconBox,
                        {
                          backgroundColor: cfg.badgeBg,
                          borderColor: cfg.badgeBorder,
                        },
                      ]}
                    >
                      <Icon size={14} color={cfg.text} />
                    </View>

                    <View style={styles.roleDetails}>
                      <View style={styles.roleTopRow}>
                        <Text style={[styles.roleTargetName, { color: colors.textPrimary }]}>
                          {target.name}
                        </Text>
                        {isCurrent && <CheckCircle size={14} color={cfg.text} />}
                      </View>
                      <Text style={[styles.roleTargetTitle, { color: colors.textSecondary }]}>
                        {target.badgeLabel}
                      </Text>
                      <Text style={[styles.roleTargetFacility, { color: colors.textMuted }]}>
                        {target.facilityName}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footerRow,
              { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
            ]}
          >
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Driver ID: {currentUser.driverId}
            </Text>

            <Pressable
              onPress={logoutUser}
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <LogOut size={13} color="#FF3B30" />
              <Text style={styles.logoutBtnText}>Reset Session</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: 4,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  userProfileCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  userInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  rolePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  roleTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  roleGrid: {
    gap: 8,
    marginBottom: 10,
  },
  roleButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  roleIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleDetails: {
    flex: 1,
  },
  roleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleTargetName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  roleTargetTitle: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  roleTargetFacility: {
    fontSize: 9.5,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
