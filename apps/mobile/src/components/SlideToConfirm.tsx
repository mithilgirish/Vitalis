import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  Vibration,
} from 'react-native';
import { ChevronsRight, Check, ChevronRight } from 'lucide-react-native';
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

  const thumbSize = height - 10;
  const padding = 5;

  const pan = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const chevronPulse = useRef(new Animated.Value(0)).current;

  const maxDragRef = useRef(0);
  const isConfirmedRef = useRef(false);
  const disabledRef = useRef(disabled);
  const onConfirmRef = useRef(onConfirm);

  isConfirmedRef.current = isConfirmed;
  disabledRef.current = disabled;
  onConfirmRef.current = onConfirm;

  // Gentle pulsing animation to visually guide driver to slide right
  useEffect(() => {
    if (isConfirmed) return;
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronPulse, {
          toValue: 5,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(chevronPulse, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();
    return () => pulseAnim.stop();
  }, [isConfirmed, chevronPulse]);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setContainerWidth(width);
    const calculatedMax = Math.max(0, width - thumbSize - padding * 2);
    maxDragRef.current = calculatedMax;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabledRef.current && !isConfirmedRef.current,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          !disabledRef.current && !isConfirmedRef.current && Math.abs(gestureState.dx) > 3,
        onPanResponderGrant: () => {
          Animated.spring(thumbScale, {
            toValue: 1.08,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderMove: (_, gestureState) => {
          const max = maxDragRef.current;
          if (max <= 0) return;
          const clamped = Math.max(0, Math.min(gestureState.dx, max));
          pan.setValue(clamped);
        },
        onPanResponderRelease: (_, gestureState) => {
          Animated.spring(thumbScale, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }).start();

          const max = maxDragRef.current;
          // Must slide at least 68% of track or brisk fling
          const isFarEnough = gestureState.dx >= max * 0.68;
          const isFling = gestureState.dx > max * 0.35 && gestureState.vx > 0.45;

          if (max > 0 && (isFarEnough || isFling)) {
            // Success: smoothly glide thumb to completion
            Animated.timing(pan, {
              toValue: max,
              duration: 160,
              useNativeDriver: false,
            }).start(() => {
              setIsConfirmed(true);
              isConfirmedRef.current = true;
              try {
                Vibration.vibrate(35);
              } catch {
                // Ignore vibration on non-mobile web
              }
              onConfirmRef.current();
            });
          } else {
            // Spring back smoothly to origin with nice rubber-band damping
            Animated.spring(pan, {
              toValue: 0,
              friction: 8,
              tension: 50,
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(thumbScale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
          Animated.spring(pan, {
            toValue: 0,
            friction: 8,
            tension: 50,
            useNativeDriver: false,
          }).start();
        },
      }),
    [pan, thumbScale]
  );

  const thumbColor = color || colors.esiCrimson;
  const maxDrag = Math.max(1, containerWidth - thumbSize - padding * 2);

  // Dynamic progress fill follows thumb
  const progressWidth = pan.interpolate({
    inputRange: [0, maxDrag],
    outputRange: [thumbSize + padding * 2, Math.max(thumbSize + padding * 2, containerWidth)],
    extrapolate: 'clamp',
  });

  // Label text fades out cleanly under the thumb with subtle parallax
  const labelOpacity = pan.interpolate({
    inputRange: [0, maxDrag * 0.45],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const labelTranslateX = pan.interpolate({
    inputRange: [0, maxDrag * 0.6],
    outputRange: [0, 16],
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
          borderRadius: height / 2,
        },
      ]}
      onLayout={onLayout}>
      {/* Background track fill that expands with slide */}
      <Animated.View
        style={[
          styles.trackFill,
          {
            width: progressWidth,
            borderRadius: height / 2,
            backgroundColor: isConfirmed ? colors.emeraldSafeBg : colors.esiCrimsonBg,
          },
        ]}
      />

      {/* Guide chevrons in track background */}
      {!isConfirmed && (
        <View style={styles.trackGuideArrows} pointerEvents="none">
          <ChevronRight size={16} color={colors.textMuted} opacity={0.25} />
          <ChevronRight size={16} color={colors.textMuted} opacity={0.4} />
          <ChevronRight size={16} color={colors.textMuted} opacity={0.6} />
        </View>
      )}

      {/* Primary Slide Prompt Label */}
      {!isConfirmed && (
        <Animated.View
          style={[
            styles.labelContainer,
            {
              opacity: labelOpacity,
              transform: [{ translateX: labelTranslateX }],
            },
          ]}
          pointerEvents="none">
          <Text
            style={[
              styles.label,
              { color: colors.textPrimary },
            ]}>
            {label}
          </Text>
        </Animated.View>
      )}

      {/* Confirmed Status Label */}
      {isConfirmed && (
        <View style={styles.confirmedContainer} pointerEvents="none">
          <Text
            style={[
              styles.confirmedLabel,
              { color: colors.emeraldSafe },
            ]}>
            {confirmedLabel}
          </Text>
        </View>
      )}

      {/* Interactive Draggable Thumb */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: isConfirmed ? colors.emeraldSafe : thumbColor,
            shadowColor: isConfirmed ? colors.emeraldSafe : thumbColor,
            transform: [{ translateX: pan }, { scale: thumbScale }],
          },
        ]}>
        <View style={styles.thumbInner}>
          {isConfirmed ? (
            <Check size={26} color="#FFFFFF" strokeWidth={3.5} />
          ) : (
            <Animated.View style={{ transform: [{ translateX: chevronPulse }] }}>
              <ChevronsRight size={26} color="#FFFFFF" strokeWidth={2.6} />
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  trackGuideArrows: {
    position: 'absolute',
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: -4,
  },
  labelContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 44,
    paddingRight: 16,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  confirmedContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 50,
  },
  confirmedLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  thumb: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  thumbInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
