import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ProfileStatItemProps = {
  value: number;
  label: string;
  onPress?: () => void;
};

export function ProfileStatItem({
  value,
  label,
  onPress,
}: ProfileStatItemProps) {
  const inner = (
    <>
      <Text className="text-[18px] font-montserrat-bold text-text-light dark:text-text-dark">
        {value}
      </Text>
      <Text className="text-[12px] text-text-light dark:text-text-dark mt-0.5">
        {label}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        className="flex-1 items-center py-3 bg-sheet-light dark:bg-sheet-dark rounded-[12px]  border-border-light dark:border-border-dark"
        activeOpacity={0.7}
        onPress={onPress}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 items-center py-3 bg-sheet-light dark:bg-sheet-dark rounded-[12px]  border-border-light dark:border-border-dark">
      {inner}
    </View>
  );
}