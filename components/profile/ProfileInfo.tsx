import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui';
import { UserProfileDto } from '@/dtos';
import { CircleTickIcon } from '@/components/shared/icons/Icons';
import { colors } from '@/styles/colors';

interface ProfileInfoProps {
  user: UserProfileDto;
  onEditBio?: () => void;
  isOwnProfile?: boolean;
}

export function ProfileInfo({
  user,
  onEditBio,
  isOwnProfile = true,
}: ProfileInfoProps) {
  return (
    <View className="px-4 mt-14">
      {/* Name & Verified */}
      <View className="flex-row items-center">
        <Text variant="title" className="text-2xl">
          {user.name || 'Unknown'}
        </Text>
        {user.verified && (
          <View className="ml-2">
            <CircleTickIcon size={20} color={colors.primary[100]} />
          </View>
        )}
      </View>

      {/* Bio */}
      <TouchableOpacity
        onPress={isOwnProfile ? onEditBio : undefined}
        activeOpacity={isOwnProfile ? 0.7 : 1}
        className="mt-2"
      >
        {user.bio ? (
          <Text variant="muted">{user.bio}</Text>
        ) : isOwnProfile ? (
          <Text variant="muted" className="italic">
            Add a bio...
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* Stats */}
      <View className="flex-row items-center gap-6 mt-4">
        <TouchableOpacity className="items-center">
          <Text className="font-bold text-lg">{user.postsCount}</Text>
          <Text variant="muted">Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="font-bold text-lg">{user.followersCount}</Text>
          <Text variant="muted">Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="font-bold text-lg">{user.followingCount}</Text>
          <Text variant="muted">Following</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}