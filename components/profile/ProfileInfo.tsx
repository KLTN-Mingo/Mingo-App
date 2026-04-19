import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isValid, parseISO } from "date-fns";
import React from "react";
import { View } from "react-native";

import { ProfileHobbyChip } from "@/components/profile/ProfileHobbyChip";
import {
  HobbyIcon,
} from "@/components/shared/icons/Icons";
import { Text } from "@/components/ui";
import { matchPresetHobby } from "@/constants/hobbyCatalog";
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
  if (g === Gender.PREFER_NOT_TO_SAY) return "Không tiết lộ";
  return null;
}

const ICON_GREY_LIGHT = "#9CA3AF";
const ICON_GREY_DARK = "#A1A1AA";

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-6 items-center justify-center">{icon}</View>
      <View className="flex-1 min-w-0">{children}</View>
    </View>
  );
}

function genderIcon(g: Gender | undefined, color: string) {
  if (g === Gender.FEMALE) {
    return <Ionicons name="female-outline" size={22} color={color} />;
  }
  if (g === Gender.MALE) {
    return <Ionicons name="male-outline" size={22} color={color} />;
  }
  return <Ionicons name="male-female-outline" size={22} color={color} />;
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
  const relationship = user.relationship?.trim();
  const work = user.work?.trim();
  const currentAddress = user.currentAddress?.trim();
  const hometown = user.hometown?.trim();
  const location =
    [...new Set([hometown, currentAddress].filter(Boolean))].join(", ") ||
    null;

  const hobbies = Array.from(
    new Set(
      (user.hobby ?? [])
        .map((h) => matchPresetHobby(h))
        .filter((x): x is string => x !== null)
    )
  );

  const rows: { key: string; icon: React.ReactNode; node: React.ReactNode }[] =
    [];

  if (location) {
    rows.push({
      key: "location",
      icon: <Ionicons name="location-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-4 text-text-light dark:text-text-dark">
          {location}
        </Text>
      ),
    });
  }
  if (work) {
    rows.push({
      key: "work",
      icon: <Ionicons name="briefcase-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-4 text-text-light dark:text-text-dark">
          {work}
        </Text>
      ),
    });
  }
  if (relationship) {
    rows.push({
      key: "relationship",
      icon: <Ionicons name="heart-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-4 text-text-light dark:text-text-dark">
          {relationship}
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
        <Text className="text-4 text-text-light dark:text-text-dark">
          {dob}
        </Text>
      ),
    });
  }
  if (gender) {
    rows.push({
      key: "gender",
      icon: genderIcon(user.gender, iconColor),
      node: (
        <Text className="text-4 text-text-light dark:text-text-dark">
          {gender}
        </Text>
      ),
    });
  }
  if (email) {
    rows.push({
      key: "email",
      icon: <Ionicons name="mail-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-4 text-text-light dark:text-text-dark">
          {email}
        </Text>
      ),
    });
  }
  if (joined) {
    rows.push({
      key: "joined",
      icon: <Ionicons name="calendar-outline" size={22} color={iconColor} />,
      node: (
        <Text className="text-4 text-text-light dark:text-text-dark">
          {joined}
        </Text>
      ),
    });
  }

  const showInformationBlock = rows.length > 0 || hobbies.length > 0;

  return (
    <View className="">
      {/* <View className="flex-row items-center justify-between gap-5 mb-6 bg-sheet-light dark:bg-sheet-dark rounded-[12px]">
        <ProfileStatItem value={user.postsCount} label="Post" />
        <ProfileStatItem value={user.followersCount} label="Followers" />
        <ProfileStatItem value={user.followingCount} label="Following" />
      </View> */}

      {showInformationBlock ? (
        <>
        <Text className="text-4 font-semibold text-neutral-600 dark:text-neutral-300 mb-3">
              Information
            </Text>
          <View className="rounded-2xl bg-sheet-light dark:bg-sheet-dark py-5 px-6 gap-4">
            

            {rows.length > 0 ? (
              <View className="gap-4">
                {rows.map((r) => (
                  <InfoRow key={r.key} icon={r.icon}>
                    {r.node}
                  </InfoRow>
                ))}
              </View>
            ) : null}

            {hobbies.length > 0 ? (
              <View className="gap-4 flex-row">
                <HobbyIcon size={22} color={iconColor} />
                <View className="flex-row flex-wrap gap-2">
                  {hobbies.map((h) => (
                    <ProfileHobbyChip key={h} label={h} />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </>


      ) : null}
    </View>
  );
}
