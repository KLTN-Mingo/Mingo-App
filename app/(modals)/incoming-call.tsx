import type { OngoingCall } from "@/dtos/call.dto";
import { useCall } from "@/context/CallContext";
import { useRingtone } from "@/hooks/useRingtone";
import { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { colors, statusColors } from "@/styles/colors";

export default function IncomingCallScreen() {
  const { ongoingCall, acceptCall, rejectCall } = useCall();
  const { playRingtone, stopRingtone } = useRingtone();

  useEffect(() => {
    const setup = async () => {
      await playRingtone();
    };
    setup();
    return () => {
      stopRingtone();
    };
  }, [playRingtone, stopRingtone]);

  const accept = (call: OngoingCall) => {
    if (!call) return;
    stopRingtone();
    acceptCall(call);
  };

  const reject = (call: OngoingCall) => {
    if (!call) return;
    stopRingtone();
    rejectCall(call);
  };

  const caller = ongoingCall?.participants?.caller;

  if (!ongoingCall?.isRinging) return null;

  const avatarUri = caller?.profile?.avatar;

  const content = (
    <>
      <View style={styles.topContainer}>
        <Text style={styles.title}>Incoming call</Text>
        <Text style={styles.caller}>
          {caller?.profile?.name ?? "Unknown"}
        </Text>
        <Text style={styles.subtitle}>
          {ongoingCall.isVideoCall ? "Video call" : "Audio call"}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => accept(ongoingCall)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => reject(ongoingCall)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  if (avatarUri) {
    return (
      <ImageBackground source={{ uri: avatarUri }} style={styles.container}>
        {content}
      </ImageBackground>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.dark[500],
  },
  topContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  title: {
    color: colors.light[400],
    fontSize: 28,
    marginBottom: 16,
    fontWeight: "bold",
  },
  caller: {
    color: colors.light[400],
    fontSize: 22,
    marginBottom: 8,
    fontWeight: "400",
    textShadowColor: colors.dark[500],
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 30,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: statusColors.success.dark,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: statusColors.error.dark,
    marginLeft: 10,
  },
  buttonText: {
    color: colors.light[400],
    fontWeight: "bold",
    textAlign: "center",
  },
});
