import React from "react";
import { Image, View } from "react-native";
import { Text } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useColorScheme } from "@/hooks/use-color-scheme";

const IMAGES = {
  light: require("../../../assets/images/CannotFound.png"),
  dark: require("../../../assets/images/CannotFoundDark.png"),
} as const;

interface EmptyStateProps {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ title, action }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const imageSource = isDark ? IMAGES.dark : IMAGES.light;

  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Image
        source={imageSource}
        style={{ width: 192, height: 192 }}
        resizeMode="contain"
        alt="Empty state"
      />
      <Text
        variant="muted"
        className="text-center text-base mb-4 mt-6"
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
