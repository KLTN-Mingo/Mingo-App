import React, { useEffect, useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import { ThreeDot } from "@/components/shared/icons/Icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { dislikePost } from "@/lib/service/post.service";
import { getMyLikedPosts } from "@/lib/service/user.service";
import { colors } from "@/styles/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LikedPosts = () => {
  const [listLikePosts, setListLikePosts] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { profile } = useAuth();
  const { colorScheme } = useTheme();
  const iconColor =
    colorScheme === "dark" ? colors.dark[100] : colors.light[100];

  const handleUnlike = async () => {
    try {
      const token: string | null = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("User is not authenticated");
        return;
      }
      if (token && selectedPostId) {
        await dislikePost(selectedPostId, token);
        setListLikePosts((prevPosts: any[]) =>
          prevPosts.filter((post) => post._id !== selectedPostId)
        );
      } else {
        console.warn("User is not authenticated or postId is missing");
      }
    } catch (error) {
      console.error("Error unsaving post:", error);
    }
    setIsModalVisible(false);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPostsData = async () => {
      try {
        const listPost = await getMyLikedPosts(profile._id);
        if (isMounted) {
          setListLikePosts(listPost);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPostsData();

    return () => {
      isMounted = false;
    };
  }, [profile?._id]);

  const renderPostItem = ({ item }: any) => (
    <View
      style={{
        flexDirection: "row",
        padding: 10,
        marginBottom: 10,
        backgroundColor: colors.light[500],
        borderRadius: 8,
      }}
    >
      <Image
        source={{
          uri:
            item.author.avatar ||
            "https://i.pinimg.com/736x/bd/6d/29/bd6d29e8c449566546b696308aaa2da0.jpg",
        }}
        style={{ width: 70, height: 70, borderRadius: 8 }}
      />

      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text
          style={{
            fontWeight: "bold",
            color: colors.light[500],
            fontSize: 16,
          }}
        >
          {item.author.firstName} {item.author.lastName}
        </Text>
        <Text
          style={{
            color: colors.light[500],
            fontSize: 14,
            marginTop: 5,
            flexShrink: 1,
          }}
          numberOfLines={2}
        >
          {item.content || "No description available"}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          setSelectedPostId(item._id);
          setIsModalVisible(true);
        }}
      >
        <ThreeDot size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={listLikePosts}
        keyExtractor={(item) => item._id}
        renderItem={renderPostItem}
        contentContainerStyle={{ marginTop: 10 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={{
              width: "80%",
              backgroundColor:
                colorScheme === "dark" ? colors.dark[300] : colors.light[500],
              borderRadius: 10,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text style={[styles.modalTitle, { color: colors.primary[100] }]}>
              Unlike Post
            </Text>
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[500],
              }}
            >
              Are you sure you want to unlike this post?
            </Text>
            <View style={styles.buttonContainer} className="mt-5">
              <Pressable
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      colorScheme === "dark"
                        ? colors.dark[400]
                        : colors.light[500],
                    flex: 1,
                  },
                ]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text
                  style={{
                    color:
                      colorScheme === "dark"
                        ? colors.dark[100]
                        : colors.light[500],
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: colors.primary[100] },
                ]}
                onPress={handleUnlike}
              >
                <Text style={styles.unsaveText}>Unlike</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },

  unsaveText: {
    color: "white",
  },
});

export default LikedPosts;
