import React, { useMemo } from "react";
import { Image, Text as RNText, TouchableOpacity, View } from "react-native";

import { CameraIcon } from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";
import { UserProfileDto } from "@/dtos";
import { colors } from "@/styles/colors";

const COVER_HEIGHT = 192;

function avatarInitials(name?: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface ProfileHeaderProps {
  user: UserProfileDto;
  onEditBackground?: () => void;
  onEditAvatar?: () => void;
  isOwnProfile?: boolean;
  onEditBio?: () => void;
}

export function ProfileHeader({
  user,
  onEditBackground,
  onEditAvatar,
  isOwnProfile = true,
  onEditBio,
}: ProfileHeaderProps) {
  const subtitleLine = useMemo(() => {
    const phone = user.phoneNumber?.trim();
    if (phone) return phone;
    const em = user.email?.trim();
    if (em) return em;
    if (user.verified) return "Đã xác minh";
    return null;
  }, [user.phoneNumber, user.email, user.verified]);

  return (
    <View className="px-4 pt-1">
      <TouchableOpacity
        onPress={isOwnProfile ? onEditBackground : undefined}
        activeOpacity={isOwnProfile ? 0.88 : 1}
        className="rounded-3xl overflow-hidden bg-neutral-200 dark:bg-primary-900/40"
      >
        {user.backgroundUrl ? (
          <Image
            source={{ uri: user.backgroundUrl }}
            className="w-full"
            style={{ height: COVER_HEIGHT }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-full bg-neutral-200 dark:bg-neutral-800"
            style={{ height: COVER_HEIGHT }}
          />
        )}
        {isOwnProfile && (
          <View className="absolute bottom-3 right-3 bg-black/40 rounded-full p-2">
            <CameraIcon size={18} color={colors.light[400]} />
          </View>
        )}
      </TouchableOpacity>

      <View className="flex-row items-end -mt-[52px]">
        <TouchableOpacity
          onPress={isOwnProfile ? onEditAvatar : undefined}
          activeOpacity={isOwnProfile ? 0.88 : 1}
          className="relative"
        >
          <View
            className="rounded-full border-[5px] border-neutral-100 dark:border-background-dark overflow-hidden bg-neutral-100 dark:bg-background-dark"
            style={{ width: 104, height: 104 }}
          >
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-primary-100 items-center justify-center">
                <RNText className="text-primary-600 text-[28px] font-montserrat-bold">
                  {avatarInitials(user.name)}
                </RNText>
              </View>
            )}
          </View>
          {isOwnProfile && (
            <View className="absolute bottom-1 right-1 bg-primary-500 rounded-full p-1.5 border-[3px] border-neutral-100 dark:border-background-dark">
              <CameraIcon size={14} color={colors.light[400]} />
            </View>
          )}
        </TouchableOpacity>

        <View className="flex-1 ml-3 mb-2 min-w-0 pb-0.5">
          {/* {subtitleLine ? (
            <Text
              className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-4"
              numberOfLines={1}
            >
              {subtitleLine}
            </Text>
          ) : null}
          <View className="flex-row items-center flex-wrap gap-1 mt-0.5">
            <Text
              className="text-text-light dark:text-text-dark font-montserrat-bold text-[19px] leading-6 flex-shrink"
              numberOfLines={2}
            >
              {user.name || "—"}
            </Text>
            {user.verified ? (
              <CircleTickIcon size={20} color={colors.primary[100]} />
            ) : null}
          </View> */}
          <TouchableOpacity
        onPress={isOwnProfile ? onEditBio : undefined}
        activeOpacity={isOwnProfile ? 0.75 : 1}
        className="mt-5"
      >
        {user.bio ? (
          <Text className="text-[14px] leading-[22px] text-neutral-700 dark:text-neutral-300">
            {user.bio}
          </Text>
        ) : isOwnProfile ? (
          <Text className="text-[14px] text-neutral-400 dark:text-neutral-500 italic">
            Thêm giới thiệu...
          </Text>
        ) : null}
      </TouchableOpacity>
        </View>
      </View>

      
    </View>
  );
}
