import React from "react";
import { TouchableOpacity, View } from "react-native";

import { Avatar, Icon, Text } from "@/components/ui";
import { UserMinimalDto } from "@/dtos";

interface CreatePostButtonProps {
  user?: UserMinimalDto | null;
  onPress: () => void;
}

export function CreatePostButton({ user, onPress }: CreatePostButtonProps) {
  return (
    <View className="rounded-2xl bg-white px-3 py-3">
      {/* Share input */}
      <View className="flex-row items-center gap-3">
        <Avatar
          source={user?.avatar ? { uri: user.avatar } : undefined}
          fallback={user?.name}
          size="md"
          className="h-10 w-10"
        />
        <TouchableOpacity
          onPress={onPress}
          className="h-11 flex-1 justify-center rounded-full bg-[#F1F3F2] px-4"
        >
          <Text className="text-[16px] leading-[20px] text-[#B2B7B5]">
            Share something...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add to your post */}
      <View className="mt-3 flex-row items-center justify-between border-t border-[#E8ECEA] pt-3">
        <Text className="text-[15px] text-[#515A57]">Add to your post</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="p-0.5">
            <Icon name="music.note" size={20} color="#2C3432" />
          </TouchableOpacity>
          <TouchableOpacity className="p-0.5">
            <Icon name="video" size={20} color="#2C3432" />
          </TouchableOpacity>
          <TouchableOpacity className="p-0.5">
            <Icon name="photo" size={20} color="#2C3432" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
