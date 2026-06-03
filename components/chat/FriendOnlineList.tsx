import { Avatar, Text } from "@/components/ui";
import { useChatContext } from "@/context/ChatContext";
import { ConversationType } from "@/dtos";
import { FriendOnlineItem, messageService } from "@/services/message.service";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  friends: FriendOnlineItem[];
  isLoading: boolean;
  isDark: boolean;
}

export function FriendOnlineList({ friends, isLoading, isDark }: Props) {
  const router = useRouter();
  const { conversations, setConversations, setFilteredConversations } =
    useChatContext();

  const handlePress = async (friend: FriendOnlineItem) => {
    try {
      const { boxId, isNew } = await messageService.getOrCreateDirectBox(
        friend.id
      );

      // Nếu box mới, tạm thêm placeholder vào conversation list
      // để chat screen có thể hiển thị name/avatar ngay lập tức
      if (isNew) {
        const placeholder = {
          id: friend.id, // dùng userId làm id tạm
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
        setConversations((prev) => {
          if (prev.find((c) => c.id === friend.id)) return prev;
          return [placeholder, ...prev];
        });
        setFilteredConversations((prev) => {
          if (prev.find((c) => c.id === friend.id)) return prev;
          return [placeholder, ...prev];
        });
      }

      router.push(`/chat/${boxId}`);
    } catch (err) {
      console.error("Navigate to chat error:", err);
    }
  };

  if (isLoading) {
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#FFAABB" />
      </View>
    );
  }

  if (friends.length === 0) return null;

  return (
    <View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: isDark ? "#888" : "#92898A",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 6,
          textTransform: "uppercase",
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
        contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            style={{ alignItems: "center", width: 60 }}
          >
            <View style={{ position: "relative" }}>
              <Avatar
                source={item.avatar ? { uri: item.avatar } : undefined}
                fallback={item.name?.charAt(0)?.toUpperCase() ?? "?"}
                className="w-[48px] h-[48px]"
              />
              {/* Online dot */}
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
                  borderColor: isDark ? "#1E2021" : "#FAFAFA",
                }}
              />
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 11,
                marginTop: 4,
                color: isDark ? "#CFBFAD" : "#1E2021",
                textAlign: "center",
                maxWidth: 56,
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: isDark ? "#2a2a2a" : "#F0EDED",
          marginTop: 10,
          marginHorizontal: 16,
        }}
      />
    </View>
  );
}
