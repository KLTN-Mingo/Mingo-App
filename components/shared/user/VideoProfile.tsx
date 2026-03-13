import { getMyVideos } from "@/lib/service/user.service";
import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Modal } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { getMediaByMediaId } from "@/lib/service/media.service";
import { getCommentByCommentId } from "@/lib/service/comment.service";
import { UserBasicInfo } from "@/dtos/UserDTO";
import { useAuth } from "@/context/AuthContext";
import MediaDetailCard from "@/components/card/media/MediaDetailCard";
interface VideoProfileProps {
  profileUser: UserBasicInfo;
}
const VideoProfile = ({ profileUser }: VideoProfileProps) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [commentsData, setCommentsData] = useState<any[]>([]);
  const { profile } = useAuth();
  const profileBasic: UserBasicInfo = {
    _id: profile?._id,
    avatar: profile?.avatar,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
  };
  const fetchVideosdata = async () => {
    try {
      if (profileUser._id) {
        const data = await getMyVideos(profileUser._id);
        setVideos(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchVideosdata();
  }, []);

  const handleClick = async (video: any) => {
    try {
      const data = await getMediaByMediaId(video._id);
      const detailsComments = await Promise.all(
        data.comments.map(async (comment: any) => {
          return await getCommentByCommentId(comment);
        })
      );
      setSelectedVideo(data);
      setCommentsData(detailsComments);
      setOpenModal(true);
    } catch (error) {
      console.error("Error loading video details:", error);
    }
  };

  return (
    <View className="flex flex-wrap mt-2">
      <View className="flex flex-row flex-wrap">
        {videos.map((item, index) => (
          <TouchableOpacity
            onPress={() => {
              handleClick(item);
            }}
            key={index}
            className="flex flex-col items-center mb-4 mx-4"
            style={{ width: "33%" }}
          >
            <VideoPlayer videoUrl={item.url} />
          </TouchableOpacity>
        ))}
      </View>
      <Modal
        transparent={true}
        animationType="slide"
        visible={openModal}
        onRequestClose={
          () => setOpenModal(false)
          // setSelectedImage(null);
        }
      >
        {openModal && (
          <MediaDetailCard
            isModalVisible={openModal}
            setModalVisible={setOpenModal}
            media={selectedVideo}
            profileBasic={profileBasic}
            commentsData={commentsData}
            setCommentsData={setCommentsData}
          />
        )}
      </Modal>
    </View>
  );
};

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});

  return (
    <View>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={{ width: 150, height: 90, borderRadius: 10 }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
    </View>
  );
};

export default VideoProfile;
