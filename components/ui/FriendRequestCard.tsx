import { ReactNode } from "react";
import {
  ImageSourcePropType,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "./Avatar";
import { AvatarStack } from "./AvatarStack";
import { Text } from "./Text";

interface FriendRequestCardProps {
  name: string;
  /** Ví dụ: "sent you friend request" */
  subtitle?: string;
  mutualCount?: number;
  /** URI avatar mutual (tối đa 3 hiển thị trong stack) */
  mutualAvatars?: string[];
  avatarSource?: ImageSourcePropType;
  onAccept?: () => void;
  onDecline?: () => void;
  acceptLabel?: string;
  declineLabel?: string;
  loading?: boolean;
  footerSlot?: ReactNode;
  className?: string;
}

/**
 * Card lời mời kết bạn theo mockup (dark/light qua token).
 */
export function FriendRequestCard({
  name,
  subtitle = "sent you friend request",
  mutualCount,
  mutualAvatars = [],
  avatarSource,
  onAccept,
  onDecline,
  acceptLabel = "Accept",
  declineLabel = "Decline",
  loading = false,
  footerSlot,
  className = "",
}: FriendRequestCardProps) {
  return (
    <View
      className={`rounded-xl p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark ${className}`}
    >
      <View className="flex-row">
        <Avatar source={avatarSource} fallback={name} size="md" className="mr-3" />
        <View className="flex-1 min-w-0">
          <Text className="text-base leading-5">
            <Text className="font-semibold text-text-light dark:text-text-dark">
              {name}
            </Text>
            <Text className="font-regular text-text-muted-light dark:text-text-muted-dark">
              {" "}
              {subtitle}
            </Text>
          </Text>

          {mutualCount != null && mutualCount > 0 ? (
            <View className="mt-3">
              <AvatarStack
                avatars={mutualAvatars}
                maxDisplay={3}
                size={24}
                label={`${mutualCount} mutual friends`}
              />
            </View>
          ) : null}
        </View>
      </View>

      {footerSlot ? (
        <View className="mt-4">{footerSlot}</View>
      ) : (
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={onAccept}
            disabled={loading || !onAccept}
            activeOpacity={0.85}
            className="flex-1 h-11 rounded-xl bg-primary-100 items-center justify-center disabled:opacity-50"
          >
            <Text className="font-semibold text-primary-foreground-light dark:text-primary-foreground-dark">
              {acceptLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDecline}
            disabled={loading || !onDecline}
            activeOpacity={0.85}
            className="flex-1 h-11 rounded-xl border-2 border-pill-light dark:border-pill-dark bg-transparent items-center justify-center"
          >
            <Text className="font-semibold text-text-light dark:text-text-dark">
              {declineLabel}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
