import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  TextInput,
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

const CATEGORY_LABELS: Record<string, string> = {
  friends: "Friends",
  family: "Family",
  work: "Work",
  other: "Other",
  uncategorized: "Uncategorized",
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

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

  const toggleSelectMember = (friendId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroupSubmit = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter group name");
      return;
    }
    if (selectedMemberIds.length === 0) {
      Alert.alert("Error", "Please select at least one friend to add");
      return;
    }

    try {
      setCreatingGroup(true);
      const response = await messageService.createGroup(profile?.id || "", {
        groupName: groupName.trim(),
        membersIds: selectedMemberIds,
        category: "other",
      });

      if (response && response.box) {
        setIsModalOpen(false);
        setGroupName("");
        setSelectedMemberIds([]);
        await refetch();
        router.push(`/chat/${response.box._id || response.box.id}`);
      }
    } catch (err: any) {
      console.error("handleCreateGroupSubmit error:", err);
      Alert.alert("Error", err?.message || "Failed to create group");
    } finally {
      setCreatingGroup(false);
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

  const getGroupedCategories = () => {
    const groups = filteredConversations.filter(
      (c) => c.type === ConversationType.GROUP
    );

    const orderedKeys = ["friends", "family", "work", "other", "uncategorized"];
    const mapper: Record<string, ChatConversationDto[]> = {
      friends: [],
      family: [],
      work: [],
      other: [],
      uncategorized: [],
    };

    groups.forEach((item) => {
      const rawCat = item.category || (item as any).group?.category;
      const cat =
        rawCat && typeof rawCat === "string"
          ? rawCat.toLowerCase()
          : "uncategorized";

      if (mapper[cat]) {
        mapper[cat].push(item);
      } else {
        mapper.uncategorized.push(item);
      }
    });

    return orderedKeys
      .map((key) => ({
        categoryKey: key,
        title: CATEGORY_LABELS[key],
        data: mapper[key],
      }))
      .filter((item) => item.data.length > 0);
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              maxHeight: 64,
              backgroundColor: "transparent",
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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: colors[500],
              gap: 12,
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
            <TouchableOpacity
              onPress={() => setIsModalOpen(true)}
              activeOpacity={0.7}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#EBEBEB",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  color: colors[100],
                  fontWeight: "400",
                  bottom: 1,
                }}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>

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

          {activeTab === "groups" ? (
            <FlatList
              data={getGroupedCategories()}
              keyExtractor={(item) => item.categoryKey}
              contentContainerStyle={{
                paddingBottom: 16,
                paddingHorizontal: 16,
              }}
              style={{ flex: 1, backgroundColor: colors[500] }}
              renderItem={({ item, index }) => {
                const groupedData = getGroupedCategories();
                const total = groupedData.length;
                return (
                  <View
                    style={{
                      marginBottom: 12,
                      borderBottomWidth: index !== total - 1 ? 1 : 0,
                      borderBottomColor:
                        colorScheme === "dark" ? "#2a2a2a" : "#EBEBEB",
                      paddingBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#92898A",
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {item.title} ({item.data.length})
                    </Text>
                    <View style={{ gap: 4 }}>
                      {item.data.map((conversation) => (
                        <ChatListItem
                          key={conversation.id}
                          conversation={conversation}
                          currentUserId={profile?.id}
                        />
                      ))}
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View className="py-12 items-center">
                  <Text variant="muted">No groups found</Text>
                </View>
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <FlatList
              data={
                activeTab === "unread"
                  ? filteredConversations.filter(
                      (c) => (c.unreadCount ?? 0) > 0
                    )
                  : filteredConversations
              }
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
          )}
        </View>
      </SafeAreaView>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: colors[200],
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "80%",
              paddingBottom: Platform.OS === "ios" ? 40 : 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor:
                  colorScheme === "dark" ? "#2a2a2a" : "#EBEBEB",
              }}
            >
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text style={{ color: "#6B7280" }}>Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: colors[100] }}
              >
                New Group
              </Text>
              <TouchableOpacity
                onPress={handleCreateGroupSubmit}
                disabled={creatingGroup}
              >
                {creatingGroup ? (
                  <ActivityIndicator size="small" color="#FFAABB" />
                ) : (
                  <Text style={{ fontWeight: "600", color: "#22C55E" }}>
                    Create
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ padding: 16 }}>
              <TextInput
                placeholder="Enter group name..."
                placeholderTextColor="#92898A"
                value={groupName}
                onChangeText={setGroupName}
                style={{
                  height: 48,
                  backgroundColor: colors[500],
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  color: colors[100],
                  fontSize: 15,
                  fontWeight: "400",
                }}
              />
            </View>

            <Text
              style={{
                paddingHorizontal: 16,
                fontSize: 13,
                fontWeight: "600",
                color: "#92898A",
                marginBottom: 8,
              }}
            >
              SELECT FRIENDS
            </Text>

            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 20,
              }}
              renderItem={({ item }) => {
                const isSelected = selectedMemberIds.includes(item.id);
                return (
                  <TouchableOpacity
                    onPress={() => toggleSelectMember(item.id)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        colorScheme === "dark" ? "#2a2a2a" : "#EBEBEB",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Avatar
                        source={item.avatar ? { uri: item.avatar } : undefined}
                        fallback={item.name?.charAt(0)?.toUpperCase() ?? "?"}
                        className="w-[40px] h-[40px]"
                      />
                      <Text style={{ color: colors[100], fontSize: 15 }}>
                        {item.name}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 99,
                        borderWidth: 2,
                        borderColor: isSelected ? "#22C55E" : "#6B7280",
                        backgroundColor: isSelected ? "#22C55E" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {isSelected && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 99,
                            backgroundColor: "#FFFFFF",
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Text variant="muted">No friends available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
