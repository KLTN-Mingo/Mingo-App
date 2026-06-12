import { Avatar, Text } from "@/components/ui";
import { useChatContext } from "@/context/ChatContext";
import { ConversationType } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FriendOnlineItem, messageService } from "@/services/message.service";
import { getSemantic } from "@/styles/colors";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

interface FriendOnlineListProps {
  friends: FriendOnlineItem[];
  isLoading: boolean;
}

export function FriendOnlineList({
  friends,
  isLoading,
}: FriendOnlineListProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);
  const { setConversations, setFilteredConversations } = useChatContext();

  const handlePress = async (friend: FriendOnlineItem) => {
    try {
      const { boxId, isNew } = await messageService.getOrCreateDirectBox(
        friend.id
      );

      if (isNew) {
        const placeholder = {
          id: friend.id,
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
          prev.find((c) => c.id === friend.id) ? prev : [placeholder, ...prev]
        );
        setFilteredConversations((prev) =>
          prev.find((c) => c.id === friend.id) ? prev : [placeholder, ...prev]
        );
      }

      router.push(`/chat/${boxId}`);
    } catch (err) {
      console.error("Navigate to chat error:", err);
    }
  };

  if (isLoading) {
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" color={semantic.primary} />
      </View>
    );
  }

  if (friends.length === 0) return null;

  return (
    <View>
      <Text
        className="text-title-light dark:text-title-dark"
        style={{
          fontSize: 14,
          fontWeight: "800",
          paddingHorizontal: 4,
          paddingTop: 8,
          paddingBottom: 8,
          // textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Friends
      </Text>
      <FlatList
        data={friends}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            style={{ alignItems: "center", width: 60 }}
            activeOpacity={0.75}
          >
            <View style={{ position: "relative" }}>
              <Avatar
                source={item.avatar ? { uri: item.avatar } : undefined}
                fallback={item.name?.charAt(0)?.toUpperCase() ?? "?"}
                className="w-[48px] h-[48px]"
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.onlineStatus ? "#22C55E" : "#9CA3AF",
                  borderWidth: 2,
                  borderColor: semantic.background,
                }}
              />
            </View>
            <Text
              className="text-text-light dark:text-text-dark"
              numberOfLines={1}
              style={{
                fontSize: 11,
                marginTop: 4,
                textAlign: "center",
                maxWidth: 56,
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
