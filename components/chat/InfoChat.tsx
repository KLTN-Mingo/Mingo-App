import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import {
  ArrowIcon,
  UserIcon,
  NotificationIcon,
  SearchIcon,
  ImageIcon,
  FileIcon,
  ReportIcon,
  BlockIcon,
  TrashIcon,
} from "@/components/shared/icons/Icons";
import { Avatar } from "@/components/ui";
import type { ChatConversationDto } from "@/dtos";
import { ConversationType } from "@/dtos";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";

const chatColors = {
  dark: { 100: "#CFBFAD", 200: "#515E5A", 300: "#515E5A", 500: "#1E2021", 700: "#1E2021" },
  light: { 500: "#1E2021", 700: "#FAFAFA", 800: "#E8E8E8" },
};

interface InfoChatProps {
  visible: boolean;
  onClose: () => void;
  conversation: ChatConversationDto | null;
  onDeleteChat?: (conversationId: string) => void;
}

export function InfoChat({
  visible,
  onClose,
  conversation,
  onDeleteChat,
}: InfoChatProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const currentUserId = profile?.id;
  const otherUserId =
    conversation?.participantIds?.find((pid) => pid !== currentUserId) ??
    conversation?.participants?.find((p) => p.id !== currentUserId)?.id;
  const isDark = colorScheme === "dark";
  const [notificationsOn, setNotificationsOn] = useState(true);

  const textColor = isDark ? chatColors.dark[100] : chatColors.light[500];
  const bgColor = isDark ? chatColors.dark[500] : chatColors.light[700];
  const iconColor = isDark ? "#ffffff" : "#92898A";
  const surfaceColor = isDark ? chatColors.dark[200] : chatColors.light[800];

  const isGroup = conversation?.type === ConversationType.GROUP;

  const handleProfile = () => {
    onClose();
    if (otherUserId) router.push(`/profile/${otherUserId}` as any);
  };

  const handleDeleteChat = () => {
    if (!conversation?.id) return;
    Alert.alert(
      "Remove chat",
      "Are you sure you want to remove this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            onDeleteChat?.(conversation.id);
            onClose();
            router.back();
          },
        },
      ]
    );
  };

  const handleReport = () => {
    onClose();
    // TODO: navigate to report or open report modal
  };

  const handleBlock = () => {
    Alert.alert(
      "Block",
      "Block this user? You won't receive messages from them.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block", onPress: () => { onClose(); } },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: Platform.OS === "android" ? 8 : 36,
            paddingBottom: 40,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 16 }}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ArrowIcon size={30} color="#FFAABB" />
            </TouchableOpacity>
            <Text style={{ color: "#FFAABB", fontSize: 17, fontWeight: "600", marginLeft: 8 }}>
              Chat info
            </Text>
          </View>

          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Avatar
              source={conversation?.avatarUrl ? { uri: conversation.avatarUrl } : undefined}
              fallback={conversation?.name?.charAt(0)?.toUpperCase() ?? "?"}
              className="w-[70px] h-[70px]"
            />
            <Text
              style={{ color: textColor, fontSize: 18, fontWeight: "500", marginTop: 12 }}
              numberOfLines={1}
            >
              {conversation?.name ?? "Chat"}
            </Text>
            <Text style={{ color: textColor, fontSize: 14, opacity: 0.8, marginTop: 4 }}>
              {isGroup ? "Group" : "Direct chat"}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={handleProfile}
              style={{ alignItems: "center", width: 72 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: surfaceColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserIcon size={26} color={iconColor} />
              </View>
              <Text style={{ color: textColor, fontSize: 12, marginTop: 6 }}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setNotificationsOn((v) => !v)}
              style={{ alignItems: "center", width: 72 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: surfaceColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NotificationIcon size={26} color={iconColor} />
              </View>
              <Text style={{ color: textColor, fontSize: 12, marginTop: 6 }}>
                {notificationsOn ? "Mute" : "Notify"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { onClose(); /* TODO: open search in chat */ }}
              style={{ alignItems: "center", width: 72 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: surfaceColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SearchIcon size={24} color={iconColor} />
              </View>
              <Text style={{ color: textColor, fontSize: 12, marginTop: 6 }}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <ImageIcon size={24} color={iconColor} />
              <Text style={{ color: textColor, fontSize: 16, marginLeft: 12 }}>Images</Text>
            </View>
            <Text style={{ color: textColor, opacity: 0.7, fontSize: 14, marginLeft: 36 }}>
              No images in this chat
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
              <FileIcon size={24} color={iconColor} />
              <Text style={{ color: textColor, fontSize: 16, marginLeft: 12 }}>Files</Text>
            </View>
            <Text style={{ color: textColor, opacity: 0.7, fontSize: 14, marginLeft: 36 }}>
              No files in this chat
            </Text>

            <TouchableOpacity
              onPress={handleReport}
              style={{ flexDirection: "row", alignItems: "center", marginTop: 24, paddingVertical: 8 }}
            >
              <ReportIcon size={24} color={iconColor} />
              <Text style={{ color: textColor, fontSize: 16, marginLeft: 12 }}>Report</Text>
            </TouchableOpacity>

            {!isGroup && (
              <TouchableOpacity
                onPress={handleBlock}
                style={{ flexDirection: "row", alignItems: "center", marginTop: 12, paddingVertical: 8 }}
              >
                <BlockIcon size={24} color={iconColor} />
                <Text style={{ color: textColor, fontSize: 16, marginLeft: 12 }}>Block</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDeleteChat}
              style={{ flexDirection: "row", alignItems: "center", marginTop: 12, paddingVertical: 8 }}
            >
              <TrashIcon size={24} color={iconColor} />
              <Text style={{ color: "#E53935", fontSize: 16, marginLeft: 12 }}>Remove chat</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
