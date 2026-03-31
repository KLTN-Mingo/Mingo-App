import { TouchableOpacity, View } from 'react-native';

import { Avatar, Icon, Text } from '@/components/ui';
import { UserMinimalDto } from '@/dtos';
import { colors } from '@/styles/colors';

interface FriendCardProps {
  user: UserMinimalDto;
  isCloseFriend?: boolean;
  onPress?: () => void;
  onMorePress?: () => void;
}

export function FriendCard({
  user,
  isCloseFriend = false,
  onPress,
  onMorePress,
}: FriendCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-3 border-b border-border-light dark:border-border-dark"
    >
      {/* Avatar with close friend indicator */}
      <View className="relative">
        <Avatar
          source={user.avatar ? { uri: user.avatar } : undefined}
          fallback={user.name}
          size="md"
        />
        {isCloseFriend && (
          <View className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5">
            <Icon name="star.fill" size={12} color={colors.light[400]} />
          </View>
        )}
      </View>

      {/* Name */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text className="font-semibold text-text-light dark:text-text-dark">
            {user.name || 'Unknown'}
          </Text>
          {user.verified && (
            <Icon
              name="checkmark.seal.fill"
              size={16}
              color={colors.primary[100]}
              className="ml-1"
            />
          )}
        </View>
        {isCloseFriend && (
          <Text variant="muted" className="text-xs">Best friend</Text>
        )}
      </View>

      {/* More Button */}
      <TouchableOpacity onPress={onMorePress} className="p-2">
        <Icon name="ellipsis" size={20} color={colors.dark[300]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}