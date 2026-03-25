import React, { useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatListItem } from "@/components/chat";
import { ArrowIcon } from "@/components/shared/icons/Icons";
import { Input, Text } from "@/components/ui";
import { useChatList } from "@/hooks/use-chat-list";
import { useColorScheme } from "@/hooks/use-color-scheme";

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

export default function ChatListScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = colorScheme === "dark" ? chatColors.dark : chatColors.light;
  const iconColor = colorScheme === "dark" ? "#ffffff" : "#92898A";

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
          {/* Header row: Arrow + "Messages" — match old message.tsx */}
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
            <TouchableOpacity>
              <ArrowIcon size={28} color={iconColor} />
            </TouchableOpacity>
            <Text
              style={{
                color: colors[100],
                fontSize: 18,
                fontWeight: "600",
                marginLeft: 4,
              }}
            >
              Messages
            </Text>
          </View>

          {/* Search row: Input + Plus */}
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
              <Input
                placeholder="Search"
                value={searchText}
                onChangeText={handleSearchChange}
                returnKeyType="search"
                className="rounded-xl"
              />
            </View>
            {/* <TouchableOpacity style={{ padding: 4 }}>
              <PlusIcon color={iconColor} size={40} />
            </TouchableOpacity> */}
          </View>

          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatListItem conversation={item} />}
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
