import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { Avatar, Icon, Text } from '@/components/ui';
import { UserMinimalDto } from '@/dtos';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { paletteIcon } from '@/styles/colors';

interface FriendCardProps {
  user: UserMinimalDto;
  isFriend?: boolean;
  isCloseFriend?: boolean;
  onPress?: () => void;
  onMorePress?: () => void;
}

export function FriendCard({
  user,
  isFriend = false,
  isCloseFriend = false,
  onPress,
  onMorePress,
}: FriendCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const verifiedIconColor = paletteIcon[colorScheme];
  const moreIconColor = paletteIcon.lightMuted;
  const handleUserPress = () => {
    if (!user.id) return;

    router.push(`/profile/${user.id}` as never);
  };
  const cardShadowStyle =
    colorScheme === "light"
      ? {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 17.5,
          elevation: 4,
        }
      : undefined;

  return (
    <View
      className="flex-row items-center px-4 py-4 mb-3 rounded-lg bg-white dark:bg-surface-dark"
      style={cardShadowStyle}
    >
      <TouchableOpacity
        onPress={handleUserPress}
        activeOpacity={0.7}
        className="flex-row items-center flex-1"
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
              <Icon name="star.fill" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Name */}
        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="font-bold text-text-light dark:text-text-dark">
              {user.name || 'Unknown'}
            </Text>
            {user.verified && (
              <Icon
                name="checkmark.seal.fill"
                size={16}
                color={verifiedIconColor}
                className="ml-1"
              />
            )}
          </View>
          {isFriend && !isCloseFriend ? (
            <Text variant="muted" className="text-xs">Friend</Text>
          ) : null}
          {isCloseFriend && (
            <Text variant="muted" className="text-xs">Best friend</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* More Button */}
      <TouchableOpacity onPress={onMorePress} className="p-2">
        <Icon name="ellipsis" size={20} color={moreIconColor} />
      </TouchableOpacity>
    </View>
  );
}
