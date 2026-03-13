import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { deletePost, savePost, unsavePost } from "@/lib/service/post.service";
import { colors } from "@/styles/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Modal } from "react-native";
import ReportCard from "@/components/card/report/ReportCard";
import EditPost from "@/components/forms/post/EditPost";

const PostMenu = ({ isAuthor, item, setMenuVisible, setPostsData }: any) => {
  const { colorScheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReport, setIsReport] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.saveIds?.includes(item._id)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [profile, item._id]);

  const closeReport = () => {
    setIsReport(false);
  };

  const handleMenuOption = async (option: string) => {
    if (option === "delete") {
      const token: string | null = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("User is not authenticated");
        return;
      }

      try {
        await deletePost(item._id, token);
        setMenuVisible(false);
        setPostsData((prevPosts: any) =>
          prevPosts.filter((post: any) => post._id !== item._id)
        );
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    } else if (option === "report") {
      setIsReport(true);
    } else if (option === "save") {
      const token: string | null = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("User is not authenticated");
        return;
      }
      if (isSaved) {
        try {
          await unsavePost(item._id, token);
          setMenuVisible(false);
          setIsSaved(false);
        } catch (error) {
          console.error("Failed to save post:", error);
        }
      } else {
        try {
          await savePost(item._id, token);
          setMenuVisible(false);
          setIsSaved(true);
        } catch (error) {
          console.error("Failed to save comment:", error);
        }
      }
    }
  };
  useEffect(() => {
    console.log(isEditing);
    console.log(item);
  }, [isEditing]);

  return (
    <View
      className="absolute rounded-lg p-2 shadow-lg mr-10"
      style={{
        backgroundColor:
          colorScheme === "dark" ? colors.dark[400] : colors.light[400],
        flex: 1,
      }}
    >
      {isAuthor ? (
        <>
          <TouchableOpacity
            onPress={() => {
              setIsEditing(true);
            }}
            className="p-2"
          >
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
                flex: 1,
              }}
              className="font-mmedium"
            >
              Edit Post
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleMenuOption("delete")}
            className="p-2"
          >
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
                flex: 1,
              }}
              className="font-mmedium"
            >
              Delete Post
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMenuVisible(false)}
            className="p-2"
          >
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
                flex: 1,
              }}
              className="font-mmedium"
            >
              Close
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => handleMenuOption("report")}
            className="p-2"
          >
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
                flex: 1,
              }}
            >
              Report Post
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleMenuOption("save")}
            className="p-2"
          >
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
                flex: 1,
              }}
            >
              {isSaved ? "Unsave Post" : "Save Post"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMenuVisible(false)}
            className="p-2"
          >
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
                flex: 1,
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </>
      )}
      <Modal
        animationType="slide"
        visible={isEditing}
        onRequestClose={() => setIsEditing(false)}
      >
        <EditPost
          post={item}
          onClose={() => setIsEditing(false)}
          setPostsData={setPostsData}
        />
      </Modal>
      <Modal
        animationType="none"
        visible={isReport}
        onRequestClose={closeReport}
        transparent={true}
      >
        <ReportCard
          onClose={closeReport}
          type="post"
          entityId={item._id}
          reportedId={profile._id || ""}
        />
      </Modal>
    </View>
  );
};

export default PostMenu;
