import { Audio, AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Text } from "@/components/ui";
import { MessageResponseDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { messageService } from "@/services/message.service";

// Old Mingo_App MessageCard colors
const bubbleColors = {
  own: "#768D85", // primary[100]
  otherDark: "#2D2F2F", // dark[400]
  otherLight: "#c01414", // light surface for other bubble
  dateMuted: "#6B7280",
};

interface MessageBubbleProps {
  message: MessageResponseDto;
  isOwn: boolean;
  showDateSeparator?: boolean;
  dateLabel?: string;
  otherAvatarUrl?: string | null;
  onMessageRevoked?: (messageId: string) => void;
  onMessageDeleted?: (messageId: string) => void;
  onMessageEdited?: (messageId: string, newContent: string) => void;
}

type BubbleMessageType = "text" | "image" | "video" | "audio" | "file";

type ContentIdLike = {
  type?: string | null;
  url?: string | null;
  uri?: string | null;
  fileName?: string | null;
  duration?: number | string | null;
};

function mapContentType(type?: string | null): BubbleMessageType {
  const normalized = (type ?? "").toLowerCase();

  if (normalized === "image") return "image";
  if (normalized === "video") return "video";
  if (normalized === "audio" || normalized === "voice") return "audio";
  if (normalized === "other" || normalized === "file") return "file";

  return "text";
}

function resolveMessageType(message: MessageResponseDto): BubbleMessageType {
  const contentId = (
    message as MessageResponseDto & { contentId?: ContentIdLike }
  ).contentId;

  if (contentId?.type) {
    return mapContentType(contentId.type);
  }

  if (message.contentType) {
    return mapContentType(message.contentType);
  }

  if (message.attachment?.type) {
    return mapContentType(message.attachment.type);
  }

  return "text";
}

function resolveMediaUri(message: MessageResponseDto): string | null {
  const contentId = (
    message as MessageResponseDto & { contentId?: ContentIdLike }
  ).contentId;
  return (
    contentId?.url ??
    contentId?.uri ??
    message.attachment?.url ??
    message.content ??
    null
  );
}

function resolveFileName(message: MessageResponseDto): string {
  const contentId = (
    message as MessageResponseDto & { contentId?: ContentIdLike }
  ).contentId;
  return (
    contentId?.fileName ??
    message.attachment?.fileName ??
    resolveMediaUri(message)?.split("/").pop() ??
    "attachment"
  );
}

function resolveAudioDuration(message: MessageResponseDto): string {
  const contentId = (
    message as MessageResponseDto & { contentId?: ContentIdLike }
  ).contentId;
  const rawDuration = contentId?.duration ?? message.attachment?.duration;
  const durationSec =
    typeof rawDuration === "string"
      ? Number(rawDuration)
      : typeof rawDuration === "number"
        ? rawDuration
        : 0;

  if (!Number.isFinite(durationSec) || durationSec <= 0) return "00:00";

  const minutes = Math.floor(durationSec / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(durationSec % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function ImageMessage({ uri }: { uri: string }) {
  return (
    <Image source={{ uri }} style={styles.imageMessage} resizeMode="cover" />
  );
}

function VideoMessage({ uri }: { uri: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
  }, []);

  return (
    <View style={styles.videoWrap}>
      <Video
        source={{ uri }}
        style={styles.videoMessage}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        onPlaybackStatusUpdate={handleStatusUpdate}
      />
      <Text style={styles.mediaMetaText}>
        {isPlaying ? "Playing" : "Paused"}
      </Text>
    </View>
  );
}

function AudioMessage({
  uri,
  durationLabel,
}: {
  uri: string;
  durationLabel: string;
}) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        void sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!sound) {
      const { sound: createdSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(createdSound);
      setIsPlaying(true);
      return;
    }

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }, [onPlaybackStatusUpdate, sound, uri]);

  return (
    <View style={styles.audioWrap}>
      <TouchableOpacity style={styles.audioButton} onPress={togglePlayPause}>
        <Text style={styles.audioButtonText}>
          {isPlaying ? "Pause" : "Play"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.mediaMetaText}>{durationLabel}</Text>
    </View>
  );
}

function FileMessage({ uri, fileName }: { uri: string; fileName: string }) {
  const onOpenFile = useCallback(async () => {
    const canOpen = await Linking.canOpenURL(uri);
    if (!canOpen) return;
    await Linking.openURL(uri);
  }, [uri]);

  return (
    <TouchableOpacity style={styles.fileWrap} onPress={onOpenFile}>
      <Text style={styles.fileIcon}>📎</Text>
      <Text style={styles.fileNameText} numberOfLines={1}>
        {fileName}
      </Text>
    </TouchableOpacity>
  );
}

