import { useCall } from "@/context/CallContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CallRoomScreen() {
  const router = useRouter();
  const { isVideoCall, receiverAva } = useLocalSearchParams<{
    roomId?: string;
    isVideoCall?: string;
    receiverAva?: string;
  }>();
  const { ongoingCall, handleHangUp } = useCall();

  const [callDuration, setCallDuration] = useState(0);
  const isVideo = isVideoCall === "true";
  const isOutgoing = ongoingCall?.callStatus === "outgoing";
  const isConnected = ongoingCall?.callStatus === "connected" || (ongoingCall && ongoingCall.callStatus !== "outgoing");

  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => setCallDuration((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isConnected]);

  const endCall = () => {
    handleHangUp({
      ongoingCall: ongoingCall ?? undefined,
      isEmitHangUp: true,
    });
    router.back();
  };

  const remoteName =
    ongoingCall?.participants?.receiver?.profile?.name ?? "Unknown";
  const remoteAvatar = receiverAva || ongoingCall?.participants?.receiver?.profile?.avatar;

  if (isOutgoing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.remoteVideo}>
          {remoteAvatar ? (
            <Image
              source={{ uri: remoteAvatar }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {remoteName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.callingText}>Đang gọi...</Text>
          <Text style={styles.remoteName}>{remoteName}</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={endCall}
            style={[styles.controlButton, styles.endCall]}
          >
            <Ionicons name="call" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isVideo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />

        <View style={styles.remoteVideo}>
          {remoteAvatar ? (
            <Image
              source={{ uri: remoteAvatar }}
              style={styles.remoteAvatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.remoteAvatarPlaceholder}>
              <Text style={styles.callingText}>{remoteName}</Text>
            </View>
          )}
          <Text style={styles.callingSubtext}>
            {formatTime(callDuration)}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={endCall}
            style={[styles.controlButton, styles.endCall]}
          >
            <Ionicons name="call" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <View style={styles.audioCallBackground}>
        {remoteAvatar ? (
          <Image
            source={{ uri: remoteAvatar }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {remoteName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.remoteName}>{remoteName}</Text>
        <Text style={styles.callDuration}>{formatTime(callDuration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={endCall}
          style={[styles.controlButton, styles.endCall]}
        >
          <Ionicons name="call" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  remoteAvatarImage: {
    width: "100%",
    height: "100%",
  },
  remoteAvatarPlaceholder: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  callingText: {
    color: "#fff",
    fontSize: 18,
  },
  callingSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 8,
  },
  audioCallBackground: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "600",
  },
  remoteName: {
    color: "#fff",
    fontSize: 20,
    marginTop: 16,
    fontWeight: "500",
  },
  callDuration: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    marginTop: 8,
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    paddingVertical: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    padding: 15,
    minWidth: 50,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  endCall: {
    backgroundColor: "#ff4d4d",
    borderRadius: 50,
  },
});
