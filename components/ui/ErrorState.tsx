// Refactored: added reusable animated error state with tokenized retry action.
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { getSemantic } from "@/constants/designTokens";
import { useTheme } from "@/context/ThemeContext";
import { uiStrings } from "@/src/constants/strings";
import { Button } from "./Button";
import { Text } from "./Text";

interface ErrorStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
  icon?: ReactNode;
}

export function ErrorState({
  title,
  message,
  actionLabel = uiStrings.retryActionLabel,
  onRetry,
  icon,
}: ErrorStateProps) {
  const { colorScheme } = useTheme();
  const sem = getSemantic(colorScheme === "dark" ? "dark" : "light");

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      className="flex-1 items-center justify-center px-xxl py-xxl"
    >
      <View className="mb-lg h-14 w-14 items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark">
        {icon ?? (
          <Ionicons name="alert-circle-outline" size={28} color={sem.danger} />
        )}
      </View>
      <Text className="text-center font-jost text-xl text-danger-light dark:text-danger-dark">
        {title}
      </Text>
      {message ? (
        <Text className="mt-sm text-center font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Button className="mt-xl self-center" variant="secondary" onPress={onRetry}>
          {actionLabel}
        </Button>
      ) : null}
    </Animated.View>
  );
}
