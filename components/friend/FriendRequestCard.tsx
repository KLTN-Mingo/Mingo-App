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
    <View className="flex-row items-start py-4 border-b border-border-light dark:border-border-dark">
      {/* Avatar */}
      <Avatar
        source={user.avatar ? { uri: user.avatar } : undefined}
        fallback={user.name}
        size="lg"
        className="mr-3"
      />

      {/* Content */}
      <View className="flex-1">
        {/* Name & Message */}
        <View className="flex-row flex-wrap">
          <Text className="font-bold text-text-light dark:text-text-dark">
            {user.name || 'Unknown'}
          </Text>
          <Text className="text-text-muted-light dark:text-text-muted-dark ml-1">
            sent you friend request
          </Text>
        </View>

        {/* Mutual Friends */}
        {mutualCount > 0 && (
          <View className="mt-1">
            <AvatarStack
              avatars={mutualAvatars}
              maxDisplay={3}
              size={18}
              label={`${mutualCount} mutual friends`}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row mt-3 gap-2">
          <Button
            variant="primary"
            size="sm"
            onPress={() => onAccept(id)}
            disabled={loading}
            className="flex-1"
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
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