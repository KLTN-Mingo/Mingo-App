import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text as RNText,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CameraIcon,
  ImageIcon,
  MicroIcon,
  PlusIcon,
  SendIcon,
} from "@/components/shared/icons/Icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { pickDocument } from "@/lib/utils/document-picker";
import { pickFromCamera, pickMedia } from "@/lib/utils/gallery-picker";

import { BORDER_DEFAULT, getSemantic, getStatusColor } from "@/styles/colors";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const value =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const intVal = Number.parseInt(value, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export type PickedFileLike = {
  uri: string;
  type: string;
  name?: string | null;
  duration?: number;
};

interface MessageInputProps {
  onSend: (content: string) => Promise<void> | void;
  onSendFile?: (file: PickedFileLike) => Promise<void> | void;
  onOpenMic?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  onSendFile,
  onOpenMic,
  placeholder = "Aa...",
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationRef = useRef(0);
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);
  const errorColor = getStatusColor(colorScheme, "error");
  const iconColor =
    colorScheme === "dark" ? semantic.text : semantic.textMuted;
  const placeholderColor = semantic.placeholder;
  const recordingBadgeBg = hexToRgba(errorColor, 0.1);

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  // Sync durationRef để dùng trong stopRecordingAndSend
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Timer đếm thời gian recording
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setDuration((prev) => (prev >= 60 ? 60 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      const activeRecording = recordingRef.current;
      if (activeRecording) {
        void activeRecording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || sending) return;
    setText("");
    setSending(true);
    try {
      await onSend(trimmed);
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handlePlus = async () => {
    if (disabled || !onSendFile) return;
    setSendingFile(true);
    try {
      const files = await pickDocument();
      for (const file of files) {
        if (file.uri) await onSendFile(file);
      }
    } catch (err) {
      console.error("Error sending document:", err);
    } finally {
      setSendingFile(false);
    }
  };

  const handleCamera = async () => {
    if (disabled || !onSendFile) return;
    setSendingFile(true);
    try {
      const file = await pickFromCamera();
      if (file) await onSendFile(file);
    } catch (err) {
      console.error("Error sending camera capture:", err);
    } finally {
      setSendingFile(false);
    }
  };

  const handleImage = async () => {
    if (disabled || !onSendFile) return;
    setSendingFile(true);
    try {
      const files = await pickMedia();
      for (const file of files) {
        if (file.uri) await onSendFile(file);
      }
    } catch (err) {
      console.error("Error sending media:", err);
    } finally {
      setSendingFile(false);
    }
  };

  const startRecording = useCallback(async () => {
    if (disabled || sendingFile || sending || !onSendFile) return;
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Microphone permission required",
          "Please allow microphone access to record voice messages."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: ".mp4",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setDuration(0);
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Recording error", "Unable to start recording.");
    }
  }, [disabled, onSendFile, sending, sendingFile]);

  const stopRecordingAndSend = useCallback(async () => {
    const activeRecording = recordingRef.current;
    if (!activeRecording || !onSendFile) {
      setIsRecording(false);
      setRecording(null);
      setDuration(0);
      return;
    }

    let destUri: string | null = null;

    try {
      // Lấy duration trước khi stop
      const status = await activeRecording.getStatusAsync();
      const durationMillis =
        typeof (status as any).durationMillis === "number"
          ? (status as any).durationMillis
          : 0;
      const durationSeconds =
        durationMillis > 0
          ? Math.floor(durationMillis / 1000)
          : durationRef.current;

      await activeRecording.stopAndUnloadAsync();
      const recordingUri = activeRecording.getURI();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (!recordingUri) {
        Alert.alert("Recording error", "Could not get recorded audio file.");
        return;
      }

      const isIOS = Platform.OS === "ios";
      const audioExt = isIOS ? "m4a" : "mp4";
      const audioType = isIOS ? "audio/m4a" : "audio/mp4";
      const fileName = `voice_${Date.now()}.${audioExt}`;

      // Copy file sang documentDirectory để XHR đọc được
      destUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: recordingUri, to: destUri });

      // Kiểm tra file tồn tại sau khi copy
      const fileInfo = await FileSystem.getInfoAsync(destUri);
      console.log("Audio file info:", JSON.stringify(fileInfo));
      if (!fileInfo.exists) {
        throw new Error("Audio file copy failed — file not found after copy");
      }

      setSendingFile(true);
      await onSendFile({
        uri: destUri,
        type: audioType,
        name: fileName,
        duration: durationSeconds,
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Recording error", "Unable to send voice message.");
    } finally {
      // Cleanup file tạm
      if (destUri) {
        await FileSystem.deleteAsync(destUri, { idempotent: true }).catch(
          () => undefined
        );
      }
      setSendingFile(false);
      setIsRecording(false);
      setRecording(null);
      setDuration(0);
      recordingRef.current = null;
    }
  }, [onSendFile]);

  const cancelRecording = useCallback(async () => {
    const activeRecording = recordingRef.current;
    if (activeRecording) {
      try {
        await activeRecording.stopAndUnloadAsync();
      } catch {}
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
    setIsRecording(false);
    setRecording(null);
    setDuration(0);
    recordingRef.current = null;
  }, []);

  // Tự động dừng và gửi khi đạt 60 giây
  useEffect(() => {
    if (isRecording && duration >= 60) {
      void stopRecordingAndSend();
    }
  }, [duration, isRecording, stopRecordingAndSend]);

  const handleMicro = useCallback(async () => {
    if (disabled || sendingFile || sending) return;
    if (!onSendFile) {
      if (onOpenMic) onOpenMic();
      else
        Alert.alert(
          "Voice message",
          "onSendFile is required to send voice messages."
        );
      return;
    }
    if (isRecording) {
      await stopRecordingAndSend();
      return;
    }
    await startRecording();
  }, [
    disabled,
    isRecording,
    onOpenMic,
    onSendFile,
    sending,
    sendingFile,
    startRecording,
    stopRecordingAndSend,
  ]);

  const fileBusy = sendingFile;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        {isRecording ? (
          // ── Recording UI ──────────────────────────────────────────────────
          <>
            <View
              style={[styles.recordingBadge, { backgroundColor: recordingBadgeBg }]}
            >
              <RNText style={[styles.recordingDot, { color: errorColor }]}>
                ●
              </RNText>
              <RNText style={[styles.recordingText, { color: errorColor }]}>
                {formatDuration(duration)}
              </RNText>
            </View>

            <TouchableOpacity
              onPress={stopRecordingAndSend}
              disabled={sendingFile}
              style={[
                styles.recordingActionBtn,
                { backgroundColor: semantic.primary, opacity: sendingFile ? 0.5 : 1 },
              ]}
            >
              <RNText
                style={[styles.recordingActionText, { color: semantic.onPrimary }]}
              >
                {sendingFile ? "Sending..." : "Send"}
              </RNText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={cancelRecording}
              disabled={sendingFile}
              style={[
                styles.recordingActionBtn,
                { backgroundColor: semantic.surfaceMuted, opacity: sendingFile ? 0.5 : 1 },
              ]}
            >
              <RNText
                style={[styles.recordingActionText, { color: semantic.textMuted }]}
              >
                Cancel
              </RNText>
            </TouchableOpacity>
          </>
        ) : (
          // ── Normal UI ─────────────────────────────────────────────────────
          <>
            <TouchableOpacity
              onPress={handlePlus}
              disabled={fileBusy}
              style={{ opacity: fileBusy ? 0.6 : 1 }}
            >
              <PlusIcon size={33} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCamera}
              disabled={fileBusy}
              style={{ opacity: fileBusy ? 0.6 : 1 }}
            >
              <CameraIcon size={35} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleImage}
              disabled={fileBusy}
              style={{ opacity: fileBusy ? 0.6 : 1 }}
            >
              <ImageIcon size={28} color={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMicro}
              disabled={disabled || fileBusy || sending}
              style={{ opacity: disabled || fileBusy || sending ? 0.5 : 1 }}
            >
              <MicroIcon size={28} color={iconColor} onClick={handleMicro} />
            </TouchableOpacity>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={placeholderColor}
              multiline
              maxLength={4000}
              editable={!disabled}
              style={[
                styles.input,
                {
                  borderColor: BORDER_DEFAULT,
                  color: semantic.text,
                },
              ]}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim() || disabled || sending}
              activeOpacity={0.7}
              style={{
                opacity: text.trim() && !disabled && !sending ? 1 : 0.5,
              }}
            >
              <SendIcon size={28} color={semantic.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
    marginBottom: 5,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 10,
    gap: 6,
    paddingTop: 4,
    minHeight: 60,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  recordingBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  recordingDot: {
    fontSize: 10,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  recordingActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  recordingActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
