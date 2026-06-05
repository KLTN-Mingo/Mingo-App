// Refactored: Reanimated shimmer skeleton primitive with exact layout variants.
import { useEffect } from "react";
import type { ViewStyle } from "react-native";
import { useColorScheme } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

import { paletteDark, paletteLight, palettePrimary, radius } from "@/constants/designTokens";
import { timing } from "@/src/theme/animations";

type SkeletonVariant = "rect" | "circle" | "text";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  borderRadius?: number;
  variant?: SkeletonVariant;
  className?: string;
  style?: ViewStyle;
}

const SHIMMER_START = -1;
const SHIMMER_END = 1;
const SHIMMER_DISTANCE = 160;

export function Skeleton({
  width = "100%",
  height = 20,
  radius: radiusProp,
  borderRadius,
  variant = "rect",
  className = "",
  style,
}: SkeletonProps) {
  const colorScheme = useColorScheme();
  const progress = useSharedValue(SHIMMER_START);
  const resolvedRadius =
    variant === "circle"
      ? typeof height === "number"
        ? height / 2
        : radius.full
      : radiusProp ?? borderRadius ?? (variant === "text" ? radius.sm : radius.md);
  const baseColor =
    colorScheme === "dark" ? paletteDark.surface : palettePrimary.lightMuted;
  const highlightColor =
    colorScheme === "dark" ? palettePrimary.dark : paletteLight.surfaceLight;

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(SHIMMER_END, {
        duration: timing.slow * 3,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [progress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * SHIMMER_DISTANCE }],
  }));

  return (
    <Animated.View
      className={twMerge("overflow-hidden", className)}
      style={[
        style,
        {
          width: width as ViewStyle["width"],
          height: height as ViewStyle["height"],
          borderRadius: resolvedRadius,
          backgroundColor: baseColor,
        },
      ]}
    >
      <Animated.View
        style={[
          {
            bottom: 0,
            position: "absolute",
            top: 0,
            width: SHIMMER_DISTANCE,
            backgroundColor: highlightColor,
            opacity: 0.45,
          },
          shimmerStyle,
        ]}
      />
    </Animated.View>
  );
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} variant="circle" />;
}

export function SkeletonText({
  width = "100%",
  height = 14,
}: {
  width?: number | string;
  height?: number;
}) {
  return <Skeleton width={width} height={height} variant="text" />;
}
