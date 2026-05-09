import React from "react";
import { Modal, StatusBar, TouchableOpacity, useColorScheme, View } from "react-native";

import {
  ActivityIcon,
  ArrowLeftIcon,
  LockIcon,
  LogoutIcon,
  MoonIcon,
  PenIcon,
  SaveIcon,
  SunIcon,
} from "@/components/shared/icons/Icons";
import { ScreenHeader, Text } from "@/components/ui";
import { paletteDark, paletteLight } from "@/constants/designTokens";
import { paletteIcon } from "@/styles/colors";

export type ProfileSettingsModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  onEditProfile: () => void;
  onOpenSavedPosts: () => void;
  onOpenAccountSettings: () => void;
  themeToggleLabel: string;
  onToggleTheme: () => void;
  logoutIconColor: string;
  onLogout: () => void;
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isLogout?: boolean;
  iconColor: string;
}

function MenuItem({ icon, label, onPress, isLogout, iconColor }: MenuItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? paletteDark : paletteLight;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-5 py-3"
      style={{ backgroundColor: palette.background }}
    >
      <View
        className="w-10 h-10 items-center justify-center rounded-full"
        style={{ backgroundColor: isDark ? "rgba(230, 58, 71, 0.15)" : "rgba(230, 58, 71, 0.1)" }}
      >
        {icon}
      </View>
      <Text
        className={`ml-4 text-base ${isLogout ? "text-red-500" : ""}`}
        style={{ color: isLogout ? "#EF4444" : palette.textPrimary }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function ProfileSettingsModal({
  visible,
  onRequestClose,
  onEditProfile,
  onOpenSavedPosts,
  onOpenAccountSettings,
  themeToggleLabel,
  onToggleTheme,
  logoutIconColor,
  onLogout,
}: ProfileSettingsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? paletteDark : paletteLight;

  const iconColor = palette.textSecondary;
  const isDarkMode = themeToggleLabel.includes("Dark");

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onRequestClose}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View className="flex-1" style={{ backgroundColor: palette.background }}>
        <ScreenHeader
          title="Settings"
          leftSlot={
            <TouchableOpacity onPress={onRequestClose} className="p-2 -ml-2">
              <ArrowLeftIcon size={24} color={palette.textPrimary} />
            </TouchableOpacity>
          }
        />

        <View className="">
          <MenuItem
            icon={<PenIcon size={22} color={iconColor} />}
            label="Edit Profile"
            onPress={onEditProfile}
            iconColor={iconColor}
          />

          <MenuItem
            icon={<SaveIcon size={22} color={iconColor} />}
            label="Saved Posts"
            onPress={onOpenSavedPosts}
            iconColor={iconColor}
          />

          <MenuItem
            icon={<ActivityIcon size={22} color={iconColor} />}
            label="Activity"
            onPress={() => {}}
            iconColor={iconColor}
          />

          <MenuItem
            icon={<LockIcon size={22} color={iconColor} />}
            label="Change Password"
            onPress={onOpenAccountSettings}
            iconColor={iconColor}
          />

          <MenuItem
            icon={
              isDarkMode ? (
                <SunIcon size={22} color={iconColor} />
              ) : (
                <MoonIcon size={22} color={iconColor} />
              )
            }
            label={themeToggleLabel}
            onPress={onToggleTheme}
            iconColor={iconColor}
          />

          <View className="mt-6">
            <MenuItem
              icon={<LogoutIcon size={22} color={logoutIconColor} />}
              label="Log Out"
              onPress={onLogout}
              isLogout
              iconColor={logoutIconColor}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
