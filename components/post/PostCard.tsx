import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { Dimensions, Image, TouchableOpacity, View } from "react-native";

import { Avatar, Icon, Text } from "@/components/ui";
import { PostResponseDto, UserMinimalDto } from "@/dtos";
import { postService } from "@/services/post.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PostCardProps {
  post: PostResponseDto;
  currentUser?: UserMinimalDto | null;
  onLikeChange?: (postId: string, isLiked: boolean) => void;
  onCommentPress?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  onMorePress?: (post: PostResponseDto) => void;
}

export function PostCard({
  post,
  currentUser,
  onLikeChange,
  onCommentPress,
  onUserPress,
  onMorePress,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (likeLoading) return;

    setLikeLoading(true);
    const newIsLiked = !isLiked;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      if (newIsLiked) {
        await postService.likePost(post.id);
      } else {
        await postService.unlikePost(post.id);
      }
      onLikeChange?.(post.id, newIsLiked);
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
      console.error("Like error:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
      });
    } catch {
      return "";
    }
  };

  const renderMentions = () => {
    if (!post.mentions || post.mentions.length === 0) return null;

    const mentionNames = post.mentions.map((m) => m.name).filter(Boolean);
    if (mentionNames.length === 0) return null;

    if (mentionNames.length === 1) {
      return (
        <Text className="text-text-muted-light dark:text-text-muted-dark">
          {" "}
          with{" "}
          <Text className="font-semibold text-text-light dark:text-text-dark">
            {mentionNames[0]}
          </Text>
        </Text>
      );
    }

    return (
      <Text className="text-[#68716F]">
        {" "}
        with{" "}
        <Text className="font-semibold text-[#212625]">
          {mentionNames[0]}
        </Text>{" "}
        and {mentionNames.length - 1} others
      </Text>
    );
  };

  const firstMusicTag = post.hashtags?.find(Boolean);

  const baseMediaWidth = SCREEN_WIDTH - 32;
  const mediaWidth = post.media?.[0]?.width;
  const mediaHeight = post.media?.[0]?.height;
  const singleMediaHeight =
    mediaWidth && mediaHeight
      ? Math.min(
          460,
          Math.max(260, (baseMediaWidth * mediaHeight) / mediaWidth)
        )
      : baseMediaWidth;

  return (
    <View className="mx-4 mb-3 overflow-hidden rounded-2xl bg-white">
      {/* Header */}
      <View className="flex-row items-start px-4 pb-2 pt-4">
        <TouchableOpacity
          onPress={() => onUserPress?.(post.userId)}
          className="flex-row items-center flex-1"
        >
          <Avatar
            source={post.user?.avatar ? { uri: post.user.avatar } : undefined}
            fallback={post.user?.name}
            size="md"
            className="h-10 w-10"
          />
          <View className="ml-3 flex-1">
            <View className="flex-row flex-wrap items-center">
              <Text className="text-[22px] leading-[23px] font-semibold text-[#1F2423]">
                {post.user?.name || "Unknown"}
              </Text>
              {renderMentions()}
            </View>
            <Text className="mt-0.5 text-xs text-[#8A9190]">
              {formatTime(post.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onMorePress?.(post)} className="p-2">
          <Icon name="ellipsis" size={20} color="#1E2021" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {post.contentText && (
        <View className="px-4 pb-1">
          <Text className="text-[27px] leading-[27px] text-[#212625]">
            {post.contentText}
          </Text>
        </View>
      )}

      {/* Location & Music Tags */}
      {(post.location?.name || firstMusicTag) && (
        <View className="flex-row flex-wrap items-center px-4 pb-2 pt-1">
          {post.location?.name && (
            <View className="mr-2 flex-row items-center">
              <Icon name="location" size={14} color="#8E9794" />
              <Text className="ml-1 text-xs text-[#7E8785]">
                {post.location.name}
              </Text>
            </View>
          )}
          {firstMusicTag && (
            <View className="max-w-[70%] flex-row items-center">
              <Text className="text-xs text-[#7E8785]">-</Text>
              <Icon
                name="music.note"
                size={14}
                color="#8E9794"
                className="ml-1"
              />
              <Text
                className="ml-1 text-xs text-[#7E8785]"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {firstMusicTag}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <View className="mt-1 bg-[#F4F4F4]">
          {post.media.length === 1 ? (
            <Image
              source={{ uri: post.media[0].mediaUrl }}
              style={{ width: "100%", height: singleMediaHeight }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-row flex-wrap">
              {post.media.slice(0, 4).map((media, index) => (
                <Image
                  key={media.id}
                  source={{ uri: media.mediaUrl }}
                  style={{
                    width: index % 2 === 0 ? "50%" : "50%",
                    height: baseMediaWidth / 2,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center px-4 pb-2 pt-3">
        {/* Like */}
        <TouchableOpacity
          onPress={handleLike}
          className="mr-6 flex-row items-center"
          disabled={likeLoading}
        >
          <Icon
            name={isLiked ? "heart.fill" : "heart"}
            size={24}
            color={isLiked ? "#EB5A5A" : "#212625"}
          />
          {likesCount > 0 && (
            <Text className="ml-2 text-[17px] text-[#2F3735]">
              {likesCount} likes
            </Text>
          )}
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          onPress={() => onCommentPress?.(post.id)}
          className="flex-row items-center"
        >
          <Icon name="bubble.left" size={23} color="#212625" />
          {post.commentsCount > 0 && (
            <Text className="ml-2 text-[17px] text-[#2F3735]">
              {post.commentsCount} comments
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Comment Input */}
      <View className="flex-row items-center gap-2 px-4 pb-4 pt-1">
        <Avatar
          size="sm"
          source={currentUser?.avatar ? { uri: currentUser.avatar } : undefined}
          fallback={currentUser?.name}
        />
        <TouchableOpacity
          onPress={() => onCommentPress?.(post.id)}
          className="h-10 flex-1 justify-center rounded-full bg-[#F1F3F2] px-4"
        >
          <Text className="text-[16px] text-[#B2B7B5]">Write comment...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
