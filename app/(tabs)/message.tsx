import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";

import { ChatListItem, FriendOnlineList } from "@/components/chat";
import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { ActionInput, AppModal, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { ChatConversationDto, ConversationType } from "@/dtos";
import { useChatList } from "@/hooks/use-chat-list";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FriendOnlineItem, messageService } from "@/services/message.service";
import { getSemantic } from "@/styles/colors";

type MessageTab = "all" | "unread" | "groups";
type GroupCategoryKey =
  | "friends"
  | "family"
  | "work"
  | "other"
  | "uncategorized";

const TABS: { key: MessageTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "groups", label: "Groups" },
];

const GROUP_CATEGORIES: { key: GroupCategoryKey; label: string }[] = [
  { key: "friends", label: "Friends" },
  { key: "family", label: "Family" },
  { key: "work", label: "Work" },
  { key: "other", label: "Other" },
  { key: "uncategorized", label: "Uncategorized" },
];

export default function MessageScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);

  const { profile } = useAuth();
  const { filteredConversations, refetch, setSearchQuery } = useChatList();

  const [friends, setFriends] = useState<FriendOnlineItem[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<MessageTab>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setFriendsLoading(true);
        const data = await messageService.getFriendsWithOnlineStatus();
        const online = data.filter((f) => f.onlineStatus);
        const offline = data.filter((f) => !f.onlineStatus);
        setFriends([...online, ...offline].slice(0, 10));
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

  const unreadCount = useMemo(
    () =>
      filteredConversations.filter((item) => (item.unreadCount ?? 0) > 0)
        .length,
    [filteredConversations]
  );

  const tabbedConversations = useMemo(() => {
    if (activeTab === "unread") {
      return filteredConversations.filter((item) => (item.unreadCount ?? 0) > 0);
    }

    return filteredConversations;
  }, [activeTab, filteredConversations]);

  const groupedConversations = useMemo(() => {
    const groups = filteredConversations.filter(
      (item) => item.type === ConversationType.GROUP
    );
    const sections = new Map<GroupCategoryKey, ChatConversationDto[]>(
      GROUP_CATEGORIES.map(({ key }) => [key, []])
    );

    groups.forEach((conversation) => {
      const rawCategory =
        conversation.category?.trim().toLowerCase() ??
        (conversation as any).group?.category?.trim().toLowerCase();
      const category = GROUP_CATEGORIES.some(
        ({ key }) => key !== "uncategorized" && key === rawCategory
      )
        ? (rawCategory as Exclude<GroupCategoryKey, "uncategorized">)
        : "uncategorized";

      sections.get(category)?.push(conversation);
    });

    return GROUP_CATEGORIES.map(({ key, label }) => ({
      key,
      label,
      conversations: sections.get(key) ?? [],
    })).filter((section) => section.conversations.length > 0);
  }, [filteredConversations]);

  const filteredFriends = useMemo(() => {
    const query = friendSearch.trim().toLowerCase();

    if (!query) return friends;

    return friends.filter((friend) =>
      (friend.name ?? "").toLowerCase().includes(query)
    );
  }, [friendSearch, friends]);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setSearchQuery(text);
  };

  const toggleSelectMember = (friendId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const closeGroupModal = () => {
    if (creatingGroup) return;

    setIsModalOpen(false);
    setGroupName("");
    setFriendSearch("");
    setSelectedMemberIds([]);
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
        await refetch();
        closeGroupModal();
        router.push(`/chat/${response.box._id || response.box.id}`);
      }
    } catch (err: any) {
      console.error("handleCreateGroupSubmit error:", err);
      Alert.alert("Error", err?.message || "Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScreenContainer
      horizontalPadding="default"
      style={{ backgroundColor: semantic.background }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className="text-title-light dark:text-title-dark leading-[32px]"
          style={{ fontFamily: "Montserrat-SemiBold", fontSize: 24 }}
        >
          Messages
        </Text>

        <TouchableOpacity
          className="w-9 h-9 rounded-full items-center justify-center bg-component-light dark:bg-component-dark"
          activeOpacity={0.7}
          onPress={() => setIsModalOpen(true)}
        >
          <Ionicons name="add" size={24} color={semantic.text} />
        </TouchableOpacity>
      </View>

      <View className="px-1 py-1 flex-1">
        <SearchBarInput
          placeholder="search"
          value={searchText}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />

        <View className="mt-3">
          <FriendOnlineList friends={friends.slice(0, 10)} isLoading={friendsLoading} />
        </View>

        <View className="flex-row items-center gap-2 mt-4 mb-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const label =
              tab.key === "unread" && unreadCount > 0
                ? `${tab.label} ${unreadCount}`
                : tab.label;

            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.75}
                onPress={() => setActiveTab(tab.key)}
                className={`px-4 h-9 rounded-full items-center justify-center ${
                  isActive
                    ? "bg-primary"
                    : "bg-component-light dark:bg-component-dark"
                }`}
              >
                <Text
                  className={
                    isActive
                      ? "text-white font-semibold"
                      : "text-text-muted-light dark:text-text-muted-dark"
                  }
                  style={{ fontSize: 13 }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === "groups" ? (
          <FlatList
            data={groupedConversations}
            keyExtractor={(item) => item.key}
            renderItem={({ item, index }) => (
              <View
                className={`pt-3 ${
                  index < groupedConversations.length - 1
                    ? "pb-4 border-b border-border-light dark:border-border-dark"
                    : "pb-2"
                }`}
              >
                <Text
                  className="mb-2 uppercase text-text-muted-light dark:text-text-muted-dark"
                  style={{
                    fontFamily: "Montserrat-SemiBold",
                    fontSize: 12,
                    letterSpacing: 0.5,
                  }}
                >
                  {item.label} ({item.conversations.length})
                </Text>

                <View className="gap-2">
                  {item.conversations.map((conversation) => (
                    <ChatListItem
                      key={conversation.id}
                      conversation={conversation}
                      currentUserId={profile?.id}
                    />
                  ))}
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 12 }}
            style={{ flex: 1 }}
            ListEmptyComponent={<EmptyState title="No group conversations yet" />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <FlatList
            data={tabbedConversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatListItem conversation={item} currentUserId={profile?.id} />
            )}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 12 }}
            style={{ flex: 1 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            ListEmptyComponent={
              <EmptyState
                title={
                  activeTab === "unread"
                    ? "No unread conversations"
                    : "No conversations yet"
                }
              />
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      <AppModal visible={isModalOpen} onDismiss={closeGroupModal} className="gap-4">
        <View className="gap-1">
          <Text
            className="text-title-light dark:text-title-dark"
            style={{ fontFamily: "Montserrat-SemiBold", fontSize: 20 }}
          >
            New group
          </Text>

          <Text
            className="text-text-muted-light dark:text-text-muted-dark"
            style={{ fontSize: 13 }}
          >
            Choose friends and start a group conversation.
          </Text>
        </View>

        <ActionInput
          surface="component"
          placeholder="Group name"
          value={groupName}
          onChangeText={setGroupName}
          returnKeyType="next"
          className="rounded-2xl"
        />

        <ActionInput
          surface="component"
          placeholder="Search friends"
          value={friendSearch}
          onChangeText={setFriendSearch}
          returnKeyType="search"
          className="rounded-2xl"
          leftIcon={
            <Ionicons
              name="search-outline"
              size={18}
              color={semantic.textMuted}
            />
          }
        />

        <View style={{ maxHeight: 280 }}>
          {friendsLoading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator color={semantic.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredFriends}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View className="h-2" />}
              ListEmptyComponent={
                <Text
                  className="text-text-muted-light dark:text-text-muted-dark text-center py-6"
                  style={{ fontSize: 13 }}
                >
                  No friends found
                </Text>
              }
              renderItem={({ item }) => {
                const selected = selectedMemberIds.includes(item.id);

                return (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => toggleSelectMember(item.id)}
                    className="flex-row items-center px-3 py-2 rounded-2xl bg-component-light dark:bg-component-dark"
                  >
                    <View className="flex-1">
                      <Text
                        className="text-text-light dark:text-text-dark"
                        numberOfLines={1}
                        style={{ fontSize: 15, fontWeight: "600" }}
                      >
                        {item.name}
                      </Text>

                      <Text
                        className="text-text-muted-light dark:text-text-muted-dark"
                        style={{ fontSize: 12 }}
                      >
                        {item.onlineStatus ? "Online" : "Offline"}
                      </Text>
                    </View>

                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        selected
                          ? "bg-primary border-primary"
                          : "border-border-light dark:border-border-dark"
                      }`}
                    >
                      {selected ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={creatingGroup}
          onPress={handleCreateGroupSubmit}
          className={`items-center justify-center rounded-2xl py-3.5 ${
            creatingGroup ? "bg-primary/60" : "bg-primary"
          }`}
        >
          {creatingGroup ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold" style={{ fontSize: 15 }}>
              Create group
            </Text>
          )}
        </TouchableOpacity>
      </AppModal>
    </ScreenContainer>
  );
}
