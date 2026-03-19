import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { InfoChat, MessageBubble, MessageInput } from "@/components/chat";
import {
  ArrowIcon,
  CallIcon,
  InfoIcon,
  VideoCallIcon,
} from "@/components/shared/icons/Icons";
import { Avatar, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import { useChatContext } from "@/context/ChatContext";
import { ConversationType } from "@/dtos";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useColorScheme } from "@/hooks/use-color-scheme";

const chatColors = {
  dark: { 100: "#CFBFAD", 300: "#515E5A", 500: "#1E2021" },
  light: { 500: "#FAFAFA" },
};

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { conversations, setConversations, setFilteredConversations } = useChatContext();
  const conversation = conversations.find((c) => c.id === id);
  const isGroup = conversation?.type === ConversationType.GROUP;
  const currentUserId = profile?.id;
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const messagesBg = isDark ? chatColors.dark[300] : chatColors.light[500];
  const headerTextColor = isDark ? chatColors.dark[100] : "#1E2021";
  const iconColor = isDark ? "#ffffff" : "#92898A";
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const { startVideoCall, startAudioCall } = useCall();
  const { messages, isLoading, error, sendMessage, sendFile, markAsRead } =
    useChatMessages(id, isGroup);
  const flatListRef = useRef<FlatList>(null);

  const roomId = id ?? "";
  const receiverId =
    conversation?.participantIds?.find((pid) => pid !== currentUserId) ??
    conversation?.participants?.find((p) => p.id !== currentUserId)?.id ??
    "";
  const receiverName = conversation?.name ?? "";
  const receiverAvatar = conversation?.avatarUrl ?? "";

  const handleVideoCall = () => {
    if (!receiverId) return;
    startVideoCall({
      roomId,
      receiverId,
      receiverName,
      receiverAvatar,
    });
  };

  const handleAudioCall = () => {
    if (!receiverId) return;

    startAudioCall({
      roomId,
      receiverId,
      receiverName,
      receiverAvatar,
    });
  };

  useEffect(() => {
    if (id) markAsRead();
  }, [id, markAsRead]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === "android" ? 14 : 52,
        backgroundColor: isDark ? chatColors.dark[500] : chatColors.light[500],
      }}
    >
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        {/* Header: back Arrow (#FFAABB), avatar 45x45, name — match old chats/[id].tsx */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            backgroundColor: isDark
              ? chatColors.dark[500]
              : chatColors.light[500],
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingTop: 8, paddingRight: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowIcon size={30} color="#FFAABB" />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingBottom: 8,
                paddingLeft: 8,
                gap: 8,
              }}
            >
              <Avatar
                source={
                  conversation?.avatarUrl
                    ? { uri: conversation.avatarUrl }
                    : undefined
                }
                fallback={conversation?.name?.charAt(0)?.toUpperCase() ?? "?"}
                className="w-[45px] h-[45px]"
              />
              <Text
                style={{
                  color: headerTextColor,
                  fontSize: 16,
                  fontWeight: "500",
                }}
                numberOfLines={1}
              >
                {conversation?.name ?? "Chat"}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              gap: 8,
            }}
          >
            <TouchableOpacity onPress={handleAudioCall}>
              <CallIcon size={28} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleVideoCall}>
              <VideoCallIcon size={30} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
              <InfoIcon size={30} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        <InfoChat
          visible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
          conversation={conversation ?? null}
          onDeleteChat={(conversationId) => {
            const next = conversations.filter((c) => c.id !== conversationId);
            setConversations(next);
            setFilteredConversations(next);
          }}
        />

        {/* Messages */}
        {error ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text variant="muted" className="text-center">
              {error}
            </Text>
          </View>
        ) : isLoading ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text variant="muted">Loading messages...</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              style={{ flex: 1, backgroundColor: messagesBg }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                paddingBottom: 8,
                flexGrow: 1,
              }}
              renderItem={({ item, index }) => {
                const prev = index > 0 ? messages[index - 1] : null;
                const prevDate = prev
                  ? new Date(prev.createdAt).toDateString()
                  : "";
                const currDate = new Date(item.createdAt).toDateString();
                const showDateSeparator = prevDate !== currDate;
                return (
                  <MessageBubble
                    message={item}
                    isOwn={item.senderId === currentUserId}
                    showDateSeparator={showDateSeparator}
                    dateLabel={formatDateLabel(item.createdAt)}
                    otherAvatarUrl={conversation?.avatarUrl}
                  />
                );
              }}
              ListEmptyComponent={
                <View className="py-12 items-center">
                  <Text variant="muted">No messages yet. Say hi!</Text>
                </View>
              }
            />
            <MessageInput
              onSend={sendMessage}
              onSendFile={sendFile}
              placeholder="Aa..."
            />
          </>
        )}
      </SafeAreaView>
    </View>
  );
}
