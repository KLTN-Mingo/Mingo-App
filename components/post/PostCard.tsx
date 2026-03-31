import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { Dimensions, Image, TouchableOpacity, useColorScheme, View } from "react-native";

import {
  CommentIcon,
  LikeIcon,
  LocationIcon,
  ThreeDotsIcon
} from "@/components/shared/icons/Icons";
import { Avatar, Text } from "@/components/ui";
import { PostResponseDto, UserMinimalDto } from "@/dtos";
import { postService } from "@/services/post.service";
import { colors, statusColors } from "@/styles/colors";

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
  const isDark = useColorScheme() === "dark";

  const theme = {
    icon: isDark ? colors.dark[100] : colors.light[100],
    iconMuted: isDark ? colors.dark[300] : colors.light[300],
  };

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
      <Text className="text-text-muted-dark">
        {" "}
        with{" "}
        <Text className="font-semibold text-text-dark">
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
    <View className="p-4 overflow-hidden rounded-[10px] bg-surface-muted-light dark:bg-surface-muted-dark gap-4">
      {/* Header */}
      <View className="flex-row items-start">
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
              <Text className="text-[16px] font-semibold">
                {post.user?.name || "Unknown"}
              </Text>
              {renderMentions()}
            </View>
            <Text className="mt-0.5 text-xs text-text-dark">
              {formatTime(post.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onMorePress?.(post)} className="p-2">
          <ThreeDotsIcon size={20} color={colors.dark[500]} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {post.contentText && (
        <View className="">
          <Text className="text-[27px] leading-[27px] text-text-dark">
            {post.contentText}
          </Text>
        </View>
      )}

      {/* Location & Music Tags */}
      {(post.location?.name || firstMusicTag) && (
            <View className="flex-row flex-wrap items-center">
          {post.location?.name && (
            <View className="flex-row items-center">
              <LocationIcon size={14} color={colors.dark[300]} />
              <Text className="text-xs text-primary-100">
                {post.location.name}
              </Text>
            </View>
          )}
          {/* {firstMusicTag && (
            <View className="max-w-[70%] flex-row items-center">
              <Text className="text-xs text-text-muted-dark">-</Text>
              <MusicIcon size={14} color={colors.dark[300]} />
              <Text
                className="text-xs text-text-muted-dark"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {firstMusicTag}
              </Text>
            </View>
          )} */}
        </View>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
            <View className="bg-surface-muted-light dark:bg-surface-muted-dark">
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
      <View className="flex-row items-center gap-5">
        {/* Like */}
        <TouchableOpacity
          onPress={handleLike}
          className="flex-row items-center gap-3"
          disabled={likeLoading}
        >
          <LikeIcon
            size={24}
            color={isLiked ? statusColors.error.dark : theme.icon}
          />
          {likesCount > 0 && (
            <Text className="text-[17px] text-text-muted-dark">
              {likesCount} likes
            </Text>
          )}
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          onPress={() => onCommentPress?.(post.id)}
          className="flex-row items-center gap-3"
        >
          <CommentIcon size={23} color={theme.icon} />
          {post.commentsCount > 0 && (
            <Text className="text-[17px] text-text-muted-dark">
              {post.commentsCount} comments
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Comment Input */}
      <View className="flex-row items-center gap-3">
        <Avatar
          size="md"
          source={currentUser?.avatar ? { uri: currentUser.avatar } : undefined}
          fallback={currentUser?.name}
        />
         <TouchableOpacity
              onPress={() => onCommentPress?.(post.id)}
              activeOpacity={0.85}
              className="flex-1 flex-row items-center px-4 py-3 rounded-[20px] bg-input-light dark:bg-input-dark"
            >
              {/* <LocationPinIcon size={22} color={semantic.textMuted} /> */}
              <Text
                variant="muted"
                className="flex-1 text-[16px] h-[20px] text-text-muted-light dark:text-text-muted-dark"
              >
                Write comment...
              </Text>
              {/* <SearchIcon size={22} color={semantic.textMuted} /> */}
            </TouchableOpacity>
        
      </View>
    </View>
  );
}
