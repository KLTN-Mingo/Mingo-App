import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";

import {
  LogoutIcon,
  PenIcon,
  SaveIcon,
  SettingsIcon,
} from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";
import { colors } from "@/styles/colors";

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
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background-light dark:bg-background-dark rounded-t-3xl">
          <View className="items-center py-3">
            <View className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full" />
          </View>

          <Text variant="subtitle" className="text-center py-2">
            Settings
          </Text>

          <TouchableOpacity
            onPress={onEditProfile}
            className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
          >
            <PenIcon size={22} color={colors.primary[100]} />
            <Text className="ml-3">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenSavedPosts}
            className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
          >
            <SaveIcon size={22} color={colors.primary[100]} />
            <Text className="ml-3">Đã lưu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenAccountSettings}
            className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
          >
            <SettingsIcon size={22} color={colors.primary[100]} />
            <Text className="ml-3">Account Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onToggleTheme}
            className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
          >
            <Text className="flex-1 ml-3 font-semibold text-text-dark dark:text-text-light">
              {themeToggleLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onLogout}
            className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
          >
            <LogoutIcon size={22} color={logoutIconColor} />
            <Text className="ml-3 text-red-500">Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRequestClose}
            className="items-center py-4 mb-6"
          >
            <Text variant="muted">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
