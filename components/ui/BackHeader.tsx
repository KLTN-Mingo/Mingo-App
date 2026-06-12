import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewProps,
} from "react-native";
import { twMerge } from "tailwind-merge";

import { ArrowIcon } from "@/components/shared/icons/Icons";
import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { Text } from "./Text";

interface BackHeaderProps extends ViewProps {
  title?: string;
  onBackPress?: () => void;
  rightSlot?: ReactNode;
  disabled?: boolean;
  backButtonProps?: Omit<TouchableOpacityProps, "onPress" | "disabled">;
  titleClassName?: string;
}

export function BackHeader({
  title,
  children,
  onBackPress,
  rightSlot,
  disabled = false,
  backButtonProps,
  titleClassName,
  className,
  ...props
}: BackHeaderProps) {
  const { colorScheme } = useTheme();
  const semantic = getSemantic(colorScheme === "dark" ? "dark" : "light");

  return (
    <View
      className={twMerge("min-h-11 flex-row items-center", className)}
      {...props}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        {...backButtonProps}
        disabled={disabled}
        onPress={onBackPress ?? (() => router.back())}
        className={twMerge("mr-2", backButtonProps?.className)}
      >
        <ArrowIcon size={35} color={semantic.title} />
      </TouchableOpacity>

      <View className="min-w-0 flex-1">
        {children ??
          (title ? (
            <Text
              className={twMerge(
                "text-xl font-semibold leading-[28px] text-title-light dark:text-title-dark",
                titleClassName
              )}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null)}
      </View>

      {rightSlot ? (
        <View className="ml-3 flex-row items-center">{rightSlot}</View>
      ) : null}
    </View>
  );
}
