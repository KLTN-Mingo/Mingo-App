import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ArrowIcon,
  BlockIcon,
  FileIcon,
  ImageIcon,
  NotificationIcon,
  PlusIcon,
  ReportIcon,
  SearchIcon,
  TrashIcon,
  UserIcon,
} from "@/components/shared/icons/Icons";
import { Avatar } from "@/components/ui";
import { UserMinimalDto } from "@/dtos/user.dto";
import { FollowApi } from "@/services/follow.service";
import { useAuth } from "@/context/AuthContext";
import type { ChatConversationDto } from "@/dtos";
import { ConversationType } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FileResponse, messageService } from "@/services/message.service";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

const chatColors = {
  dark: {
    100: "#CFBFAD",
    200: "#515E5A",
    300: "#515E5A",
    500: "#1E2021",
    700: "#1E2021",
  },
  light: { 500: "#1E2021", 700: "#FAFAFA", 800: "#E8E8E8" },
};

interface InfoChatProps {
  visible: boolean;
  onClose: () => void;
  conversation: ChatConversationDto | null;
  onDeleteChat?: (conversationId: string) => void;
  onOpenSearch?: () => void;
}

type GroupMember = {
  id: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  role: "admin" | "member";
};

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
    conversation?.participants?.find((p) => p.id === currentUserId)?.id;
  const isDark = colorScheme === "dark";
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [images, setImages] = useState<FileResponse[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [friends, setFriends] = useState<UserMinimalDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");

  const textColor = isDark ? chatColors.dark[100] : chatColors.light[500];
  const bgColor = isDark ? chatColors.dark[500] : chatColors.light[700];
  const iconColor = isDark ? "#ffffff" : "#92898A";
  const surfaceColor = isDark ? chatColors.dark[200] : chatColors.light[800];

  const isGroup = conversation?.type === ConversationType.GROUP;

  const handleProfile = () => {
    onClose();
    if (otherUserId) router.push(`/profile/${otherUserId}` as any);
  };

  useEffect(() => {
    if (!visible || !conversation?.id) return;
    setLoadingMedia(true);
    setLoadingMembers(true);
    Promise.all([
      messageService.getImageList(conversation.id),
      messageService.getFileList(conversation.id),
      isGroup ? messageService.getGroupDetail(conversation.id) : Promise.resolve({ members: [] }),
    ])
      .then(([imgs, fils, detail]) => {
        setImages(imgs);
        setFiles(fils);
        if (isGroup && detail) {
          setMembers(detail.members);
          const amAdmin = detail.members.some(
            (m) => m.id === currentUserId && m.role === "admin"
          );
          setIsAdmin(amAdmin);
        }
      })
      .catch((err) => console.error("Error loading data:", err))
      .finally(() => {
        setLoadingMedia(false);
        setLoadingMembers(false);
      });
  }, [visible, conversation?.id, isGroup, currentUserId]);

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

  const openAddMemberModal = async () => {
    setShowAddMemberModal(true);
    setSelectedIds(new Set());
    setFriendSearch("");
    setLoadingFriends(true);
    try {
      if (!currentUserId) return;
      const data = await FollowApi.getFriends(currentUserId);
      const existingIds = new Set(members.map((m) => m.id));
      const notInGroup = data.friends
        .map((f) => f.user)
        .filter((u): u is UserMinimalDto => !existingIds.has(u.id));
      setFriends(notInGroup);
    } catch (err) {
      console.error("Error loading friends:", err);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleFriend = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddMembers = async () => {
    if (!conversation?.id || selectedIds.size === 0) return;
    setAddingMembers(true);
    try {
      for (const id of selectedIds) {
        await messageService.addGroupMember(conversation.id, id);
      }
      setShowAddMemberModal(false);
      const detail = await messageService.getGroupDetail(conversation.id);
      setMembers(detail.members);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to add members");
    } finally {
      setAddingMembers(false);
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    if (!conversation?.id) return;
    Alert.alert(
      "Remove member",
      `Remove ${member.name ?? "this user"} from the group?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await messageService.removeGroupMember(conversation.id, member.id);
              setMembers((prev) => prev.filter((m) => m.id !== member.id));
            } catch (err: any) {
              Alert.alert("Error", err?.message ?? "Failed to remove member");
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    if (!conversation?.id) return;
    Alert.alert(
      "Leave group",
      "Are you sure you want to leave this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await messageService.leaveGroup(conversation.id);
              onDeleteChat?.(conversation.id);
              onClose();
              router.back();
            } catch (err: any) {
              Alert.alert("Error", err?.message ?? "Failed to leave group");
            }
          },
        },
      ]
    );
  };

  const handlePromoteAdmin = async (member: GroupMember) => {
    if (!conversation?.id) return;
    try {
      await messageService.promoteToAdmin(conversation.id, member.id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, role: "admin" as const } : m
        )
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to promote member");
    }
  };

  const handleDemoteAdmin = async (member: GroupMember) => {
    if (!conversation?.id) return;
    try {
      await messageService.demoteFromAdmin(conversation.id, member.id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, role: "member" as const } : m
        )
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to demote admin");
    }
  };

  const renderMemberRow = (member: GroupMember) => {
    const isSelf = member.id === currentUserId;
    return (
      <View
        key={member.id}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
      >
        <Avatar
          source={member.avatarUrl ? { uri: member.avatarUrl } : undefined}
          fallback={member.name?.charAt(0)?.toUpperCase() ?? "?"}
          size="sm"
          className="w-8 h-8"
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: textColor, fontSize: 15 }} numberOfLines={1}>
            {member.name ?? "Unknown"}
            {isSelf && (
              <Text style={{ opacity: 0.6, fontSize: 13 }}> (You)</Text>
            )}
          </Text>
        </View>
        {member.role === "admin" && (
          <View
            style={{
              backgroundColor: "#FFAABB",
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2,
              marginRight: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
              Admin
            </Text>
          </View>
        )}
        {isAdmin && !isSelf && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {member.role === "member" ? (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => handlePromoteAdmin(member)}
              >
                <Text style={{ color: "#64B5F6", fontSize: 12 }}>Make admin</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => handleDemoteAdmin(member)}
              >
                <Text style={{ color: "#FFAABB", fontSize: 12 }}>Remove admin</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => handleRemoveMember(member)}
            >
              <Text style={{ color: "#E57373", fontSize: 18, fontWeight: "600" }}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const filteredFriends = friends.filter((f) =>
    (f.name ?? "").toLowerCase().includes(friendSearch.toLowerCase())
  );

  const renderFriendRow = (friend: UserMinimalDto) => {
    const selected = selectedIds.has(friend.id);
    return (
      <TouchableOpacity
        key={friend.id}
        onPress={() => toggleFriend(friend.id)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#3a3a3a" : "#eee",
        }}
      >
        <Avatar
          source={friend.avatar ? { uri: friend.avatar } : undefined}
          fallback={friend.name?.charAt(0)?.toUpperCase() ?? "?"}
          size="sm"
          className="w-8 h-8"
        />
        <Text
          style={{ flex: 1, marginLeft: 10, color: textColor, fontSize: 15 }}
          numberOfLines={1}
        >
          {friend.name ?? "Unknown"}
        </Text>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: selected ? "#FFAABB" : iconColor,
            backgroundColor: selected ? "#FFAABB" : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected && <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✓</Text>}
        </View>
      </TouchableOpacity>
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
              <ArrowIcon size={30} color="#FFAABB" />
            </TouchableOpacity>
            <Text
              style={{
                color: "#FFAABB",
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
            {/* Members section — group only */}
            {isGroup && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: textColor, fontSize: 16, fontWeight: "600" }}>
                    Members ({members.length})
                  </Text>
                  {isAdmin && (
                    <TouchableOpacity
                      onPress={openAddMemberModal}
                      style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                    >
                      <PlusIcon size={18} color="#64B5F6" />
                      <Text style={{ color: "#64B5F6", fontSize: 14 }}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View
                  style={{
                    backgroundColor: surfaceColor,
                    borderRadius: 8,
                    padding: 8,
                    marginBottom: 16,
                  }}
                >
                  {loadingMembers ? (
                    <Text style={{ color: textColor, opacity: 0.7, fontSize: 14 }}>
                      Loading members...
                    </Text>
                  ) : members.length === 0 ? (
                    <Text style={{ color: textColor, opacity: 0.7, fontSize: 14 }}>
                      No members found
                    </Text>
                  ) : (
                    members.map(renderMemberRow)
                  )}
                </View>
              </>
            )}

            {/* Images */}
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

            {/* Files */}
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

            {/* Report */}
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

            {/* Block — DM only */}
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
                <Text style={{ color: textColor, fontSize: 16, marginLeft: 12 }}>
                  Block
                </Text>
              </TouchableOpacity>
            )}

            {/* Leave group — group only */}
            {isGroup && (
              <TouchableOpacity
                onPress={handleLeaveGroup}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                  paddingVertical: 8,
                }}
              >
                <View style={{ transform: [{ rotate: "180deg" }] }}>
                  <ArrowIcon size={24} color="#E57373" />
                </View>
                <Text style={{ color: "#E57373", fontSize: 16, marginLeft: 12 }}>
                  Leave group
                </Text>
              </TouchableOpacity>
            )}

            {/* Remove chat */}
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
              <Text style={{ color: "#E53935", fontSize: 16, marginLeft: 12 }}>
                Remove chat
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Add Member Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showAddMemberModal}
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={{
              backgroundColor: surfaceColor,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 16,
              paddingBottom: 40,
              paddingHorizontal: 16,
              maxHeight: "80%",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ color: textColor, fontSize: 17, fontWeight: "600" }}>
                Add members
              </Text>
              <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                <Text style={{ color: "#E57373", fontSize: 28, fontWeight: "300" }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#2a2a2a" : "#f0f0f0",
                borderRadius: 10,
                paddingHorizontal: 12,
                marginBottom: 12,
              }}
            >
              <SearchIcon size={18} color={iconColor} />
              <TextInput
                value={friendSearch}
                onChangeText={setFriendSearch}
                placeholder="Search friends"
                placeholderTextColor="#92898A"
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  color: textColor,
                  fontSize: 15,
                }}
              />
            </View>

            {/* Friend list */}
            <ScrollView style={{ maxHeight: 400 }}>
              {loadingFriends ? (
                <Text style={{ color: textColor, opacity: 0.7, fontSize: 14, paddingVertical: 8 }}>
                  Loading friends...
                </Text>
              ) : filteredFriends.length === 0 ? (
                <Text style={{ color: textColor, opacity: 0.7, fontSize: 14, paddingVertical: 8 }}>
                  {friends.length === 0
                    ? "No friends available to add"
                    : "No friends match your search"}
                </Text>
              ) : (
                filteredFriends.map(renderFriendRow)
              )}
            </ScrollView>

            {/* Confirm button */}
            {selectedIds.size > 0 && (
              <TouchableOpacity
                onPress={handleAddMembers}
                disabled={addingMembers}
                style={{
                  backgroundColor: addingMembers ? "#888" : "#FFAABB",
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  {addingMembers
                    ? "Adding..."
                    : `Add ${selectedIds.size} member${selectedIds.size > 1 ? "s" : ""}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
});
