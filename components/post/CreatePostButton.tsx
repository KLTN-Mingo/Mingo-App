import React from "react";
import { TouchableOpacity, View } from "react-native";

import { Avatar, Text } from "@/components/ui";
import { UserMinimalDto } from "@/dtos";
import { ImageIcon, MusicIcon, VideoIcon } from "@/components/shared/icons/Icons";

interface CreatePostButtonProps {
  user?: UserMinimalDto | null;
  onPress: () => void;
}

export function CreatePostButton({ user, onPress }: CreatePostButtonProps) {
  return (
    <View className="rounded-2xl bg-surface-dark px-3 py-3">
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
          className="h-11 flex-1 justify-center rounded-full bg-[#2D2F2F] px-4"
        >
          <Text className="text-[16px] leading-[20px] text-text-muted-dark">
            Share something...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add to your post */}
      <View className="mt-3 flex-row items-center justify-between border-t border-border-dark pt-3">
        <Text className="text-[15px] text-text-muted-dark">Add to your post</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="p-0.5">
            <MusicIcon size={20} color="#CFBFAD" />
          </TouchableOpacity>
          <TouchableOpacity className="p-0.5">
            <VideoIcon size={20} color="#CFBFAD" />
          </TouchableOpacity>
          <TouchableOpacity className="p-0.5">
            <ImageIcon size={20} color="#CFBFAD" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
