import React from "react";
import { View } from "react-native";

import { Text } from "@/components/ui";
import { matchPresetHobby, resolveHobbyIcon } from "@/constants/hobbyCatalog";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ProfileHobbyChipProps = {
  label: string;
};

export function ProfileHobbyChip({ label }: ProfileHobbyChipProps) {
  const colorScheme = useColorScheme() ?? "light";
  const canonical = matchPresetHobby(label);
  const Icon = canonical ? resolveHobbyIcon(canonical) : null;
  if (!Icon || !canonical) return null;

  const iconColor =
    colorScheme === "dark" ? "rgba(229, 231, 235, 0.95)" : "#404040";

  return (
    <View className="flex-row items-center gap-1.5 rounded-full px-4 py-3 bg-component-light dark:bg-component-dark">
      <Icon size={16} color={iconColor} />
      <Text className="text-[13px] text-text-light dark:text-text-dark">
        {canonical}
      </Text>
    </View>
  );
}