function MessageContent({
  message,
  isOwn,
}: {
  message: MessageResponseDto;
  isOwn: boolean;
}) {
  const messageType = useMemo(() => resolveMessageType(message), [message]);
  const uri = useMemo(() => resolveMediaUri(message), [message]);
  const fileName = useMemo(() => resolveFileName(message), [message]);
  const durationLabel = useMemo(() => resolveAudioDuration(message), [message]);

  if (messageType === "text") {
    return (
      <View>
        <Text
          style={[styles.bubbleText, isOwn ? styles.textOwn : styles.textOther]}
          selectable
        >
          {message.content || ""}
        </Text>
        {message.isEdited && (
          <Text style={[styles.bubbleText, isOwn ? styles.textOwn : styles.textOther, styles.editedText]}>
            (Edited)
          </Text>
        )}
      </View>
    );
  }

  if (!uri) {
    return (
      <Text
        style={[styles.bubbleText, isOwn ? styles.textOwn : styles.textOther]}
      >
        Unsupported message
      </Text>
    );
  }

  switch (messageType) {
    case "image":
      return <ImageMessage uri={uri} />;
    case "video":
      return <VideoMessage uri={uri} />;
    case "audio":
      return <AudioMessage uri={uri} durationLabel={durationLabel} />;
    case "file":
      return <FileMessage uri={uri} fileName={fileName} />;
    default:
      return (
        <Text
          style={[styles.bubbleText, isOwn ? styles.textOwn : styles.textOther]}
          selectable
        >
          {message.content || ""}
        </Text>
      );
  }
}

