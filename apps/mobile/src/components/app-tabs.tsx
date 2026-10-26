import React from 'react';
import { useColorScheme, View } from 'react-native';

import { Colors } from '@/constants/theme';

let NativeTabsComponent: any = null;
try {
  // Expo Router in SDK 58+
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  NativeTabsComponent = require('expo-router/native-tabs')?.NativeTabs;
} catch {
  try {
    // Expo Router in SDK 57
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    NativeTabsComponent = require('expo-router/unstable-native-tabs')?.NativeTabs;
  } catch {
    NativeTabsComponent = null;
  }
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (!NativeTabsComponent) {
    return <View />;
  }

  const NativeTabs = NativeTabsComponent;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
