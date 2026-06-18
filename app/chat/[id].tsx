import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { InfoChat, MessageBubble, MessageInput } from "@/components/chat";
import { ScreenContainer } from "@/components/containers/ScreenContainer";
import {
  CallIcon,
  InfoIcon,
  VideoCallIcon,
} from "@/components/shared/icons/Icons";
import { Avatar, BackHeader, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import { useChatContext } from "@/context/ChatContext";
import {
  ChatConversationDto,
  ConversationType,
  MessageResponseDto,
} from "@/dtos";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  emitJoinBox,
  emitLeaveBox,
  emitMessageRead,
  emitTyping,
  subscribeMessageEvents,
} from "@/services/message-socket.service";
import { messageService } from "@/services/message.service";
import {
  colors,
  getSemantic,
  paletteIcon,
} from "@/styles/colors";

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
  const { profile } = useAuth();
  const {
    conversations,
    setConversations,
    setFilteredConversations,
    onlineUsers,
  } = useChatContext();
  const conversation = conversations.find((c) => c.id === id);
  const isGroup = conversation?.type === ConversationType.GROUP;
  const currentUserId = profile?.id;
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const semantic = getSemantic(colorScheme);
  const messagesBg = isDark ? colors.dark[300] : semantic.surface;
  const borderColor = isDark ? colors.dark[400] : colors.light[200];
  const headerTextColor = semantic.text;
  const iconColor = paletteIcon.lightMuted;
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
    appendMessage,
    replaceMessage,
    markMessageRevoked,
    editMessage,
    recallMessage,
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

  // ─── Socket realtime: join box, listen new/edit/recall, typing, online ──────
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const typingTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    if (!id) return;
    emitJoinBox(id);
    emitMessageRead(id);

    const unsubscribe = subscribeMessageEvents({
      onNewMessage: (msg) => {
        if (msg.conversationId !== id) return;
        appendMessage(msg);
        emitMessageRead(id);
      },
      onMessageUpdated: (msg) => {
        if (msg.conversationId !== id) return;
        replaceMessage(msg);
      },
      onMessageDeleted: ({ messageId, boxId }) => {
        if (boxId !== id) return;
        markMessageRevoked(messageId);
      },
      onTyping: ({ boxId, userId, isTyping }) => {
        if (boxId !== id) return;
        if (userId === currentUserId) return;
        setTypingUserIds((prev) => {
          const exists = prev.includes(userId);
          if (isTyping && !exists) {
            // Auto-clear sau 4s nếu không nhận tiếp tín hiệu.
            if (typingTimeoutsRef.current[userId])
              clearTimeout(typingTimeoutsRef.current[userId]);
            typingTimeoutsRef.current[userId] = setTimeout(() => {
              setTypingUserIds((p) => p.filter((u) => u !== userId));
              delete typingTimeoutsRef.current[userId];
            }, 4000);
            return [...prev, userId];
          }
          if (!isTyping && exists) {
            if (typingTimeoutsRef.current[userId]) {
              clearTimeout(typingTimeoutsRef.current[userId]);
              delete typingTimeoutsRef.current[userId];
            }
            return prev.filter((u) => u !== userId);
          }
          return prev;
        });
      },
    });

    return () => {
      emitLeaveBox(id);
      unsubscribe();
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [id, currentUserId, appendMessage, replaceMessage, markMessageRevoked]);

  // Throttle typing emit
  const lastTypingEmitRef = useRef(0);
  const handleTypingActivity = useCallback(() => {
    if (!id) return;
    const now = Date.now();
    if (now - lastTypingEmitRef.current < 1500) return;
    lastTypingEmitRef.current = now;
    emitTyping(id, true);
    setTimeout(() => emitTyping(id, false), 2500);
  }, [id]);

  const isReceiverOnline = receiverId ? onlineUsers.has(receiverId) : false;
  const isReceiverTyping = receiverId
    ? typingUserIds.includes(receiverId)
    : typingUserIds.length > 0;

  const handleBubbleLongPress = useCallback(
    (msg: MessageResponseDto) => {
      if (msg.isRevoked) return;
      Alert.alert("Messages", undefined, [
        {
          text: "Edit",
          onPress: () => {
            Alert.prompt(
              "Edit message",
              undefined,
              async (text) => {
                if (!text?.trim()) return;
                try {
                  await editMessage(msg.id, text.trim());
                } catch (err) {
                  Alert.alert(
                    "Error",
                    err instanceof Error ? err.message : "Could not edit"
                  );
                }
              },
              "plain-text",
              msg.content ?? ""
            );
          },
        },
        {
          text: "Recall",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Recall this message?",
              "This message will be deleted for everyone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Recall",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await recallMessage(msg.id);
                    } catch (err) {
                      Alert.alert(
                        "Error",
                        err instanceof Error
                          ? err.message
                          : "Could not recall"
                      );
                    }
                  },
                },
              ]
            );
          },
        },
        { text: "Close", style: "cancel" },
      ]);
    },
    [editMessage, recallMessage]
  );

  return (
    <ScreenContainer
      horizontalPadding="none"
      style={{ backgroundColor: semantic.background }}
    >
      {/* Header: back Arrow (accent), avatar 45x45, name — match old chats/[id].tsx */}
      <BackHeader
        className="px-3 py-2.5"
        rightSlot={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
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
        }
        style={{
          backgroundColor: semantic.background,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          shadowColor: "transparent",
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        }}
      >
        <View className="flex-row items-center gap-2">
            <Avatar
              source={
                conversation?.avatarUrl
                  ? { uri: conversation.avatarUrl }
                  : undefined
              }
              fallback={conversation?.name?.charAt(0)?.toUpperCase() ?? "?"}
              className="w-[45px] h-[45px]"
            />
            <View>
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
              <Text
                style={{
                  color: isReceiverTyping
                    ? semantic.primary
                    : isReceiverOnline
                      ? "#22C55E"
                      : semantic.placeholder,
                  fontSize: 11,
                }}
              >
                {isReceiverTyping
                  ? "Typing..."
                  : isReceiverOnline
                    ? "Active now"
                    : "Inactive"}
              </Text>
            </View>
        </View>
      </BackHeader>

      {searchVisible && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 8,
            backgroundColor: semantic.background,
            borderBottomWidth: 1,
            borderBottomColor: semantic.border,
          }}
        >
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search messages..."
            placeholderTextColor={semantic.placeholder}
            style={{
              flex: 1,
              fontSize: 14,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor,
              color: semantic.text,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setSearchVisible(false);
              setSearchQuery("");
              setSearchResults([]);
            }}
          >
            <Text style={{ color: semantic.primary, fontSize: 14 }}>
              Cancel
            </Text>
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
        onCategoryChange={(conversationId, category) => {
          const updateCategory = (list: ChatConversationDto[]) =>
            list.map((item) =>
              item.id === conversationId ? { ...item, category } : item
            );

          setConversations(updateCategory);
          setFilteredConversations(updateCategory);
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
                <View style={{ paddingVertical: 12, alignItems: "center" }}>
                  <Text
                    style={{
                      color: semantic.textMuted,
                      fontSize: 13,
                    }}
                  >
                    Loading older messages...
                  </Text>
                </View>
              ) : hasMore ? (
                <View style={{ paddingVertical: 12, alignItems: "center" }}>
                  <Text
                    style={{
                      color: semantic.textMuted,
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
                searchVisible && searchQuery.trim() ? searchResults : messages;
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
                  showSenderName={isGroup}
                  showDateSeparator={showDateSeparator}
                  dateLabel={formatDateLabel(item.createdAt)}
                  otherAvatarUrl={conversation?.avatarUrl}
                  onLongPress={
                    item.senderId === currentUserId
                      ? handleBubbleLongPress
                      : undefined
                  }
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
            onTypingActivity={handleTypingActivity}
            placeholder="Aa..."
          />
        </>
      )}
    </ScreenContainer>
  );
}
