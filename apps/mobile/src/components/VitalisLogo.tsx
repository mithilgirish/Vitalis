import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, RadialGradient, Stop, Circle } from 'react-native-svg';

interface VitalisLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
}

export const VitalisLogo: React.FC<VitalisLogoProps> = ({
  size = 'md',
  showText = true,
  textColor = '#FFFFFF',
  subtextColor = '#94A3B8',
}) => {
  const sizeMap = {
    sm: { box: 26, titleSize: 13, subtitleSize: 8, badgeSize: 8 },
    md: { box: 34, titleSize: 15, subtitleSize: 9, badgeSize: 9 },
    lg: { box: 44, titleSize: 18, subtitleSize: 10, badgeSize: 10 },
  };

  const { box, titleSize, subtitleSize, badgeSize } = sizeMap[size];

  return (
    <View style={styles.container}>
      {/* Interlocking Crimson & Cobalt Ribbon Emblem */}
      <View style={styles.iconWrapper}>
        <Svg width={box} height={box} viewBox="0 0 48 48" fill="none">
          <Defs>
            {/* Crimson Ribbon Gradient (Blood / Urgency) */}
            <LinearGradient id="crimsonRibbonMobile" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#FB7185" />
              <Stop offset="45%" stopColor="#E11D48" />
              <Stop offset="100%" stopColor="#9F1239" />
            </LinearGradient>

            {/* Cobalt Ribbon Gradient (Network / Logistics) */}
            <LinearGradient id="cobaltRibbonMobile" x1="42" y1="6" x2="6" y2="42" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#60A5FA" />
              <Stop offset="55%" stopColor="#2563EB" />
              <Stop offset="100%" stopColor="#1E3A8A" />
            </LinearGradient>

            {/* Central Viability Intersection Glow */}
            <RadialGradient id="centerGlowMobile" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Underloop - Cobalt Ribbon */}
          <Path
            d="M12 36C8 30 10 18 20 12C28 7.2 38 12 38 20C38 28 28 34 24 38C20 42 16 42 12 36Z"
            stroke="url(#cobaltRibbonMobile)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.9}
          />

          {/* Overloop - Crimson Ribbon Interlocking */}
          <Path
            d="M36 36C40 30 38 18 28 12C20 7.2 10 12 10 20C10 28 20 34 24 38C28 42 32 42 36 36Z"
            stroke="url(#crimsonRibbonMobile)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Central Crossing Node / Viability Core */}
          <Circle cx={24} cy={20} r={2.5} fill="#FFFFFF" opacity={0.95} />
          <Circle cx={24} cy={20} r={5} fill="url(#centerGlowMobile)" />
        </Svg>
      </View>

      {showText && (
        <View style={styles.textColumn}>
          <Text style={[styles.title, { fontSize: titleSize, color: textColor }]}>
            VITALIS
          </Text>
          <Text style={[styles.subtitle, { fontSize: subtitleSize, color: subtextColor }]}>
            EMERGENCY COURIER
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4.5,
    borderRadius: 10,
    backgroundColor: 'rgba(148, 163, 184, 0.24)', // Grey curved box in both light & dark mode, no border
  },
  textColumn: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    backgroundColor: 'rgba(225, 29, 72, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.28)',
  },
  badgeText: {
    color: '#FB7185',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
});
