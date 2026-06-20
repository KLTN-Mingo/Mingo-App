import { ResizeMode, Video } from "expo-av";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import type { PostMediaDto } from "@/dtos";
import { isVideoPostMedia } from "@/utils/post-media";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const VIEWER_HEIGHT = SCREEN_HEIGHT * 0.78;

type PostMediaViewerProps = {
  media: PostMediaDto[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
};

export function PostMediaViewer({
  media,
  initialIndex,
  visible,
  onClose,
}: PostMediaViewerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <Pressable
          onPress={onClose}
          className="absolute top-14 right-5 z-10 h-10 w-10 rounded-full bg-black/60 items-center justify-center"
          accessibilityLabel="Close media viewer"
        >
          <Text className="text-2xl text-white">X</Text>
        </Pressable>

        <FlatList
          style={{ flex: 1 }}
          key={`${visible}-${initialIndex}`}
          data={media}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          keyExtractor={(item, index) => item.id || `viewer-media-${index}`}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} className="items-center justify-center">
              {isVideoPostMedia(item) ? (
                <Video
                  source={{ uri: item.mediaUrl }}
                  style={{ width: SCREEN_WIDTH, height: VIEWER_HEIGHT }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                />
              ) : (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={{ width: SCREEN_WIDTH, height: VIEWER_HEIGHT }}
                  resizeMode="contain"
                />
              )}
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}
