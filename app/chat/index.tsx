import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { ActionInput, AppModal, Avatar, Button, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { ChatConversationDto, ConversationType } from "@/dtos";
import { useChatList } from "@/hooks/use-chat-list";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFriendsOnline } from "@/hooks/use-friends-online";
import { messageService } from "@/services/message.service";
import { getSemantic } from "@/styles/colors";

type ChatTab = "all" | "unread" | "groups";
type GroupCategoryKey =
  | "friends"
  | "family"
  | "work"
  | "other"
  | "uncategorized";

const CHAT_TABS: { key: ChatTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "groups", label: "Groups" },
];

const GROUP_CATEGORIES: {
  key: GroupCategoryKey;
  label: string;
}[] = [
  { key: "friends", label: "Friends" },
  { key: "family", label: "Family" },
  { key: "work", label: "Work" },
  { key: "other", label: "Other" },
  { key: "uncategorized", label: "Uncategorized" },
];

export default function ChatListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);

  const { filteredConversations, refetch, setSearchQuery } = useChatList();
  const { profile } = useAuth();
  const {
    friends,
    isLoading: friendsLoading,
    refetch: refetchFriends,
  } = useFriendsOnline();

  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>("all");
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const unreadCount = useMemo(
    () =>
      filteredConversations.filter((item) => (item.unreadCount ?? 0) > 0)
        .length,
    [filteredConversations]
  );

  const tabbedConversations = useMemo(() => {
    if (activeTab === "unread") {
      return filteredConversations.filter(
        (item) => (item.unreadCount ?? 0) > 0
      );
    }

    if (activeTab === "groups") {
      return filteredConversations.filter(
        (item) => item.type === ConversationType.GROUP
      );
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
      const rawCategory = conversation.category?.trim().toLowerCase();
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchFriends()]);
    setRefreshing(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setSearchQuery(text);
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const closeGroupModal = () => {
    if (creatingGroup) return;

    setGroupModalVisible(false);
    setGroupName("");
    setFriendSearch("");
    setSelectedMemberIds([]);
  };

  const handleCreateGroup = async () => {
    const name = groupName.trim();

    if (!profile?.id) {
      Alert.alert(
        "Create group",
        "Please sign in again before creating a group."
      );
      return;
    }

    if (!name) {
      Alert.alert("Create group", "Enter a group name first.");
      return;
    }

    if (selectedMemberIds.length === 0) {
      Alert.alert("Create group", "Choose at least one friend.");
      return;
    }

    try {
      setCreatingGroup(true);

      const result = await messageService.createGroup(profile.id, {
        groupName: name,
        membersIds: selectedMemberIds,
        category: "other",
      });

      await refetch();
      closeGroupModal();

      const boxId =
        (result as any)?.box?._id ??
        (result as any)?.box?.id ??
        (result as any)?.boxId;

      if (boxId) {
        router.push(`/chat/${boxId}`);
      }
    } catch (err: any) {
      Alert.alert(
        "Create group",
        err?.message ?? "Unable to create the group right now."
      );
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <ScreenContainer
      horizontalPadding="default"
      style={{ backgroundColor: semantic.background }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className="text-title-light dark:text-title-dark leading-[32px]"
          style={{
            fontFamily: "Montserrat-SemiBold",
            fontSize: 24,
          }}
        >
          Messages
        </Text>

        <TouchableOpacity
          className="w-9 h-9 rounded-full items-center justify-center bg-component-light dark:bg-component-dark"
          activeOpacity={0.7}
          onPress={() => setGroupModalVisible(true)}
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
          <FriendOnlineList
            friends={friends.slice(0, 12)}
            isLoading={friendsLoading}
          />
        </View>

        <View className="flex-row items-center gap-2 mt-4 mb-1">
          {CHAT_TABS.map((tab) => {
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
            contentContainerStyle={{
              paddingBottom: 12,
            }}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <EmptyState title="No group conversations yet" />
            }
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
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 12,
            }}
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

      <AppModal
        visible={groupModalVisible}
        onDismiss={closeGroupModal}
        className="gap-4"
      >
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
                    onPress={() => toggleMember(item.id)}
                    className="flex-row items-center px-3 py-2 rounded-2xl bg-component-light dark:bg-component-dark"
                  >
                    <View className="relative">
                      <Avatar
                        source={item.avatar ? { uri: item.avatar } : undefined}
                        fallback={item.name?.charAt(0)?.toUpperCase() ?? "?"}
                        size="md"
                      />

                      <View
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: item.onlineStatus
                            ? "#22C55E"
                            : "#9CA3AF",
                          borderWidth: 2,
                          borderColor: semantic.surface,
                        }}
                      />
                    </View>

                    <View className="flex-1 ml-3">
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

                    <Ionicons
                      name={selected ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={selected ? semantic.primary : semantic.textMuted}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onPress={closeGroupModal}
            disabled={creatingGroup}
          >
            Cancel
          </Button>

          <Button
            className="flex-1"
            onPress={handleCreateGroup}
            loading={creatingGroup}
          >
            Create
          </Button>
        </View>
      </AppModal>
    </ScreenContainer>
  );
}
