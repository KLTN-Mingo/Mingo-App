import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isValid, parseISO } from "date-fns";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/components/ui";
import { Gender, UserProfileDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ProfileInfoProps {
  user: UserProfileDto;
  isOwnProfile?: boolean;
}

function formatIsoDateDisplay(iso?: string): string | null {
  if (!iso?.trim()) return null;
  const d = parseISO(iso);
  if (!isValid(d)) return null;
  return format(d, "dd-MM-yyyy");
}

function genderDisplay(g?: Gender): string | null {
  if (g === Gender.MALE) return "Nam";
  if (g === Gender.FEMALE) return "Nữ";
  if (g === Gender.OTHER) return "Khác";
  return null;
}

const ICON_GREY_LIGHT = "#9CA3AF";
const ICON_GREY_DARK = "#A1A1AA";

const cardShadow = StyleSheet.create({
  wrap: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 14,
    },
    android: { elevation: 3 },
    default: {},
  }),
});

function InfoRow({
  icon,
  children,
  isLast,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center py-[14px] ${
        isLast ? "" : "S"
      }`}
    >
      <View className="w-11 items-center justify-center">{icon}</View>
      <View className="flex-1 min-w-0 pl-1">{children}</View>
    </View>
  );
}

export function ProfileInfo({
  user,
  isOwnProfile: _isOwnProfile = true,
}: ProfileInfoProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = colorScheme === "dark" ? ICON_GREY_DARK : ICON_GREY_LIGHT;

  const dob = formatIsoDateDisplay(user.dateOfBirth);
  const joined = formatIsoDateDisplay(user.createdAt);
  const gender = genderDisplay(user.gender);
  const email = user.email?.trim();
  const phone = user.phoneNumber?.trim();

  const rows: { key: string; icon: React.ReactNode; node: React.ReactNode }[] =
    [];

  if (phone) {
    rows.push({
      key: "phone",
      icon: <Ionicons name="call-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-[15px]">
          {phone}
        </Text>
      ),
    });
  }
  if (email) {
    rows.push({
      key: "email",
      icon: <Ionicons name="mail-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-[15px]">
          {email}
        </Text>
      ),
    });
  }
  if (dob) {
    rows.push({
      key: "dob",
      icon: (
        <MaterialCommunityIcons
          name="cake-variant-outline"
          size={22}
          color={iconColor}
        />
      ),
      node: (
        <Text className="text-[15px]">
          {dob}
        </Text>
      ),
    });
  }
  if (gender) {
    rows.push({
      key: "gender",
      icon: <Ionicons name="male-female-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-[15px] text-neutral-800 dark:text-neutral-100">
          {gender}
        </Text>
      ),
    });
  }
  if (joined) {
    rows.push({
      key: "joined",
      icon: <Ionicons name="calendar-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-[15px] text-neutral-800 dark:text-neutral-100">
          Joined {joined}
        </Text>
      ),
    });
  }

  return (
    <View className="mt-6 px-4">
      {/* Chỉ số — ngoài thẻ trắng (giống feed-style mockup) */}
      <View className="flex-row items-center justify-between px-2 pb-5">
        <TouchableOpacity className="flex-1 items-center py-1" activeOpacity={0.7}>
          <Text className="text-[18px] font-montserrat-bold text-neutral-900 dark:text-neutral-100">
            {user.postsCount}
          </Text>
          <Text className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Post
          </Text>
        </TouchableOpacity>
        <View className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
        <TouchableOpacity className="flex-1 items-center py-1" activeOpacity={0.7}>
          <Text className="text-[18px] font-montserrat-bold text-neutral-900 dark:text-neutral-100">
            {user.followersCount}
          </Text>
          <Text className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Followers
          </Text>
        </TouchableOpacity>
        <View className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
        <TouchableOpacity className="flex-1 items-center py-1" activeOpacity={0.7}>
          <Text className="text-[18px] font-montserrat-bold text-neutral-900 dark:text-neutral-100">
            {user.followingCount}
          </Text>
          <Text className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {rows.length > 0 ? (
        <View
          className="rounded-3xl bg-white dark:bg-neutral-900/90 px-3 border border-neutral-100 dark:border-neutral-800"
          style={cardShadow.wrap}
        >
          {rows.map((r, i) => (
            <InfoRow key={r.key} icon={r.icon} isLast={i === rows.length - 1}>
              {r.node}
            </InfoRow>
          ))}
        </View>
      ) : null}
    </View>
  );
}
