import { getTimestamp } from "@/lib/utils";
import { useState } from "react";
import { PostResponseDTO } from "@/dtos/PostDTO";
import TagModal from "@/components/modal/post/TagsModal";
import { colors } from "@/styles/colors";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { UserBasicInfo } from "@/dtos/UserDTO";

interface PostHeaderProps {
  post: PostResponseDTO;
  setPostsData?: React.Dispatch<React.SetStateAction<PostResponseDTO[]>>;
  profileBasic: UserBasicInfo;
}

const PostHeader = ({ post, setPostsData, profileBasic }: PostHeaderProps) => {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const tags = post?.tags ?? [];
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const handleTagsModalToggle = () => {
    setIsTagsModalOpen((prev) => !prev);
  };
  const navigateToUserProfile = (item: any) => {
    if (item === profileBasic._id) {
      router.push(`/profile`);
    } else {
      router.push(`/user/${item}`);
    }
  };

  return (
    <View className="flex flex-row gap-[10px] justify-start items-center">
      <TouchableOpacity
        onPress={() => navigateToUserProfile(post?.author?._id)}
      >
        <Image
          source={{
            uri:
              post?.author?.avatar ||
              "https://i.pinimg.com/236x/88/bd/6b/88bd6bd828ec509f4bda0d9f9450824d.jpg",
          }}
          className="w-10 h-10 rounded-full"
        />
      </TouchableOpacity>

      <View className="flex flex-col gap-2">
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color:
                colorScheme === "dark" ? colors.dark[100] : colors.light[100],
              fontSize: 16,
            }}
            className="font-mmedium"
          >
            {post?.author?.firstName || ""} {post?.author?.lastName || ""}
          </Text>
          {tags.length > 0 && (
            <Text
              style={{
                color:
                  colorScheme === "dark" ? colors.dark[100] : colors.light[100],
                fontSize: 16,
              }}
              className="font-mmedium w-40"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tags.length > 0 && (
                <TouchableOpacity onPress={handleTagsModalToggle}>
                  <Text
                    style={{
                      color:
                        colorScheme === "dark"
                          ? colors.dark[100]
                          : colors.light[100],
                      fontSize: 16,
                    }}
                    className="font-mregular"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {` with ${tags.length} others`}
                  </Text>
                </TouchableOpacity>
              )}
            </Text>
          )}
        </View>
        <TagModal
          tags={post.tags}
          isOpen={isTagsModalOpen}
          onClose={handleTagsModalToggle}
        />
        <Text
          style={{
            color:
              colorScheme === "dark" ? colors.dark[300] : colors.light[300],
            fontSize: 12,
          }}
          className="font-mregular"
        >
          {getTimestamp(post.createdAt)}
        </Text>
      </View>
    </View>
  );
};

export default PostHeader;
