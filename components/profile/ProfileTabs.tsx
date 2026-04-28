import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import { Text } from "@/components/ui";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ContentTabKey = "posts" | "photos" | "videos";

interface ProfileTabsProps {
  activeTab: ContentTabKey;
  onTabChange: (tab: ContentTabKey) => void;
  onFriendPress: () => void;
}

const TABS: {
  key: ContentTabKey | "friend";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFriendNav?: boolean;
}[] = [
  { key: "posts", label: "Post", icon: "grid-outline" },
  { key: "photos", label: "Image", icon: "image-outline" },
  { key: "videos", label: "Video", icon: "videocam-outline" },
];

export function ProfileTabs({
  activeTab,
  onTabChange,
  onFriendPress,
}: ProfileTabsProps) {
  const colorScheme = useColorScheme() ?? "light";
  const muted = colorScheme === "dark" ? "#A1A1AA" : "#9CA3AF";
  const activeColor = colorScheme === "dark" ? "#FAFAFA" : "#171717";

  return (
    <View className="mt-5 px-1">
      <View className="flex-row items-stretch border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((tab) => {
          const isFriend = tab.isFriendNav;
          const active = !isFriend && activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                if (isFriend) onFriendPress();
                else onTabChange(tab.key as ContentTabKey);
              }}
              className="flex-1 items-center pt-2 pb-2.5"
              activeOpacity={0.65}
            >
              <View
                className={`absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full ${
                  active ? "bg-neutral-900 dark:bg-white" : "bg-transparent"
                }`}
              />
              <Ionicons
                name={tab.icon}
                size={21}
                color={active ? activeColor : muted}
              />
              <Text
                className={`text-[11px] mt-1 ${
                  active
                    ? "text-neutral-900 dark:text-white font-semibold"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
