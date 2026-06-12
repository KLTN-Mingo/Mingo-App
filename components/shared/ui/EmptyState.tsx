import React from "react";
import { Image, View } from "react-native";
import { Icon, Text } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { paletteIcon } from "@/styles/colors";

const IMAGES = {
  light: require("../../../assets/images/CannotFound.png"),
  dark: require("../../../assets/images/CannotFoundDark.png"),
} as const;

interface EmptyStateProps {
  title: string;
  variant?: "illustration" | "compact";
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({
  title,
  variant = "illustration",
  action,
}: EmptyStateProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const imageSource = isDark ? IMAGES.dark : IMAGES.light;
  const containerClassName =
    variant === "compact"
      ? "flex-1 items-center justify-center px-6 py-8"
      : "flex-1 items-center justify-center px-6 py-12";

  return (
    <View className={containerClassName}>
      {variant === "compact" ? (
        <Icon
          name="bubble.left"
          size={40}
          color={isDark ? paletteIcon.darkMuted : paletteIcon.lightMuted}
        />
      ) : (
        <Image
          source={imageSource}
          style={{ width: 192, height: 192 }}
          resizeMode="contain"
          alt="Empty state"
        />
      )}
      <Text
        variant="muted"
        className={`text-center text-base mb-4 ${
          variant === "compact" ? "mt-3" : "mt-6"
        }`}
      >
        {title}
      </Text>
      {action && (
        <Button onPress={action.onPress}>
          {action.label}
        </Button>
      )}
    </View>
  );
}
