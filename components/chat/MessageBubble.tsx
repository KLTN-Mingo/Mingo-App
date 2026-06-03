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
import { chatTheme } from "@/constants/chatTheme";
import { MessageResponseDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
<<<<<<< HEAD
import { messageService } from "@/services/message.service";
=======

// Mingo MessageBubble colors
const bubbleColors = {
  own: "#768D85", // primary light
  ownDark: "#515E5A", // primary dark
  otherLight: "#F1F4F3", // surface light
  otherDark: "#252525", // surface dark
  dateMuted: "#6B6B6B", // text secondary
};
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d

interface MessageBubbleProps {
  message: MessageResponseDto;
  isOwn: boolean;
  showDateSeparator?: boolean;
  dateLabel?: string;
  otherAvatarUrl?: string | null;
  senderName?: string | null;
  onMessageRevoked?: (messageId: string) => void;
  onMessageDeleted?: (messageId: string) => void;
  onMessageEdited?: (messageId: string, newContent: string) => void;
  onMessageReverted?: (messageId: string, snapshot: MessageResponseDto) => void;
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
<<<<<<< HEAD
  otherTextColor,
}: {
  message: MessageResponseDto;
  isOwn: boolean;
  otherTextColor: string;
=======
  textColor,
}: {
  message: MessageResponseDto;
  isOwn: boolean;
  textColor: string;
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
}) {
  const messageType = useMemo(() => resolveMessageType(message), [message]);
  const uri = useMemo(() => resolveMediaUri(message), [message]);
  const fileName = useMemo(() => resolveFileName(message), [message]);
  const durationLabel = useMemo(() => resolveAudioDuration(message), [message]);

  if (messageType === "text") {
    return (
<<<<<<< HEAD
      <View>
        <Text
          style={[
            styles.bubbleText,
            isOwn ? styles.textOwn : { color: otherTextColor },
          ]}
          selectable
        >
          {message.content || ""}
        </Text>
        {message.isEdited && (
          <Text
            style={[
              styles.bubbleText,
              isOwn ? styles.textOwn : { color: otherTextColor },
              styles.editedText,
            ]}
          >
            (Edited)
          </Text>
        )}
      </View>
=======
      <Text
        style={[styles.bubbleText, { color: textColor }]}
        selectable
      >
        {message.content || ""}
      </Text>
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
    );
  }

  if (!uri) {
    return (
<<<<<<< HEAD
      <Text
        style={[
          styles.bubbleText,
          isOwn ? styles.textOwn : { color: otherTextColor },
        ]}
      >
=======
      <Text style={[styles.bubbleText, { color: textColor }]}>
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
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
<<<<<<< HEAD
          style={[
            styles.bubbleText,
            isOwn ? styles.textOwn : { color: otherTextColor },
          ]}
=======
          style={[styles.bubbleText, { color: textColor }]}
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
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
  senderName,
  onMessageRevoked,
  onMessageDeleted,
  onMessageEdited,
  onMessageReverted,
}: MessageBubbleProps) {
  const isRevoked = message.isRevoked;
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
<<<<<<< HEAD
  const otherBubbleBg = isDark
    ? chatTheme.otherBubbleDark
    : chatTheme.otherBubbleLight;
  const otherBubbleText = isDark
    ? chatTheme.otherBubbleTextDark
    : chatTheme.otherBubbleTextLight;

  const [actionVisible, setActionVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editText, setEditText] = useState(message.content ?? "");

  const messageType = resolveMessageType(message);
  const isTextMessage = messageType === "text";

  const handleRevoke = async () => {
    setActionVisible(false);

    const snapshot = { ...message };
    onMessageRevoked?.(message.id);

    try {
      await messageService.deleteOrRevokeMessage(message.id, "revoke");
    } catch (err: any) {
      onMessageReverted?.(message.id, snapshot);
      Alert.alert("Error", err?.message ?? "Failed to unsend");
    }
  };

  const handleDelete = async () => {
    setActionVisible(false);

    const snapshot = { ...message };
    onMessageDeleted?.(message.id);

    try {
      await messageService.deleteOrRevokeMessage(message.id, "delete");
    } catch (err: any) {
      onMessageReverted?.(message.id, snapshot);
      Alert.alert("Error", err?.message ?? "Failed to delete");
    }
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

    onMessageEdited?.(message.id, newContent);
    setEditVisible(false);

    try {
      await messageService.editMessage(message.id, newContent);
    } catch (err: any) {
      onMessageEdited?.(message.id, oldContent);
      Alert.alert("Error", err?.message ?? "Failed to edit message");
    }
  };
=======

  const otherBubbleBg = isDark ? bubbleColors.otherDark : bubbleColors.otherLight;
  const ownBubbleBg = isDark ? bubbleColors.ownDark : bubbleColors.own;
  const textColorOwn = "#FFFFFF";
  const textColorOther = isDark ? "#FAFAFA" : "#1E2021";
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d

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
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>
                  {(senderName ?? "?").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

<<<<<<< HEAD
        <View style={{ flexDirection: "column", flexShrink: 1 }}>
          {!isOwn && senderName && (
=======
        <View
          style={[
            styles.bubble,
            isOwn ? [styles.bubbleOwn, { backgroundColor: ownBubbleBg }] : { backgroundColor: otherBubbleBg },
            isOwn ? styles.bubbleOwnRadius : styles.bubbleOtherRadius,
          ]}
        >
          {isRevoked ? (
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
            <Text
              style={{
                fontSize: 11,
                color: chatTheme.textMuted,
                marginLeft: 4,
                marginBottom: 2,
              }}
            >
              {senderName}
            </Text>
          )}

          <TouchableOpacity
            onLongPress={() => {
              if (isOwn && !isRevoked) {
                setActionVisible(true);
              }
            }}
            activeOpacity={isOwn && !isRevoked ? 0.85 : 1}
            delayLongPress={350}
          >
            <View
              style={[
<<<<<<< HEAD
                styles.bubble,
                isOwn ? styles.bubbleOwn : { backgroundColor: otherBubbleBg },
                { alignSelf: "flex-start" },
              ]}
            >
              {isRevoked ? (
                <Text
                  style={[
                    styles.bubbleText,
                    isOwn ? styles.textOwn : { color: otherBubbleText },
                    styles.unsentText,
                  ]}
                >
                  Message unsent
                </Text>
              ) : (
                <MessageContent
                  message={message}
                  isOwn={isOwn}
                  otherTextColor={otherBubbleText}
                />
              )}
            </View>
          </TouchableOpacity>
=======
                styles.bubbleText,
                { color: textColorOther },
                styles.unsentText,
              ]}
            >
              Message unsent
            </Text>
          ) : (
            <MessageContent
              message={message}
              isOwn={isOwn}
              textColor={isOwn ? textColorOwn : textColorOther}
            />
          )}
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
        </View>
      </View>

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
              <View style={actionStyles.contentCenter}>
                <Text style={actionStyles.rowTitle}>Edit</Text>
                <Text style={actionStyles.rowSub}>Change message content</Text>
              </View>
            </TouchableOpacity>
          )}

          {isOwn && (
            <>
              <View style={actionStyles.divider} />
              <TouchableOpacity style={actionStyles.row} onPress={handleRevoke}>
                <View style={actionStyles.contentCenter}>
                  <Text
                    style={[actionStyles.rowTitle, { color: chatTheme.danger }]}
                  >
                    Unsend
                  </Text>
                  <Text style={actionStyles.rowSub}>Remove for everyone</Text>
                </View>
              </TouchableOpacity>

              <View style={actionStyles.divider} />
              <TouchableOpacity style={actionStyles.row} onPress={handleDelete}>
                <View style={actionStyles.contentCenter}>
                  <Text
                    style={[actionStyles.rowTitle, { color: chatTheme.danger }]}
                  >
                    Delete
                  </Text>
                  <Text style={actionStyles.rowSub}>Remove for you only</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={actionStyles.cancelBtn}
            onPress={() => setActionVisible(false)}
          >
            <Text style={actionStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
                backgroundColor: isDark
                  ? chatTheme.sheetDark
                  : chatTheme.sheetLight,
                borderRadius: 20,
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: isDark ? chatTheme.textDark : chatTheme.textLight,
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
                  backgroundColor: isDark
                    ? chatTheme.cancelBgDark
                    : chatTheme.cancelBgLight,
                  borderRadius: 12,
                  padding: 12,
                  color: isDark ? chatTheme.textDark : chatTheme.textLight,
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
                      colorScheme === "dark"
                        ? chatTheme.cancelBgDark
                        : chatTheme.cancelBgLight,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? chatTheme.textDark : chatTheme.textLight,
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
                    backgroundColor: chatTheme.accent,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: chatTheme.accentText, fontWeight: "600" }}
                  >
                    Save
                  </Text>
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
    color: chatTheme.dateMuted,
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
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallback: {
    backgroundColor: chatTheme.ownBubble,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  bubble: {
<<<<<<< HEAD
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
    backgroundColor: chatTheme.ownBubble,
=======
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOwnRadius: {},
  bubbleOtherRadius: {
    borderBottomLeftRadius: 4,
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
  },
  bubbleText: {
    fontSize: 14,
<<<<<<< HEAD
  },
  textOwn: {
    color: "#ffffff",
  },
  textOther: {
    color: chatTheme.otherBubbleTextDark,
=======
    fontFamily: "Montserrat-Regular",
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
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
<<<<<<< HEAD
    color: "#ffffff",
=======
    color: bubbleColors.dateMuted,
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
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
<<<<<<< HEAD
    color: "#ffffff",
=======
    color: "#FFFFFF",
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Montserrat-SemiBold",
  },
  fileWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 220,
  },
  fileIcon: {
    fontSize: 18,
    fontFamily: "Montserrat-Regular",
  },
  fileNameText: {
<<<<<<< HEAD
    color: "#ffffff",
=======
>>>>>>> 36502be4165c9aa5ed4f62ad51c90625dae8177d
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    flexShrink: 1,
  },
});

const actionStyles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: chatTheme.sheetDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: chatTheme.handleDark,
    alignSelf: "center",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: chatTheme.dividerDark,
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
  contentCenter: {
    flex: 1,
    alignItems: "center",
  },
  rowTitle: {
    color: chatTheme.textDark,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  rowSub: {
    color: chatTheme.textMuted,
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: chatTheme.cancelBgDark,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  cancelText: {
    color: chatTheme.textDark,
    fontSize: 16,
    fontWeight: "600",
  },
});
