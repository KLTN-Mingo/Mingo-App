import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";

import { ChatListItem } from "@/components/chat";
import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { ActionInput, Text } from "@/components/ui";
import { useChatList } from "@/hooks/use-chat-list";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSemantic } from "@/styles/colors";

export default function ChatListScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);

  const { filteredConversations, refetch, setSearchQuery } = useChatList();
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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
    <ScreenContainer
      horizontalPadding="default"
      style={{ backgroundColor: semantic.background }}
    >
      <Text
        className="text-title-light dark:text-title-dark leading-[32px] mb-2"
        style={{
          fontFamily: "Montserrat-SemiBold",
          fontSize: 24,
        }}
      >
        Messages
      </Text>

      <View className="px-1 py-1 flex-1">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <ActionInput
              surface="component"
              placeholder="search"
              value={searchText}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              className="rounded-full"
              leftIcon={
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={semantic.textMuted}
                />
              }
            />
          </View>
          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center bg-component-light dark:bg-component-dark"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={semantic.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatListItem conversation={item} />}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 12,
          }}
          style={{ flex: 1 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={<EmptyState title="No conversations yet" />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </ScreenContainer>
  );
}
