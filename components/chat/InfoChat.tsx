import {
  ArrowIcon,
  BlockIcon,
  FileIcon,
  ImageIcon,
  NotificationIcon,
  ReportIcon,
  SearchIcon,
  TrashIcon,
  UserIcon,
} from "@/components/shared/icons/Icons";
import { Avatar } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import type { ChatConversationDto } from "@/dtos";
import { ConversationType } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FileResponse, messageService } from "@/services/message.service";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, getSemantic, getStatusColor } from "@/styles/colors";

interface InfoChatProps {
  visible: boolean;
  onClose: () => void;
  conversation: ChatConversationDto | null;
  onDeleteChat?: (conversationId: string) => void;
  onOpenSearch?: () => void;
}

export function InfoChat({
  visible,
  onClose,
  conversation,
  onDeleteChat,
  onOpenSearch,
}: InfoChatProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const currentUserId = profile?.id;
  const otherUserId =
    conversation?.participantIds?.find((pid) => pid !== currentUserId) ??
    conversation?.participants?.find((p) => p.id !== currentUserId)?.id;
  const isDark = colorScheme === "dark";
  const semantic = getSemantic(colorScheme);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [images, setImages] = useState<FileResponse[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const textColor = semantic.text;
  const bgColor = semantic.background;
  const iconColor = isDark ? colors.light[400] : semantic.textMuted;
  const surfaceColor = semantic.surfaceMuted;

  const isGroup = conversation?.type === ConversationType.GROUP;

  const handleProfile = () => {
    onClose();
    if (otherUserId) router.push(`/profile/${otherUserId}` as any);
  };

  useEffect(() => {
    if (!visible || !conversation?.id) return;
    setLoadingMedia(true);
    Promise.all([
      messageService.getImageList(conversation.id),
      messageService.getFileList(conversation.id),
    ])
      .then(([imgs, fils]) => {
        setImages(imgs);
        setFiles(fils);
      })
      .catch((err) => console.error("Error loading media:", err))
      .finally(() => setLoadingMedia(false));
  }, [visible, conversation?.id]);

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
          onPress: async () => {
            try {
              await messageService.deleteBox(conversation.id);
            } catch (err) {
              console.error("Delete box error:", err);
            }
            onDeleteChat?.(conversation.id);
            onClose();
            router.back();
          },
        },
      ]
    );
  };

  const handleReport = async () => {
    if (!conversation?.id) return;
    await messageService.reportConversation(conversation.id);
    onClose();
  };

  const handleBlock = () => {
    Alert.alert(
      "Block",
      "Block this user? You won't receive messages from them.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          onPress: () => {
            onClose();
          },
        },
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowIcon size={30} color={semantic.primary} />
            </TouchableOpacity>
            <Text
              style={{
                color: semantic.primary,
                fontSize: 17,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Chat info
            </Text>
          </View>

          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Avatar
              source={
                conversation?.avatarUrl
                  ? { uri: conversation.avatarUrl }
                  : undefined
              }
              fallback={conversation?.name?.charAt(0)?.toUpperCase() ?? "?"}
              className="w-[70px] h-[70px]"
            />
            <Text
              style={{
                color: textColor,
                fontSize: 18,
                fontWeight: "500",
                marginTop: 12,
              }}
              numberOfLines={1}
            >
              {conversation?.name ?? "Chat"}
            </Text>
            <Text
              style={{
                color: textColor,
                fontSize: 14,
                opacity: 0.8,
                marginTop: 4,
              }}
            >
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
              <Text style={{ color: textColor, fontSize: 12, marginTop: 6 }}>
                Profile
              </Text>
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
              onPress={() => {
                onClose();
                onOpenSearch?.();
              }}
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
              <Text style={{ color: textColor, fontSize: 12, marginTop: 6 }}>
                Search
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <ImageIcon size={24} color={iconColor} />
              <Text style={{ color: textColor, fontSize: 16, marginLeft: 12 }}>
                Images
              </Text>
            </View>
            {loadingMedia ? (
              <Text
                style={{
                  color: textColor,
                  opacity: 0.7,
                  fontSize: 14,
                  marginLeft: 36,
                }}
              >
                Loading...
              </Text>
            ) : images.length === 0 ? (
              <Text
                style={{
                  color: textColor,
                  opacity: 0.7,
                  fontSize: 14,
                  marginLeft: 36,
                }}
              >
                No images in this chat
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginLeft: 36 }}
              >
                {images.map((img) => (
                  <TouchableOpacity key={img._id} style={{ marginRight: 8 }}>
                    <Image
                      source={{ uri: img.url }}
                      style={{ width: 72, height: 72, borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
                marginBottom: 12,
              }}
            >
              <FileIcon size={24} color={iconColor} />
              <Text style={{ color: textColor, fontSize: 16, marginLeft: 12 }}>
                Files
              </Text>
            </View>
            {loadingMedia ? (
              <Text
                style={{
                  color: textColor,
                  opacity: 0.7,
                  fontSize: 14,
                  marginLeft: 36,
                }}
              >
                Loading...
              </Text>
            ) : files.length === 0 ? (
              <Text
                style={{
                  color: textColor,
                  opacity: 0.7,
                  fontSize: 14,
                  marginLeft: 36,
                }}
              >
                No files in this chat
              </Text>
            ) : (
              <View style={{ marginLeft: 36 }}>
                {files.map((file) => (
                  <TouchableOpacity
                    key={file._id}
                    style={{
                      paddingVertical: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FileIcon size={18} color={iconColor} />
                    <Text
                      style={{ color: textColor, fontSize: 14 }}
                      numberOfLines={1}
                    >
                      {file.fileName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={handleReport}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 24,
                paddingVertical: 8,
              }}
            >
              <ReportIcon size={24} color={iconColor} />
              <Text style={{ color: textColor, fontSize: 16, marginLeft: 12 }}>
                Report
              </Text>
            </TouchableOpacity>

            {!isGroup && (
              <TouchableOpacity
                onPress={handleBlock}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  paddingVertical: 8,
                }}
              >
                <BlockIcon size={24} color={iconColor} />
                <Text
                  style={{ color: textColor, fontSize: 16, marginLeft: 12 }}
                >
                  Block
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDeleteChat}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                paddingVertical: 8,
              }}
            >
              <TrashIcon size={24} color={iconColor} />
              <Text
                style={{
                  color: getStatusColor(colorScheme, "error"),
                  fontSize: 16,
                  marginLeft: 12,
                }}
              >
                Remove chat
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
