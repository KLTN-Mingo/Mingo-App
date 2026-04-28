import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui";
import { useTheme } from "@/context/ThemeContext";

interface NotificationBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onPress?: () => void;
  unreadCount?: number;
}

export function NotificationBadge({
  size = "md",
  showLabel = false,
  onPress,
  unreadCount = 0,
}: NotificationBadgeProps) {
  const { colorScheme } = useTheme();

  const iconSize = size === "sm" ? 22 : size === "md" ? 26 : 30;
  const badgeSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";
  const fontSize = size === "sm" ? "text-[9px]" : size === "md" ? "text-[10px]" : "text-xs";

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  const iconColor = colorScheme === "dark" ? "#EFE7DF" : "#1E2021";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-2"
      activeOpacity={0.7}
    >
      <View className="relative">
        <Ionicons name="notifications-outline" size={iconSize} color={iconColor} />
        {hasUnread && (
          <View
            className={`absolute -top-1 -right-1 rounded-full bg-red-500 ${badgeSize} items-center justify-center`}
          >
            <Text className={`text-white font-bold ${fontSize}`}>
              {displayCount}
            </Text>
          </View>
        )}
      </View>
      {showLabel && (
        <Text className="text-base" style={{ color: iconColor }}>
          Thông báo
        </Text>
      )}
    </TouchableOpacity>
  );
}
