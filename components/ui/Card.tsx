// Refactored: added a token-driven animated card primitive for reusable surfaces.
import type { ReactNode } from "react";
import type { AccessibilityRole, PressableProps, ViewProps } from "react-native";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

import { spring } from "@/src/theme/animations";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CARD_PRESSED_SCALE = 0.98;
const CARD_REST_SCALE = 1;

type CardProps = ViewProps &
  Pick<PressableProps, "onPress" | "onLongPress" | "disabled"> & {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    accessibilityLabel?: string;
    accessibilityRole?: AccessibilityRole;
  };

export function Card({
  children,
  className,
  contentClassName,
  onPress,
  onLongPress,
  disabled,
  accessibilityLabel,
  accessibilityRole,
  ...viewProps
}: CardProps) {
  const scale = useSharedValue(CARD_REST_SCALE);
  const interactive = Boolean(onPress || onLongPress);
  const isDisabled = Boolean(disabled);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!interactive) {
    return (
      <View
        className={twMerge(
          "overflow-hidden rounded-lg border border-border-subtle-light bg-surface-elevated-light dark:border-border-dark dark:bg-surface-elevated-dark",
          className
        )}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        {...viewProps}
      >
        <View className={contentClassName}>{children}</View>
      </View>
    );
  }

  return (
    <AnimatedPressable
      className={twMerge(
        "min-h-11 overflow-hidden rounded-lg border border-border-subtle-light bg-surface-elevated-light dark:border-border-dark dark:bg-surface-elevated-dark",
        isDisabled ? "opacity-40" : "",
        className
      )}
      disabled={isDisabled}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(CARD_PRESSED_SCALE, spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(CARD_REST_SCALE, spring.snappy);
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={{ disabled: isDisabled }}
      style={animatedStyle}
    >
      <View className={contentClassName}>{children}</View>
    </AnimatedPressable>
  );
}
