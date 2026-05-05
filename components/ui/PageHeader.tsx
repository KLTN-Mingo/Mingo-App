import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import { ArrowIcon } from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";
import { useTheme } from "@/context/ThemeContext";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  className?: string;
  showBorder?: boolean;
}

export function PageHeader({
  title,
  showBackButton = true,
  onBackPress,
  className = "",
  showBorder = true,
}: PageHeaderProps) {
  const { colorScheme } = useTheme();
  const iconColor = colorScheme === "dark" ? "#EFE7DF" : "#1E2021";

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`flex-row items-center${
        showBorder ? "border-b border-border-light dark:border-border-dark" : ""
      } ${className}`}
    >
      {/* Left - Back Button */}
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowIcon size={24} color={iconColor} />
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text
        className="text-lg font-semibold ml-2"
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}