export function MessageBubble({
  message,
  isOwn,
  showDateSeparator,
  dateLabel,
  otherAvatarUrl,
  onMessageRevoked,
  onMessageDeleted,
  onMessageEdited,
}: MessageBubbleProps) {
  const isRevoked = message.isRevoked;
  const colorScheme = useColorScheme() ?? "light";
  const otherBubbleBg =
    colorScheme === "dark" ? bubbleColors.otherDark : bubbleColors.otherDark;

  const [actionVisible, setActionVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editText, setEditText] = useState(message.content ?? "");

  const messageType = resolveMessageType(message);
  const isTextMessage = messageType === "text";

  const handleRevoke = async () => {
    setActionVisible(false);
    Alert.alert("Unsend message", "Remove this message for everyone?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unsend",
        style: "destructive",
        onPress: async () => {
          try {
            await messageService.deleteOrRevokeMessage(message.id, "revoke");
            onMessageRevoked?.(message.id);
          } catch (err: any) {
            Alert.alert("Error", err?.message ?? "Failed to unsend");
          }
        },
      },
    ]);
  };

  const handleDelete = async () => {
    setActionVisible(false);
    Alert.alert("Delete message", "Delete this message for you only?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await messageService.deleteOrRevokeMessage(message.id, "delete");
            onMessageDeleted?.(message.id);
          } catch (err: any) {
            Alert.alert("Error", err?.message ?? "Failed to delete");
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    setActionVisible(false);
    setEditText(message.content ?? "");
    setEditVisible(true);
  };

  const handleSubmitEdit = async () => {
    if (!editText.trim() || editText.trim() === message.content) {
      setEditVisible(false);
      return;
    }
    const newContent = editText.trim();
    const oldContent = message.content ?? "";

    // Optimistic update: cập nhật UI ngay lập tức
    onMessageEdited?.(message.id, newContent);
    setEditVisible(false);

    try {
      await messageService.editMessage(message.id, newContent);
    } catch (err: any) {
      // Rollback nếu API fail
      onMessageEdited?.(message.id, oldContent);
      Alert.alert("Error", err?.message ?? "Failed to edit message");
    }
  };

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.containerOwn : styles.containerOther,
      ]}
    >
      {showDateSeparator && dateLabel && (
        <View style={styles.dateWrapper}>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
      )}

      <View style={styles.row}>
        {!isOwn && (
          <View style={styles.avatarWrap}>
            {otherAvatarUrl ? (
              <Image source={{ uri: otherAvatarUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[styles.avatar, { backgroundColor: otherBubbleBg }]}
              />
            )}
          </View>
        )}

        <TouchableOpacity
          onLongPress={() => {
            if (!isRevoked) setActionVisible(true);
          }}
          activeOpacity={0.85}
          delayLongPress={350}
        >
          <View
            style={[
              styles.bubble,
              isOwn ? styles.bubbleOwn : { backgroundColor: otherBubbleBg },
              { alignSelf: "flex-start" },
            ]}
          >
            {isRevoked ? (
              <Text
                style={[
                  styles.bubbleText,
                  isOwn ? styles.textOwn : styles.textOther,
                  styles.unsentText,
                ]}
              >
                Message unsent
              </Text>
            ) : (
              <MessageContent message={message} isOwn={isOwn} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Action Bottom Sheet */}
      <Modal
        transparent
        animationType="slide"
        visible={actionVisible}
        onRequestClose={() => setActionVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
          activeOpacity={1}
          onPress={() => setActionVisible(false)}
        />
        <View style={actionStyles.sheet}>
          <View style={actionStyles.handle} />

          {isOwn && isTextMessage && (
            <TouchableOpacity style={actionStyles.row} onPress={handleEdit}>
              <View
                style={[
                  actionStyles.iconWrap,
                  { backgroundColor: "rgba(100,181,246,0.15)" },
                ]}
              >
                <Text style={{ fontSize: 20 }}>✏️</Text>
              </View>
              <View>
                <Text style={actionStyles.rowTitle}>Edit</Text>
                <Text style={actionStyles.rowSub}>Change message content</Text>
              </View>
            </TouchableOpacity>
          )}

          {isOwn && (
            <>
              <View style={actionStyles.divider} />
              <TouchableOpacity style={actionStyles.row} onPress={handleRevoke}>
                <View
                  style={[
                    actionStyles.iconWrap,
                    { backgroundColor: "rgba(229,57,53,0.1)" },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>↩️</Text>
                </View>
                <View>
                  <Text style={[actionStyles.rowTitle, { color: "#E53935" }]}>
                    Unsend
                  </Text>
                  <Text style={actionStyles.rowSub}>Remove for everyone</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          <View style={actionStyles.divider} />
          <TouchableOpacity style={actionStyles.row} onPress={handleDelete}>
            <View
              style={[
                actionStyles.iconWrap,
                { backgroundColor: "rgba(229,57,53,0.1)" },
              ]}
            >
              <Text style={{ fontSize: 20 }}>🗑️</Text>
            </View>
            <View>
              <Text style={[actionStyles.rowTitle, { color: "#E53935" }]}>
                Delete
              </Text>
              <Text style={actionStyles.rowSub}>Remove for you only</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={actionStyles.cancelBtn}
            onPress={() => setActionVisible(false)}
          >
            <Text style={actionStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={editVisible}
        onRequestClose={() => setEditVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setEditVisible(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                backgroundColor: colorScheme === "dark" ? "#252525" : "#FFFFFF",
                borderRadius: 20,
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: colorScheme === "dark" ? "#CFBFAD" : "#1E2021",
                  fontSize: 17,
                  fontWeight: "700",
                  marginBottom: 16,
                }}
              >
                Edit message
              </Text>

              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
                style={{
                  backgroundColor: colorScheme === "dark" ? "#333" : "#F5F5F5",
                  borderRadius: 12,
                  padding: 12,
                  color: colorScheme === "dark" ? "#CFBFAD" : "#1E2021",
                  fontSize: 15,
                  minHeight: 80,
                  maxHeight: 160,
                  textAlignVertical: "top",
                  marginBottom: 16,
                }}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setEditVisible(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 12,
                    backgroundColor:
                      colorScheme === "dark" ? "#333" : "#F0F0F0",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colorScheme === "dark" ? "#CFBFAD" : "#1E2021",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitEdit}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 12,
                    backgroundColor: "#FFAABB",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  containerOwn: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  containerOther: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  dateWrapper: {
    alignSelf: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: bubbleColors.dateMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
  },
  avatarWrap: {
    alignSelf: "flex-end",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  bubble: {
    maxWidth: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  bubbleOwn: {
    backgroundColor: bubbleColors.own,
  },
  bubbleOther: {},
  bubbleText: {
    fontSize: 14,
  },
  textOwn: {
    color: "#ffffff",
  },
  textOther: {
    color: "#ffffff",
  },
  unsentText: {
    fontStyle: "italic",
  },
  editedText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  videoWrap: {
    gap: 6,
  },
  videoMessage: {
    width: 220,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
  },
  mediaMetaText: {
    color: "#ffffff",
    fontSize: 12,
    opacity: 0.9,
  },
  audioWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  audioButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  audioButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  fileWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 220,
  },
  fileIcon: {
    fontSize: 18,
  },
  fileNameText: {
    color: "#ffffff",
    fontSize: 13,
    flexShrink: 1,
  },
});

const actionStyles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#252525",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginHorizontal: 20,
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rowTitle: {
    color: "#CFBFAD",
    fontSize: 15,
    fontWeight: "600",
  },
  rowSub: {
    color: "#92898A",
    fontSize: 12,
    marginTop: 2,
  },
  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#333",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  cancelText: {
    color: "#CFBFAD",
    fontSize: 16,
    fontWeight: "600",
  },
});
