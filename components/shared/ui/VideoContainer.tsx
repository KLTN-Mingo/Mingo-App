import React from "react";
import { View, StyleSheet } from "react-native";
import { MediaStream, RTCView } from "react-native-webrtc";

interface VideoContainerProps {
  stream: MediaStream | null;
  isLocalStream: boolean;
}

const VideoContainer: React.FC<VideoContainerProps> = ({
  stream,
  isLocalStream,
}) => {
  if (!stream) {
    return null;
  }

  return (
    <View style={styles.container}>
      <RTCView
        streamURL={stream.toURL()}
        style={styles.video}
        mirror={isLocalStream}
        objectFit="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 300,
    height: 400,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -150 }, { translateY: -200 }],
    zIndex: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default VideoContainer;
