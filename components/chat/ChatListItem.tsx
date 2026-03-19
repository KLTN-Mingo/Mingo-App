import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import { Avatar, Text } from "@/components/ui";
import { ChatConversationDto } from "@/dtos";

interface ChatListItemProps {
  conversation: ChatConversationDto;
}

function formatTime(updatedAt: string): string {
  const date = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getLastMessagePreview(conversation: ChatConversationDto): string {
  const last = conversation.lastMessage;
  if (!last) return "No messages yet";
  if (last.isRevoked) return "Message unsent";
  if (last.content && last.content.trim()) return last.content;
  if (last.attachment?.type) return `Sent ${last.attachment.type}`;
  return "Message";
}

export function ChatListItem({ conversation }: ChatListItemProps) {
  const router = useRouter();
  const preview = getLastMessagePreview(conversation);
  const timeStr = formatTime(conversation.updatedAt);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${conversation.id}`)}
      className="flex-row items-center border-b border-border-light dark:border-border-dark px-4 py-3 bg-surface-light dark:bg-surface-dark"
    >
      <Avatar
        source={
          conversation.avatarUrl
            ? { uri: conversation.avatarUrl }
            : undefined
        }
        fallback={conversation.name?.charAt(0)?.toUpperCase() || "?"}
        size="lg"
      />
      <View className="flex-1 ml-3 min-w-0">
        <View className="flex-row items-center justify-between">
          <Text
            variant="semibold"
            numberOfLines={1}
            className="flex-1"
          >
            {conversation.name || "Unknown"}
          </Text>
          <Text variant="muted" className="text-xs ml-2">
            {timeStr}
          </Text>
        </View>
        <Text
          variant="muted"
          numberOfLines={1}
          className="mt-0.5 text-sm"
        >
          {preview}
        </Text>
      </View>
      {conversation.unreadCount != null && conversation.unreadCount > 0 && (
        <View className="w-5 h-5 rounded-full bg-primary-400 items-center justify-center ml-2">
          <Text className="text-xs text-white font-semibold">
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
