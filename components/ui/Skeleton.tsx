import React, { useEffect, useRef } from 'react';
import { Animated, useColorScheme, ViewStyle } from 'react-native';

import { paletteDark, paletteLight, radius } from '@/constants/designTokens';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = radius.sm,
  className = '',
  style,
}: SkeletonProps) {
  const colorScheme = useColorScheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  const colors = colorScheme === 'dark' ? paletteDark : paletteLight;
  const baseColor = colorScheme === 'dark' ? '#4A4A4A' : colors.surfaceMuted;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={[
        style,
        {
          width: width as number | `${number}%`,
          height: height as number,
          borderRadius,
          opacity,
          backgroundColor: baseColor,
        },
      ]}
    />
  );
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

export function SkeletonText({
  width = '100%',
  height = 14,
}: {
  width?: number | string;
  height?: number;
}) {
  return <Skeleton width={width} height={height} borderRadius={radius.sm} />;
}
