import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Audio, AVPlaybackStatus, ResizeMode, Video } from "expo-av";

import { Text } from "@/components/ui";
import { MessageResponseDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";

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
  const contentId = (message as MessageResponseDto & { contentId?: ContentIdLike })
    .contentId;

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
  const contentId = (message as MessageResponseDto & { contentId?: ContentIdLike })
    .contentId;
  return (
    contentId?.url ?? contentId?.uri ?? message.attachment?.url ?? message.content ?? null
  );
}

function resolveFileName(message: MessageResponseDto): string {
  const contentId = (message as MessageResponseDto & { contentId?: ContentIdLike })
    .contentId;
  return (
    contentId?.fileName ??
    message.attachment?.fileName ??
    resolveMediaUri(message)?.split("/").pop() ??
    "attachment"
  );
}

function resolveAudioDuration(message: MessageResponseDto): string {
  const contentId = (message as MessageResponseDto & { contentId?: ContentIdLike })
    .contentId;
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
  return <Image source={{ uri }} style={styles.imageMessage} resizeMode="cover" />;
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
      <Text style={styles.mediaMetaText}>{isPlaying ? "Playing" : "Paused"}</Text>
    </View>
  );
}

function AudioMessage({ uri, durationLabel }: { uri: string; durationLabel: string }) {
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
        <Text style={styles.audioButtonText}>{isPlaying ? "Pause" : "Play"}</Text>
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
      <Text
        style={[styles.bubbleText, isOwn ? styles.textOwn : styles.textOther]}
        selectable
      >
        {message.content || ""}
      </Text>
    );
  }

  if (!uri) {
    return (
      <Text style={[styles.bubbleText, isOwn ? styles.textOwn : styles.textOther]}>
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
}: MessageBubbleProps) {
  const isRevoked = message.isRevoked;
  const colorScheme = useColorScheme() ?? "light";
  const otherBubbleBg =
    colorScheme === "dark" ? bubbleColors.otherDark : bubbleColors.otherDark;

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

        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : { backgroundColor: otherBubbleBg },
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
      </View>
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
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
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
