import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import { Avatar, Text } from "@/components/ui";
import { ChatConversationDto, ConversationType } from "@/dtos";

interface ChatListItemProps {
  conversation: ChatConversationDto;
  currentUserId?: string;
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

function getSenderName(
  conversation: ChatConversationDto,
  senderId: string | undefined
): string {
  if (!senderId) return "";
  const participant = conversation.participants?.find(
    (p) => p.id === senderId
  );
  return participant?.name ?? "";
}

function getLastMessagePreview(
  conversation: ChatConversationDto,
  currentUserId?: string
): string {
  const last = conversation.lastMessage;
  if (!last) return "No messages yet";
  if (last.isRevoked) return "Message unsent";
  if (last.content && last.content.trim()) return last.content;
  if (last.attachment?.type) return `Sent ${last.attachment.type}`;
  return "Message";
}

function getLastMessagePrefix(
  conversation: ChatConversationDto,
  currentUserId?: string
): string {
  const last = conversation.lastMessage;
  if (!last || last.isRevoked) return "";

  const isOwn = last.senderId === currentUserId;
  const isGroup = conversation.type === ConversationType.GROUP;

  if (isOwn) return "You: ";

  if (!isGroup) return "";

  const senderName =
    last.sender?.name ?? getSenderName(conversation, last.senderId);
  const firstName = senderName.split(" ")[0];
  return firstName ? `${firstName}: ` : "";
}

export function ChatListItem({
  conversation,
  currentUserId,
}: ChatListItemProps) {
  const router = useRouter();
  const preview = getLastMessagePreview(conversation, currentUserId);
  const prefix = getLastMessagePrefix(conversation, currentUserId);
  const timeStr = formatTime(conversation.updatedAt);
  const showOnlineDot =
    conversation.unreadCount == null ? true : conversation.unreadCount >= 0;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${conversation.id}`)}
      className="flex-row items-center px-4 py-3"
    >
      <View className="relative">
        <Avatar
          source={
            conversation.avatarUrl ? { uri: conversation.avatarUrl } : undefined
          }
          fallback={conversation.name?.charAt(0)?.toUpperCase() || "?"}
          size="lg"
        />
        {showOnlineDot ? (
          <View className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-background-light dark:border-background-dark" />
        ) : null}
      </View>

      <View className="flex-1 ml-3 min-w-0">
        <View className="flex-row items-center justify-between">
          <Text
            variant="semibold"
            numberOfLines={1}
            className="flex-1 text-text-light dark:text-text-dark text-lg leading-6"
          >
            {conversation.name || "Unknown"}
          </Text>
          <Text
            variant="muted"
            className="text-xs ml-2 text-text-muted-light dark:text-text-muted-dark"
          >
            {timeStr}
          </Text>
        </View>
        <Text
          variant="muted"
          numberOfLines={1}
          className="mt-0.5 text-sm text-text-light dark:text-text-dark"
        >
          {prefix}
          {preview}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
