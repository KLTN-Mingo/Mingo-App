import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Avatar, Icon, Text } from '@/components/ui';
import { UserMinimalDto } from '@/dtos';

interface CreatePostButtonProps {
  user?: UserMinimalDto | null;
  onPress: () => void;
}

export function CreatePostButton({ user, onPress }: CreatePostButtonProps) {
  return (
    <View className="bg-background-light dark:bg-background-dark px-4 py-3">
      {/* Share input */}
      <View className="flex-row items-center gap-3">
        <Avatar
          source={user?.avatar ? { uri: user.avatar } : undefined}
          fallback={user?.name}
          size="md"
        />
        <TouchableOpacity
          onPress={onPress}
          className="flex-1 bg-surface-light dark:bg-surface-dark rounded-full px-4 py-3"
        >
          <Text variant="muted">Share something...</Text>
        </TouchableOpacity>
      </View>

      {/* Add to your post */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border-light dark:border-border-dark">
        <Text variant="muted">Add to your post</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity>
            <Icon name="music.note" size={22} color="#768D85" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="video" size={22} color="#768D85" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="photo" size={22} color="#768D85" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}