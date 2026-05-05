import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { useColorScheme } from "@/hooks/use-color-scheme";

const illustrations = {
  light: require("../../../assets/images/CannotFound.png"),
  dark: require("../../../assets/images/CannotFoundDark.png"),
} as const;

export type EmptyStateAction = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
};

export type EmptyStateScreenProps = {
  title: string;
  subtitle?: string;
  actions?: EmptyStateAction[];
  className?: string;
};

export function EmptyStateScreen({
  title,
  subtitle,
  actions = [],
  className = "",
}: EmptyStateScreenProps) {
  const scheme = useColorScheme() ?? "light";
  const source = scheme === "dark" ? illustrations.dark : illustrations.light;

  return (
    <SafeAreaView
      className={`flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6 ${className}`}
    >
      <Image
        source={source}
        accessibilityIgnoresInvertColors
        className="h-56 w-56"
        resizeMode="contain"
      />
      <Text className="mt-4 text-center text-lg font-semibold text-text-light dark:text-text-dark">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-2 text-center text-base text-neutral-600 dark:text-neutral-400 px-2">
          {subtitle}
        </Text>
      ) : null}
      {actions.length > 0 ? (
        <View className="mt-6 w-full max-w-xs items-stretch gap-2">
          {actions.map((action, index) => {
            const isPrimary = action.variant !== "ghost";
            return (
              <TouchableOpacity
                key={`${action.label}-${index}`}
                onPress={action.onPress}
                className={
                  isPrimary
                    ? "bg-primary-400 px-6 py-3 rounded-xl items-center"
                    : "px-6 py-3 items-center"
                }
                activeOpacity={0.85}
              >
                <Text
                  className={
                    isPrimary
                      ? "text-white font-semibold"
                      : "text-primary-400 font-semibold"
                  }
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
