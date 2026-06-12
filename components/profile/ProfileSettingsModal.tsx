import React from "react";
import { Modal, StatusBar, TouchableOpacity, useColorScheme, View } from "react-native";

import {
  ActivityIcon,
  LockIcon,
  LogoutIcon,
  MoonIcon,
  PenIcon,
  SaveIcon,
  SunIcon,
} from "@/components/shared/icons/Icons";
import { SafeScreenView } from "@/components/containers/SafeLayout";
import { BackHeader, Text } from "@/components/ui";
import { paletteDark, paletteLight } from "@/constants/designTokens";

export type ProfileSettingsModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  onEditProfile: () => void;
  onOpenSavedPosts: () => void;
  onOpenAccountSettings: () => void;
  onOpenBlockedUsers?: () => void;
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
}

function MenuItem({ icon, label, onPress, isLogout }: MenuItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? paletteDark : paletteLight;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-5 py-3"
      style={{ backgroundColor: palette.background }}
    >
      <View className="w-10 h-10 items-center justify-center">
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
  onOpenBlockedUsers,
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
      <SafeScreenView style={{ backgroundColor: palette.background }}>
        <BackHeader
          title="Settings"
          onBackPress={onRequestClose}
          className="px-4"
        />

        <View className="">
          <MenuItem
            icon={<PenIcon size={22} color={iconColor} />}
            label="Edit Profile"
            onPress={onEditProfile}
          />

          <MenuItem
            icon={<SaveIcon size={22} color={iconColor} />}
            label="Saved Posts"
            onPress={onOpenSavedPosts}
          />

          {onOpenBlockedUsers ? (
            <MenuItem
              icon={<ActivityIcon size={22} color={iconColor} />}
              label="Blocked Users"
              onPress={onOpenBlockedUsers}
            />
          ) : null}

          <MenuItem
            icon={<LockIcon size={22} color={iconColor} />}
            label="Change Password"
            onPress={onOpenAccountSettings}
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
          />

          <View className="mt-6">
            <MenuItem
              icon={<LogoutIcon size={22} color={logoutIconColor} />}
              label="Log Out"
              onPress={onLogout}
              isLogout
            />
          </View>
        </View>
      </SafeScreenView>
    </Modal>
  );
}
