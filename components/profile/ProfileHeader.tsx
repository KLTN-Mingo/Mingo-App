import React from 'react';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/components/ui';
import { UserProfileDto } from '@/dtos';
import { CameraIcon } from '@/components/shared/icons/Icons';
import { colors } from '@/styles/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKGROUND_HEIGHT = 180;

interface ProfileHeaderProps {
  user: UserProfileDto;
  onEditBackground?: () => void;
  onEditAvatar?: () => void;
  isOwnProfile?: boolean;
}

export function ProfileHeader({
  user,
  onEditBackground,
  onEditAvatar,
  isOwnProfile = true,
}: ProfileHeaderProps) {
  return (
    <View className="relative">
      {/* Background Image */}
      <TouchableOpacity
        onPress={isOwnProfile ? onEditBackground : undefined}
        activeOpacity={isOwnProfile ? 0.8 : 1}
      >
        {user.backgroundUrl ? (
          <Image
            source={{ uri: user.backgroundUrl }}
            style={{ width: SCREEN_WIDTH, height: BACKGROUND_HEIGHT }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="bg-primary-200"
            style={{ width: SCREEN_WIDTH, height: BACKGROUND_HEIGHT }}
          />
        )}
        {isOwnProfile && (
          <View className="absolute bottom-2 right-2 bg-black/50 rounded-full p-2">
            <CameraIcon size={18} color={colors.light[400]} />
          </View>
        )}
      </TouchableOpacity>

      {/* Avatar */}
      <View className="absolute -bottom-12 left-4">
        <TouchableOpacity
          onPress={isOwnProfile ? onEditAvatar : undefined}
          activeOpacity={isOwnProfile ? 0.8 : 1}
          className="relative"
        >
          <View className="border-4 border-background-light dark:border-background-dark rounded-full">
            <Avatar
              source={user.avatar ? { uri: user.avatar } : undefined}
              fallback={user.name}
              size="xl"
            />
          </View>
          {isOwnProfile && (
            <View className="absolute bottom-0 right-0 bg-primary-400 rounded-full p-1.5">
              <CameraIcon size={16} color={colors.light[400]} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}