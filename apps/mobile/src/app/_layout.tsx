import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { MissionProvider, useMission } from '@/context/MissionContext';
import { HeaderCockpit } from '@/components/HeaderCockpit';
import { BottomCockpitNav } from '@/components/BottomCockpitNav';
import { AuthRoleModal } from '@/components/AuthRoleModal';

SplashScreen.preventAutoHideAsync().catch(() => {});

function CockpitLayoutInner() {
  const { excursionFlag, colors, isDark } = useMission();
  const borderPulse = useRef(new Animated.Value(0)).current;

  // Turn the screen border pulsing Red when excursion occurs
  useEffect(() => {
    if (excursionFlag) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(borderPulse, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(borderPulse, {
            toValue: 0.15,
            duration: 400,
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      borderPulse.setValue(0);
    }
  }, [excursionFlag, borderPulse]);

  const borderColor = borderPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.redAlarm],
  });

  const borderWidth = borderPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Outer vehicle screen wrapper with optional pulsing red border */}
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.bg,
            borderColor,
            borderWidth,
          },
        ]}>
        <HeaderCockpit />
        <View style={[styles.content, { backgroundColor: colors.bg }]}>
          <Slot />
        </View>
        <BottomCockpitNav />
        <AuthRoleModal />
      </Animated.View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <MissionProvider>
        <CockpitLayoutInner />
      </MissionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
