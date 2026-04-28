import React from "react";
import { Modal, StatusBar, TouchableOpacity, useColorScheme, View } from "react-native";
// import { Modal, TouchableOpacity, View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
import { Text } from "@/components/ui";
import { colors, getSemantic, getStatusColor, paletteIcon } from "@/styles/colors";

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
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-5 py-3"
    >
      <View className="w-10 h-10 items-center justify-center rounded-full bg-primary-light/10 dark:bg-primary-dark/20">
        {icon}
      </View>
      <Text
        className={`ml-4 text-base ${isLogout ? "text-red-500" : "text-text-light dark:text-text-dark"}`}
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
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? paletteIcon.dark : paletteIcon.light;
  const textColor = isDark ? colors.dark.textPrimary : colors.light.textPrimary;
  const isDarkMode = themeToggleLabel.includes("Dark");

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onRequestClose}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <View
          className="bg-white dark:bg-background-dark"
          style={{ paddingTop: insets.top }}
        >
          <View className="flex-row items-center px-4 py-4">
            <TouchableOpacity onPress={onRequestClose} className="p-2 -ml-2">
              <ArrowLeftIcon size={24} color={textColor} />
            </TouchableOpacity>
            <Text variant="subtitle" className="flex-1 text-center pr-8 text-text-light dark:text-text-dark">
              Cài đặt
            </Text>
          </View>
        </View>

        <View className="">
          <MenuItem
            icon={<PenIcon size={22} color={iconColor} />}
            label="Chỉnh sửa trang cá nhân"
            onPress={onEditProfile}
            iconColor={iconColor}
          />

          <MenuItem
            icon={<SaveIcon size={22} color={iconColor} />}
            label="Khu lưu trữ"
            onPress={onOpenSavedPosts}
            iconColor={iconColor}
          />

          <MenuItem
            icon={<ActivityIcon size={22} color={iconColor} />}
            label="Hoạt động"
            onPress={() => {}}
            iconColor={iconColor}
          />

          <MenuItem
            icon={<LockIcon size={22} color={iconColor} />}
            label="Đổi mật khẩu"
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
              label="Đăng xuất"
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
