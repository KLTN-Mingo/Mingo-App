import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  TextInput,
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
import { ChatConversationDto, ConversationType, MessageResponseDto } from "@/dtos";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { messageService } from "@/services/message.service";

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
  const { conversations, setConversations, setFilteredConversations } =
    useChatContext();
  const conversation = conversations.find((c) => c.id === id);
  const isGroup = conversation?.type === ConversationType.GROUP;
  const currentUserId = profile?.id;
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const messagesBg = isDark ? chatColors.dark[300] : chatColors.light[500];
  const headerTextColor = isDark ? chatColors.dark[100] : "#1E2021";
  const iconColor = isDark ? "#ffffff" : "#92898A";
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MessageResponseDto[]>([]);
  const [searching, setSearching] = useState(false);

  const { startVideoCall, startAudioCall } = useCall();
  const handleMessageSent = useCallback(
    (newMsg: MessageResponseDto) => {
      const updateConv = (list: ChatConversationDto[]) =>
        list.map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            updatedAt: newMsg.createdAt,
            lastMessage: {
              id: newMsg.id,
              conversationId: id ?? "",
              senderId: newMsg.senderId,
              content: newMsg.content ?? "",
              createdAt: newMsg.createdAt,
              isRevoked: false,
              readBy: newMsg.readBy ?? [],
              attachment: newMsg.attachment,
            },
            unreadCount: 0,
          };
        });

      setConversations((prev) => updateConv(prev));
      setFilteredConversations((prev) => updateConv(prev));
    },
    [id, setConversations, setFilteredConversations]
  );
  const {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sendMessage,
    sendFile,
    markAsRead,
    loadMore,
  } = useChatMessages(id, isGroup, handleMessageSent);
  const flatListRef = useRef<FlatList>(null);
  const lastMessageIdRef = useRef<string>("");
  const initialScrollDoneRef = useRef(false);

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

  // Scroll lần đầu sau khi load xong
  useEffect(() => {
    if (isLoading) return;
    if (initialScrollDoneRef.current) return;
    if (messages.length === 0) return;

    initialScrollDoneRef.current = true;
    const lastMsg = messages[messages.length - 1];
    lastMessageIdRef.current = lastMsg.id;

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 300);
  }, [isLoading, messages]);

  // Scroll khi có tin nhắn mới sau lần đầu
  useEffect(() => {
    if (!initialScrollDoneRef.current) return;
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.id !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastMsg.id;
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      if (offsetY < 50 && hasMore && !isLoadingMore) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, loadMore]
  );

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim() || !id) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await messageService.searchMessages(id, q.trim());
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
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

        {searchVisible && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              gap: 8,
              backgroundColor: isDark
                ? chatColors.dark[500]
                : chatColors.light[500],
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#333" : "#E5E7EB",
            }}
          >
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search messages..."
              placeholderTextColor={isDark ? "#888" : "#92898A"}
              style={{
                flex: 1,
                fontSize: 14,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: isDark ? "#444" : "#E5E7EB",
                color: isDark ? "#CFBFAD" : "#1E2021",
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setSearchVisible(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Text style={{ color: "#FFAABB", fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <InfoChat
          visible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
          conversation={conversation ?? null}
          onDeleteChat={(conversationId) => {
            const next = conversations.filter((c) => c.id !== conversationId);
            setConversations(next);
            setFilteredConversations(next);
          }}
          onOpenSearch={() => setSearchVisible(true)}
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
              data={
                searchVisible && searchQuery.trim() ? searchResults : messages
              }
              keyExtractor={(item) => item.id}
              style={{ flex: 1, backgroundColor: messagesBg }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                paddingBottom: 8,
                flexGrow: 1,
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              ListHeaderComponent={
                isLoadingMore ? (
                  <View
                    style={{ paddingVertical: 12, alignItems: "center" }}
                  >
                    <Text
                      style={{
                        color: isDark ? "#888" : "#92898A",
                        fontSize: 13,
                      }}
                    >
                      Loading older messages...
                    </Text>
                  </View>
                ) : hasMore ? (
                  <View
                    style={{ paddingVertical: 12, alignItems: "center" }}
                  >
                    <Text
                      style={{
                        color: isDark ? "#888" : "#92898A",
                        fontSize: 13,
                      }}
                    >
                      Scroll up for older messages
                    </Text>
                  </View>
                ) : null
              }
              renderItem={({ item, index }) => {
                const source =
                  searchVisible && searchQuery.trim()
                    ? searchResults
                    : messages;
                const prev = index > 0 ? source[index - 1] : null;
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
                  <Text variant="muted">
                    {searchVisible && searchQuery.trim()
                      ? searching
                        ? "Searching..."
                        : "No results found"
                      : "No messages yet. Say hi!"}
                  </Text>
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
