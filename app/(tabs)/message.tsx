import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatListItem } from "@/components/chat";
import { ActionInput, Avatar, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useChatContext } from "@/context/ChatContext";
import { ChatConversationDto, ConversationType } from "@/dtos";
import { useChatList } from "@/hooks/use-chat-list";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FriendOnlineItem, messageService } from "@/services/message.service";

// Old Mingo_App colors for matching list UI
const chatColors = {
  dark: {
    100: "#CFBFAD",
    200: "#252525",
    500: "#1E2021",
  },
  light: {
    100: "#1E2021",
    200: "#FFFFFF",
    500: "#FAFAFA",
  },
};

export default function MessageScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = colorScheme === "dark" ? chatColors.dark : chatColors.light;

  const { profile } = useAuth();
  const { filteredConversations, refetch, setSearchQuery } = useChatList();
  const router = useRouter();
  const { setConversations, setFilteredConversations } = useChatContext();
  const [friends, setFriends] = useState<FriendOnlineItem[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "groups">(
    "all"
  );

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setFriendsLoading(true);
        const data = await messageService.getFriendsWithOnlineStatus();
        const online = data.filter((f) => f.onlineStatus);
        const offline = data.filter((f) => !f.onlineStatus);
        const sorted = [...online, ...offline].slice(0, 10);
        setFriends(sorted);
      } catch (err) {
        console.error("loadFriends error:", err);
      } finally {
        setFriendsLoading(false);
      }
    };
    loadFriends();
    const interval = setInterval(loadFriends, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleFriendPress = async (friend: FriendOnlineItem) => {
    try {
      const { boxId, isNew } = await messageService.getOrCreateDirectBox(
        friend.id
      );

      if (isNew) {
        // boxId = friend.id (userId) khi isNew=true — box thật chưa tồn tại trên server
        // Tạo placeholder để ChatScreen hiển thị đúng tên/avatar
        const placeholder: ChatConversationDto = {
          id: boxId,
          type: ConversationType.DM,
          name: friend.name,
          avatarUrl: friend.avatar,
          updatedAt: new Date().toISOString(),
          participantIds: [friend.id],
          participants: [
            {
              id: friend.id,
              name: friend.name,
              avatar: friend.avatar,
              verified: friend.verified,
            },
          ],
          unreadCount: 0,
        };
        setConversations((prev) =>
          prev.find((c) => c.id === boxId) ? prev : [placeholder, ...prev]
        );
        setFilteredConversations((prev) =>
          prev.find((c) => c.id === boxId) ? prev : [placeholder, ...prev]
        );
      }

      router.push(`/chat/${boxId}`);
    } catch (err) {
      console.error("handleFriendPress error:", err);
    }
  };

  const unreadCount = filteredConversations.filter(
    (c) => (c.unreadCount ?? 0) > 0
  ).length;

  const TABS: { key: "all" | "unread" | "groups"; label: string }[] = [
    { key: "all", label: "All" },
    {
      key: "unread",
      label: `Unread${unreadCount > 0 ? ` ${unreadCount}` : ""}`,
    },
    { key: "groups", label: "Groups" },
  ];

  const getFiltered = () => {
    if (activeTab === "unread") {
      return filteredConversations.filter((c) => (c.unreadCount ?? 0) > 0);
    }
    if (activeTab === "groups") {
      return filteredConversations.filter(
        (c) => c.type === ConversationType.GROUP
      );
    }
    return filteredConversations;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setSearchQuery(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors[500] }}>
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1, backgroundColor: colors[500] }}
      >
        <View
          style={{
            paddingTop: Platform.OS === "android" ? 14 : 0,
            flex: 1,
          }}
        >
          {/* Header row: "Messages" */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              maxHeight: 64,
              backgroundColor: colors[200],
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Text
              style={{
                color: colors[100],
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Messages
            </Text>
          </View>

          {/* Search row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              paddingHorizontal: 8,
              paddingVertical: 8,
              backgroundColor: colors[500],
            }}
          >
            <View style={{ flex: 1 }}>
              <ActionInput
                placeholder="Search"
                value={searchText}
                onChangeText={handleSearchChange}
                returnKeyType="search"
                className="rounded-xl"
              />
            </View>
          </View>

          {/* Friends row */}
          {(friendsLoading || friends.length > 0) && (
            <View style={{ backgroundColor: colors[500] }}>
              {friendsLoading ? (
                <View style={{ paddingVertical: 14, alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#FFAABB" />
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 10,
                    paddingBottom: 12,
                    gap: 16,
                  }}
                >
                  {friends.map((friend) => (
                    <TouchableOpacity
                      key={friend.id}
                      onPress={() => handleFriendPress(friend)}
                      style={{ alignItems: "center", width: 56 }}
                      activeOpacity={0.7}
                    >
                      <View style={{ position: "relative" }}>
                        <Avatar
                          source={
                            friend.avatar ? { uri: friend.avatar } : undefined
                          }
                          fallback={
                            friend.name?.charAt(0)?.toUpperCase() ?? "?"
                          }
                          className="w-[52px] h-[52px]"
                        />
                        <View
                          style={{
                            position: "absolute",
                            bottom: 1,
                            right: 1,
                            width: 13,
                            height: 13,
                            borderRadius: 99,
                            backgroundColor: friend.onlineStatus
                              ? "#22C55E"
                              : "#6B7280",
                            borderWidth: 2,
                            borderColor: colors[500],
                          }}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 11,
                          marginTop: 5,
                          color: colors[100],
                          textAlign: "center",
                          maxWidth: 54,
                        }}
                      >
                        {friend.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <View
                style={{
                  height: 1,
                  backgroundColor:
                    colorScheme === "dark" ? "#2a2a2a" : "#EBEBEB",
                  marginHorizontal: 16,
                  marginBottom: 4,
                }}
              />
            </View>
          )}

          {/* Tab bar */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 12,
              paddingTop: 4,
              paddingBottom: 8,
              gap: 8,
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: isActive
                      ? colorScheme === "dark"
                        ? "#3a3a3a"
                        : "#1E2021"
                      : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? "600" : "400",
                      color: isActive ? "#FAFAFA" : "#92898A",
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={getFiltered()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatListItem conversation={item} currentUserId={profile?.id} />
            )}
            contentContainerStyle={{
              paddingBottom: 16,
              paddingHorizontal: 16,
            }}
            style={{ flex: 1, backgroundColor: colors[500] }}
            ListEmptyComponent={
              <View className="py-12 items-center">
                <Text variant="muted">No conversations yet</Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
