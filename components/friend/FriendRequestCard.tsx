import { View } from 'react-native';

import { Avatar, AvatarStack, Button, Text } from '@/components/ui';
import { UserMinimalDto } from '@/dtos';


interface FriendRequestCardProps {
  id: string;
  user: UserMinimalDto;
  mutualFriends?: UserMinimalDto[];
  mutualCount?: number;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  loading?: boolean;
}

export function FriendRequestCard({
  id,
  user,
  mutualFriends = [],
  mutualCount = 0,
  onAccept,
  onDecline,
  loading = false,
}: FriendRequestCardProps) {
  const mutualAvatars = mutualFriends
    .filter((f) => f.avatar)
    .map((f) => f.avatar!);

  return (
    <View className="flex-row items-start px-4 py-5 bg-surface-light dark:bg-surface-dark rounded-lg mb-4">
      {/* Avatar */}
      <Avatar
        source={user.avatar ? { uri: user.avatar } : undefined}
        fallback={user.name}
        size="lg"
        className="mr-4"
      />

      {/* Content */}
      <View className="flex-1 gap-3">
        {/* Name & Message */}
        <View className="flex-row flex-wrap">
          <Text className="text-base font-bold text-text-light dark:text-text-dark">
            {user.name || 'Unknown'}{" "}
          </Text>
          <Text className="text-base text-text-secondary-light dark:text-text-secondary-dark">
            sent you friend request
          </Text>
        </View>

        {/* Mutual Friends */}
        {mutualCount > 0 && (
          <View className="">
            <AvatarStack
              avatars={mutualAvatars}
              maxDisplay={2}
              size={20}
              label={`${mutualCount} mutual friends`}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <Button
            variant="primary"
            size="md"
            onPress={() => onAccept(id)}
            disabled={loading}
            className="flex-1"
          >
            Accept
          </Button>
          <Button
            variant="secondary"
            size="md"
            onPress={() => onDecline(id)}
            disabled={loading}
            className="flex-1"
          >
            Decline
          </Button>
        </View>
      </View>
    </View>
  );
}
