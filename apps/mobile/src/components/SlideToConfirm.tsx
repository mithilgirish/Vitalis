import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import { ChevronsRight, Check } from 'lucide-react-native';
import { ERGONOMICS } from '@/theme/vitalis-theme';
import { useMission } from '@/context/MissionContext';

interface SlideToConfirmProps {
  onConfirm: () => void;
  label?: string;
  confirmedLabel?: string;
  color?: string;
  height?: number;
  disabled?: boolean;
}

export const SlideToConfirm: React.FC<SlideToConfirmProps> = ({
  onConfirm,
  label = 'SLIDE TO ACCEPT MISSION',
  confirmedLabel = 'MISSION ACCEPTED',
  color,
  height = ERGONOMICS.sliderHeight,
  disabled = false,
}) => {
  const { colors } = useMission();
  const [containerWidth, setContainerWidth] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [pan] = useState(() => new Animated.Value(0));

  const thumbColor = color || colors.esiCrimson;
  const thumbSize = height - 8;
  const maxDrag = Math.max(0, containerWidth - thumbSize - 8);

  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !isConfirmed,
      onMoveShouldSetPanResponder: () => !disabled && !isConfirmed,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          const clamped = Math.min(gestureState.dx, maxDrag);
          pan.setValue(clamped);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= maxDrag * 0.75) {
          Animated.timing(pan, {
            toValue: maxDrag,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            setIsConfirmed(true);
            onConfirm();
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            friction: 6,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  );

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const handleQuickTap = () => {
    if (disabled || isConfirmed) return;
    Animated.timing(pan, {
      toValue: maxDrag,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setIsConfirmed(true);
      onConfirm();
    });
  };

  const progressWidth = pan.interpolate({
    inputRange: [0, Math.max(1, maxDrag)],
    outputRange: [thumbSize + 8, Math.max(thumbSize + 8, containerWidth)],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: colors.bgCardElevated,
          borderColor: isConfirmed ? colors.emeraldSafe : colors.borderActive,
        },
      ]}
      onLayout={onLayout}>
      {/* Background track fill */}
      <Animated.View
        style={[
          styles.trackFill,
          {
            width: progressWidth,
            backgroundColor: isConfirmed ? colors.emeraldSafeBg : colors.esiCrimsonBg,
          },
        ]}
      />

      {/* Label Text */}
      <View style={styles.labelContainer} pointerEvents="none">
        <Text
          style={[
            styles.label,
            { color: isConfirmed ? colors.emeraldSafe : colors.textPrimary },
          ]}>
          {isConfirmed ? confirmedLabel : label}
        </Text>
      </View>

      {/* Slide Thumb */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            backgroundColor: isConfirmed ? colors.emeraldSafe : thumbColor,
            transform: [{ translateX: pan }],
          },
        ]}>
        <Pressable onPress={handleQuickTap} style={styles.thumbInner}>
          {isConfirmed ? (
            <Check size={26} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <ChevronsRight size={26} color="#FFFFFF" strokeWidth={2.5} />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: ERGONOMICS.radiusLg,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: ERGONOMICS.radiusLg,
  },
  labelContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 48,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  thumb: {
    borderRadius: ERGONOMICS.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  thumbInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
