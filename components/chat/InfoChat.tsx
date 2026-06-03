import {
  ArrowIcon,
  BlockIcon,
  FileIcon,
  ImageIcon,
  NotificationIcon,
  PlusIcon,
  ReportIcon,
  SearchIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from "@/components/shared/icons/Icons";
import { Avatar } from "@/components/ui";
import { chatTheme } from "@/constants/chatTheme";
import { useAuth } from "@/context/AuthContext";
import type { ChatConversationDto } from "@/dtos";
import { ConversationType } from "@/dtos";
import { UserMinimalDto } from "@/dtos/user.dto";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FollowApi } from "@/services/follow.service";
import { FileResponse, messageService } from "@/services/message.service";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const [category, setCategory] = useState("");
  const [updatingCategory, setUpdatingCategory] = useState(false);

  const validCategories = [
    { id: "friends", label: "Friends" },
    { id: "family", label: "Family" },
    { id: "work", label: "Work" },
    { id: "other", label: "Other" },
  ];

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [friends, setFriends] = useState<UserMinimalDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");

  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null
  );
  const [memberActionVisible, setMemberActionVisible] = useState(false);

  const textColor = isDark ? chatTheme.textDark : chatTheme.textLight;
  const bgColor = isDark ? chatTheme.bgDark : chatTheme.bgLight;
  const iconColor = isDark ? chatTheme.textDark : chatTheme.textMuted;
  const surfaceColor = isDark
    ? chatTheme.componentDark
    : chatTheme.componentLight;

  const isGroup = conversation?.type === ConversationType.GROUP;

  const handleProfile = () => {
    onClose();
    if (otherUserId) router.push(`/profile/${otherUserId}` as any);
  };

  useEffect(() => {
    if (!visible || !conversation?.id) return;
    setLoadingMedia(true);
    setLoadingMembers(true);
    setCategory(conversation.category ?? "");

    Promise.all([
      messageService.getImageList(conversation.id),
      messageService.getFileList(conversation.id),
      isGroup
        ? messageService.getGroupDetail(conversation.id)
        : Promise.resolve({ members: [], category: undefined }),
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
          if (detail.category !== undefined) {
            setCategory(detail.category || "");
          }
        }
      })
      .catch((err) => console.error("Error loading data:", err))
      .finally(() => {
        setLoadingMedia(false);
        setLoadingMembers(false);
      });
  }, [visible, conversation?.id, isGroup, currentUserId, conversation]);

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
              await messageService.removeGroupMember(
                conversation.id,
                member.id
              );
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
    Alert.alert("Leave group", "Are you sure you want to leave this group?", [
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
    ]);
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

    const handleLongPress = () => {
      if (!isAdmin || isSelf) return;
      setSelectedMember(member);
      setMemberActionVisible(true);
    };

    return (
      <TouchableOpacity
        key={member.id}
        onLongPress={handleLongPress}
        activeOpacity={isAdmin && !isSelf ? 0.6 : 1}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 8,
          borderRadius: 10,
        }}
      >
        <Avatar
          source={member.avatarUrl ? { uri: member.avatarUrl } : undefined}
          fallback={member.name?.charAt(0)?.toUpperCase() ?? "?"}
          size="sm"
          className="w-10 h-10"
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{ color: textColor, fontSize: 15, fontWeight: "500" }}
              numberOfLines={1}
            >
              {member.name ?? "Unknown"}
            </Text>
            {isSelf && (
              <Text style={{ color: chatTheme.textMuted, fontSize: 12 }}>
                (You)
              </Text>
            )}
          </View>
          {member.role === "admin" && (
            <Text
              style={{ color: chatTheme.accent, fontSize: 12, marginTop: 1 }}
            >
              Admin
            </Text>
          )}
        </View>
      </TouchableOpacity>
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
          borderBottomColor: isDark
            ? chatTheme.dividerDark
            : chatTheme.dividerLight,
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
            borderColor: selected ? chatTheme.accent : iconColor,
            backgroundColor: selected ? chatTheme.accent : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected && (
            <Text
              style={{
                color: chatTheme.accentText,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              ✓
            </Text>
          )}
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
              <ArrowIcon size={30} color={chatTheme.accent} />
            </TouchableOpacity>
            <Text
              style={{
                color: chatTheme.accent,
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
            {!isGroup && (
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
            )}

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

            {isGroup && isAdmin && (
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                style={{ alignItems: "center", width: 72 }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: category
                      ? isDark
                        ? "rgba(255,170,187,0.15)"
                        : "rgba(255,100,130,0.1)"
                      : surfaceColor,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TagIcon size={22} color={iconColor} />
                </View>
                <Text
                  style={{
                    color: textColor,
                    fontSize: 12,
                    marginTop: 6,
                  }}
                  numberOfLines={1}
                >
                  {validCategories.find((c) => c.id === category)?.label ??
                    "Category"}
                </Text>
              </TouchableOpacity>
            )}
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
                    marginBottom: 10,
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    Members ({members.length})
                  </Text>
                  {isAdmin && (
                    <TouchableOpacity
                      onPress={openAddMemberModal}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: isDark
                          ? chatTheme.inputBgDark
                          : chatTheme.inputBgLight,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                      }}
                    >
                      <PlusIcon size={14} color={chatTheme.info} />
                      <Text
                        style={{
                          color: chatTheme.info,
                          fontSize: 13,
                          fontWeight: "500",
                        }}
                      >
                        Add
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View
                  style={{
                    backgroundColor: surfaceColor,
                    borderRadius: 12,
                    paddingVertical: 4,
                    paddingHorizontal: 4,
                    marginBottom: 20,
                  }}
                >
                  {loadingMembers ? (
                    <Text
                      style={{ color: textColor, opacity: 0.7, fontSize: 14 }}
                    >
                      Loading members...
                    </Text>
                  ) : members.length === 0 ? (
                    <Text
                      style={{ color: textColor, opacity: 0.7, fontSize: 14 }}
                    >
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
                <Text
                  style={{ color: textColor, fontSize: 16, marginLeft: 12 }}
                >
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
                  <ArrowIcon size={24} color={chatTheme.dangerMuted} />
                </View>
                <Text
                  style={{
                    color: chatTheme.dangerMuted,
                    fontSize: 16,
                    marginLeft: 12,
                  }}
                >
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
              <Text
                style={{
                  color: chatTheme.danger,
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

      {/* Category Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark
              ? chatTheme.sheetDark
              : chatTheme.sheetLight,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: Platform.OS === "ios" ? 40 : 28,
            paddingTop: 12,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: isDark
                ? chatTheme.handleDark
                : chatTheme.handleLight,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              color: textColor,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            Group category
          </Text>
          <Text
            style={{
              color: chatTheme.textMuted,
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Tap to select or deselect
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {validCategories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  disabled={updatingCategory}
                  onPress={async () => {
                    if (updatingCategory) return;
                    setUpdatingCategory(true);
                    try {
                      const newCat = isSelected ? "" : cat.id;
                      await messageService.updateGroupCategory(
                        conversation!.id,
                        newCat
                      );
                      setCategory(newCat);
                    } catch (err: any) {
                      Alert.alert(
                        "Error",
                        err?.message ?? "Failed to update category"
                      );
                    } finally {
                      setUpdatingCategory(false);
                    }
                  }}
                  style={{
                    paddingVertical: 9,
                    paddingHorizontal: 20,
                    borderRadius: 999,
                    borderWidth: 0.5,
                    borderColor: isSelected
                      ? chatTheme.accent
                      : isDark
                        ? chatTheme.dividerDark
                        : chatTheme.dividerLight,
                    backgroundColor: isSelected
                      ? chatTheme.accent
                      : surfaceColor,
                    opacity: updatingCategory ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#fff" : textColor,
                      fontSize: 14,
                      fontWeight: isSelected ? "500" : "400",
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() => setShowCategoryModal(false)}
            style={{
              backgroundColor: isDark
                ? chatTheme.cancelBgDark
                : chatTheme.cancelBgLight,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: textColor, fontSize: 16, fontWeight: "500" }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
              <Text
                style={{ color: textColor, fontSize: 17, fontWeight: "600" }}
              >
                Add members
              </Text>
              <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                <Text
                  style={{
                    color: chatTheme.dangerMuted,
                    fontSize: 28,
                    fontWeight: "300",
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark
                  ? chatTheme.inputBgDark
                  : chatTheme.inputBgLight,
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
                placeholderTextColor={chatTheme.textMuted}
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
                <Text
                  style={{
                    color: textColor,
                    opacity: 0.7,
                    fontSize: 14,
                    paddingVertical: 8,
                  }}
                >
                  Loading friends...
                </Text>
              ) : filteredFriends.length === 0 ? (
                <Text
                  style={{
                    color: textColor,
                    opacity: 0.7,
                    fontSize: 14,
                    paddingVertical: 8,
                  }}
                >
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
                  backgroundColor: addingMembers
                    ? chatTheme.textMuted
                    : chatTheme.accent,
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                >
                  {addingMembers
                    ? "Adding..."
                    : `Add ${selectedIds.size} member${selectedIds.size > 1 ? "s" : ""}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Member Action Bottom Sheet */}
      <Modal
        transparent
        animationType="slide"
        visible={memberActionVisible}
        onRequestClose={() => setMemberActionVisible(false)}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
          activeOpacity={1}
          onPress={() => setMemberActionVisible(false)}
        />

        {/* Sheet */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark
              ? chatTheme.sheetDark
              : chatTheme.sheetLight,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 36,
            paddingTop: 12,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: isDark
                ? chatTheme.handleDark
                : chatTheme.handleLight,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          {/* Avatar + tên + role */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 24,
              paddingHorizontal: 20,
            }}
          >
            <Avatar
              source={
                selectedMember?.avatarUrl
                  ? { uri: selectedMember.avatarUrl }
                  : undefined
              }
              fallback={selectedMember?.name?.charAt(0)?.toUpperCase() ?? "?"}
              className="w-[56px] h-[56px]"
            />
            <Text
              style={{
                color: textColor,
                fontSize: 17,
                fontWeight: "700",
                marginTop: 10,
              }}
            >
              {selectedMember?.name ?? "Unknown"}
            </Text>
            <View
              style={{
                marginTop: 4,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor:
                  selectedMember?.role === "admin"
                    ? chatTheme.accentSubtle
                    : isDark
                      ? chatTheme.dividerDark
                      : chatTheme.dividerLight,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color:
                    selectedMember?.role === "admin"
                      ? chatTheme.accent
                      : chatTheme.textMuted,
                }}
              >
                {selectedMember?.role === "admin" ? "Admin" : "Member"}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: isDark
                ? chatTheme.dividerDark
                : chatTheme.dividerLight,
              marginBottom: 8,
            }}
          />

          {/* Make Admin */}
          {selectedMember?.role === "member" && (
            <TouchableOpacity
              onPress={() => {
                setMemberActionVisible(false);
                if (selectedMember) handlePromoteAdmin(selectedMember);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 15,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(100,181,246,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Text style={{ fontSize: 20 }}>⭐</Text>
              </View>
              <View>
                <Text
                  style={{ color: textColor, fontSize: 15, fontWeight: "600" }}
                >
                  Make Admin
                </Text>
                <Text
                  style={{
                    color: chatTheme.textMuted,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Grant admin permissions
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Remove Admin */}
          {selectedMember?.role === "admin" && (
            <TouchableOpacity
              onPress={() => {
                setMemberActionVisible(false);
                if (selectedMember) handleDemoteAdmin(selectedMember);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingVertical: 15,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isDark
                    ? chatTheme.dividerDark
                    : chatTheme.dividerLight,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View>
                <Text
                  style={{ color: textColor, fontSize: 15, fontWeight: "600" }}
                >
                  Remove Admin
                </Text>
                <Text
                  style={{
                    color: chatTheme.textMuted,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Revoke admin permissions
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: isDark
                ? chatTheme.dividerDark
                : chatTheme.dividerLight,
              marginVertical: 8,
            }}
          />

          {/* Remove from group */}
          <TouchableOpacity
            onPress={() => {
              setMemberActionVisible(false);
              if (selectedMember) handleRemoveMember(selectedMember);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingVertical: 15,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(229,57,53,0.1)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 20 }}>🚫</Text>
            </View>
            <View>
              <Text
                style={{
                  color: chatTheme.danger,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Remove from group
              </Text>
              <Text
                style={{
                  color: chatTheme.textMuted,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Kick this member out
              </Text>
            </View>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            onPress={() => setMemberActionVisible(false)}
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              backgroundColor: isDark
                ? chatTheme.cancelBgDark
                : chatTheme.cancelBgLight,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: "center",
            }}
          >
            <Text style={{ color: textColor, fontSize: 16, fontWeight: "600" }}>
              Cancel
            </Text>
          </TouchableOpacity>
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
