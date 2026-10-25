import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import {
  Sun,
  Moon,
} from 'lucide-react-native';
import { useMission } from '@/context/MissionContext';
import { VitalisLogo } from './VitalisLogo';

export const HeaderCockpit: React.FC = () => {
  const {
    excursionFlag,
    colors,
    isDark,
    toggleTheme,
    currentUser,
    setAuthModalVisible,
  } = useMission();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for excursion alarm
  useEffect(() => {
    if (!excursionFlag) {
      pulseAnim.setValue(1);
      return;
    }
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [excursionFlag, pulseAnim]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(20, 21, 25, 0.94)' : 'rgba(255, 255, 255, 0.95)',
          borderBottomColor: excursionFlag
            ? colors.redAlarm
            : isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
        },
        excursionFlag && { backgroundColor: colors.redAlarmBg },
      ]}>
      {/* Brand Logo on Left */}
      <View style={styles.brandGroup}>
        <VitalisLogo
          size="md"
          textColor={colors.textPrimary}
          subtextColor={colors.textMuted}
        />
      </View>

      {/* Right Controls: User Identity Pill + Theme Toggle */}
      <View style={styles.rightControls}>
        {/* User Identity / Role Pill */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch Operator Role"
          onPress={() => setAuthModalVisible(true)}
          style={({ pressed }) => [
            styles.userPill,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
            },
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
          ]}>
          <View
            style={[
              styles.userAvatarMini,
              {
                backgroundColor:
                  currentUser.role === 'courier'
                    ? '#FFB300'
                    : currentUser.role === 'coordinator'
                    ? '#FF3B30'
                    : currentUser.role === 'inventory_officer'
                    ? '#34C759'
                    : '#0A84FF',
              },
            ]}>
            <Text style={styles.userAvatarMiniText}>{currentUser.avatarInitials}</Text>
          </View>
          <Text style={[styles.userDriverIdText, { color: colors.textPrimary }]}>
            {currentUser.name.split(' ')[0]}
          </Text>
        </Pressable>

        {/* Circular Theme Toggle */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle Theme Mode"
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.themeToggleButton,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
            pressed && { opacity: 0.65, transform: [{ scale: 0.94 }] },
          ]}>
          {isDark ? (
            <Sun size={14} color="#FFD60A" />
          ) : (
            <Moon size={14} color={colors.textSecondary} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  userAvatarMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarMiniText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  userDriverIdText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
