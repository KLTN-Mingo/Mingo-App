import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import { Text } from "@/components/ui";

interface SharedPostMessageCardProps {
  postId?: string;
  message?: string;
  isOwn?: boolean;
}

export function SharedPostMessageCard({
  postId,
  message,
  isOwn = false,
}: SharedPostMessageCardProps) {
  const router = useRouter();

  const openPost = () => {
    if (!postId) return;
    router.push(`/post/${postId}` as never);
  };

  return (
    <TouchableOpacity
      activeOpacity={postId ? 0.75 : 1}
      onPress={openPost}
      disabled={!postId}
      className={`rounded-xl px-3 py-3 ${
        isOwn ? "bg-white/15" : "bg-black/5 dark:bg-white/10"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className={`text-sm font-semibold ${
            isOwn ? "text-white" : "text-text-light dark:text-text-dark"
          }`}
        >
          Shared a post
        </Text>
        {postId ? (
          <Text
            className={`text-xs ${
              isOwn ? "text-white/70" : "text-text-muted-light dark:text-text-muted-dark"
            }`}
          >
            Open
          </Text>
        ) : null}
      </View>
      {message?.trim() ? (
        <Text
          numberOfLines={2}
          className={`mt-1 text-sm ${
            isOwn ? "text-white/90" : "text-text-light dark:text-text-dark"
          }`}
        >
          {message.trim()}
        </Text>
      ) : (
        <Text
          numberOfLines={1}
          className={`mt-1 text-xs ${
            isOwn ? "text-white/70" : "text-text-muted-light dark:text-text-muted-dark"
          }`}
        >
          Tap to view the shared post
        </Text>
      )}
    </TouchableOpacity>
  );
}
