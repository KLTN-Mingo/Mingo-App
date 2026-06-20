import { formatDistanceToNow } from "date-fns";
import { ResizeMode, Video } from "expo-av";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { CultureHighlightedText } from "@/components/post/CultureHighlightedText";
import { ModerationBanner } from "@/components/post/ModerationBanner";
import { PostMediaViewer } from "@/components/post/PostMediaViewer";
import {
  CommentIcon,
  LikeIcon,
  LocationIcon,
  SaveIcon,
  ShareIcon,
  ThreeDotsIcon,
} from "@/components/shared/icons/Icons";
import { Avatar, Text } from "@/components/ui";
import {
  CultureTermDto,
  PostMediaDto,
  PostResponseDto,
  RelationshipStatusDto,
  UserMinimalDto,
} from "@/dtos";
import { getFollowActionState } from "@/services/follow-contract";
import { FollowApi } from "@/services/follow.service";
import {
  frontendCacheKeys,
  invalidateCacheKeys,
} from "@/services/frontend-cache";
import { isPostPermissionDeniedError } from "@/services/post-permission";
import { postService } from "@/services/post.service";
import { colors, paletteIcon, statusColors } from "@/styles/colors";
import {
  getPostMediaPreviewHeight,
  isVideoPostMedia,
} from "@/utils/post-media";

interface PostCardProps {
  post: PostResponseDto;
  currentUser?: UserMinimalDto | null;
  onLikeChange?: (postId: string, isLiked: boolean) => void;
  onCommentPress?: (postId: string) => void;
  onShareChange?: (postId: string, nextCount: number) => void;
  onSaveChange?: (postId: string, isSaved: boolean, savesCount: number) => void;
  onUserPress?: (userId: string) => void;
  onMorePress?: (post: PostResponseDto) => void;
  /**
   * Khi truyền vào, nút Share sẽ mở action sheet (DM share / Repost) thay vì
   * gọi `postService.sharePost` luôn. Dùng cùng `useSharePost()` ở screen.
   */
  onSharePress?: (post: PostResponseDto) => void;
  /** Hiển thị lý do ẩn trong moderation banner (chỉ có ở PostDetailDto). */
  hiddenReason?: string;
  /** Highlight slang/idiom trong nội dung (Culture Translation). */
  cultureTerms?: CultureTermDto[];
  recommendationSource?: "explore" | "feed";
}

export function PostCard({
  post,
  currentUser,
  onLikeChange,
  onShareChange,
  onSaveChange,
  onUserPress,
  onMorePress,
  onSharePress,
  hiddenReason,
  cultureTerms,
  recommendationSource,
}: PostCardProps) {
  const colorScheme = useColorScheme() ?? "light";

  const theme = {
    icon: paletteIcon[colorScheme],
    iconMuted: paletteIcon.lightMuted,
  };
  const cardShadowStyle =
    colorScheme === "light"
      ? {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 14,
          elevation: 3,
        }
      : undefined;

  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [sharesCount, setSharesCount] = useState(post.sharesCount);
  const [shareLoading, setShareLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false);
  const [savesCount, setSavesCount] = useState(post.savesCount ?? 0);
  const [saveLoading, setSaveLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [relationship, setRelationship] =
    useState<RelationshipStatusDto | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [mediaCarouselWidth, setMediaCarouselWidth] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [viewerMediaIndex, setViewerMediaIndex] = useState<number | null>(null);
  const mediaCarouselRef = React.useRef<FlatList<PostMediaDto>>(null);
  const effectiveCultureTerms =
    Array.isArray(cultureTerms) && cultureTerms.length > 0
      ? cultureTerms
      : Array.isArray(post.culturalTerms)
        ? post.culturalTerms
        : [];
  const showCultureAnalyzing =
    post.cultureAnalyzed === false && effectiveCultureTerms.length === 0;

  useEffect(() => {
    setIsSaved(post.isSaved ?? false);
    setSavesCount(post.savesCount ?? 0);
  }, [post.id, post.isSaved, post.savesCount]);

  useEffect(() => {
    setActiveMediaIndex(0);
    setViewerMediaIndex(null);
  }, [post.id]);

  useEffect(() => {
    let active = true;

    const loadRelationship = async () => {
      if (
        !currentUser?.id ||
        !post.userId ||
        currentUser.id === post.userId ||
        !recommendationSource
      ) {
        if (active) {
          setRelationship(null);
        }
        return;
      }

      try {
        const nextRelationship = await FollowApi.getRelationshipStatus(
          post.userId
        );
        if (active) {
          setRelationship(nextRelationship);
        }
      } catch {
        if (active) {
          setRelationship(null);
        }
      }
    };

    void loadRelationship();

    return () => {
      active = false;
    };
  }, [currentUser?.id, post.id, post.userId, recommendationSource]);

  const handlePostPermissionDenied = async () => {
    setPermissionDenied(true);
    invalidateCacheKeys([
      frontendCacheKeys.postDetail(post.id),
      frontendCacheKeys.feedPosts,
      frontendCacheKeys.savedPosts,
      frontendCacheKeys.relationship(post.userId),
      frontendCacheKeys.followStats(post.userId),
      frontendCacheKeys.userPosts(post.userId),
    ]);
    try {
      await FollowApi.getRelationshipStatus(post.userId);
    } catch {
      // best-effort refresh
    }
  };

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
      if (isPostPermissionDeniedError(error)) {
        await handlePostPermissionDenied();
      }
      console.error("Like error:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    // Mới: parent tự xử lý chooser (DM share / Repost) qua `useSharePost`.
    if (onSharePress) {
      onSharePress(post);
      return;
    }

    // Backward compat: vẫn dùng `postService.sharePost` cho các screen chưa migrate.
    if (shareLoading) return;
    setShareLoading(true);
    const optimistic = sharesCount + 1;
    setSharesCount(optimistic);
    onShareChange?.(post.id, optimistic);
    try {
      await postService.sharePost(post.id);
    } catch (error) {
      setSharesCount((prev) => Math.max(0, prev - 1));
      onShareChange?.(post.id, Math.max(0, optimistic - 1));
      if (isPostPermissionDeniedError(error)) {
        await handlePostPermissionDenied();
      }
      console.error("Share error:", error);
    } finally {
      setShareLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.id || saveLoading) return;

    const prevSaved = isSaved;
    const prevCount = savesCount;
    const nextSaved = !prevSaved;
    const nextCount = nextSaved ? prevCount + 1 : Math.max(0, prevCount - 1);

    setSaveLoading(true);
    setIsSaved(nextSaved);
    setSavesCount(nextCount);
    onSaveChange?.(post.id, nextSaved, nextCount);
    try {
      if (nextSaved) {
        await postService.savePost(post.id, "default");
      } else {
        await postService.unsavePost(post.id);
      }
    } catch (error) {
      setIsSaved(prevSaved);
      setSavesCount(prevCount);
      onSaveChange?.(post.id, prevSaved, prevCount);
      if (isPostPermissionDeniedError(error)) {
        await handlePostPermissionDenied();
      }
      console.error("Save post error:", error);
    } finally {
      setSaveLoading(false);
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

  const singleMediaHeight = getPostMediaPreviewHeight(post.media?.[0]);

  const renderPostMedia = (
    media: NonNullable<PostResponseDto["media"]>[number],
    index: number
  ) => {
    const style = { width: mediaCarouselWidth, height: singleMediaHeight };
    const key = media.id || `post-media-${index}`;
    if (!media.mediaUrl) {
      return <View key={key} style={style} className="bg-input-light dark:bg-input-dark" />;
    }

    const contentStyle = { width: "100%" as const, height: "100%" as const };
    const content = isVideoPostMedia(media) ? (
      <Video
        source={{ uri: media.mediaUrl }}
        style={contentStyle}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        posterSource={
          media.thumbnailUrl ? { uri: media.thumbnailUrl } : undefined
        }
        posterStyle={contentStyle}
        onError={(error) =>
          console.warn("[PostCard] video load failed", {
            postId: post.id,
            mediaId: media.id,
            error,
          })
        }
      />
    ) : (
      <Image
        source={{ uri: media.mediaUrl }}
        style={contentStyle}
        resizeMode="cover"
      />
    );

    return (
      <TouchableOpacity
        key={key}
        style={style}
        activeOpacity={0.95}
        onPress={() => setViewerMediaIndex(index)}
      >
        {content}
      </TouchableOpacity>
    );

  };

  const openPostDetail = () => router.push(`/post/${post.id}` as any);

  const goToMediaSlide = (index: number) => {
    mediaCarouselRef.current?.scrollToIndex({ index, animated: true });
    setActiveMediaIndex(index);
  };

  const isOwnPost =
    currentUser?.id && post.userId && currentUser.id === post.userId;

  const canFollowFromPost =
    Boolean(currentUser?.id) &&
    Boolean(post.userId) &&
    !isOwnPost &&
    Boolean(recommendationSource);

  const followAction = getFollowActionState(relationship);

  const handleFollowFromPost = async () => {
    if (!canFollowFromPost || followLoading || !post.userId) return;

    setFollowLoading(true);
    try {
      if (followAction.action === "unfollow") {
        await FollowApi.unfollow(post.userId);
      } else if (followAction.action === "cancel_request") {
        await FollowApi.cancelRequest(post.userId);
      } else {
        await FollowApi.sendFollowRequest(post.userId, {
          postId: post.id,
          source: recommendationSource,
          deviceType: "web",
        });
      }
      const nextRelationship = await FollowApi.getRelationshipStatus(
        post.userId
      );
      setRelationship(nextRelationship);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Cannot send follow request";
      Alert.alert("Error", msg);
    } finally {
      setFollowLoading(false);
    }
  };

  if (permissionDenied) {
    return null;
  }

  return (
    <>
      <View style={cardShadowStyle} className="rounded-[20px]">
        <View className="p-4 overflow-hidden rounded-[20px] bg-white dark:bg-surface-dark gap-4">
        {isOwnPost ? (
          <ModerationBanner
            status={post.moderationStatus}
            isHidden={post.isHidden}
            hiddenReason={hiddenReason}
          />
        ) : null}
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
                <Text className="text-[16px] font-semibold text-text-light dark:text-text-dark">
                  {post.user?.name || "Unknown"}
                </Text>
                {renderMentions()}
              </View>
              <Text className="mt-0.5 text-xs text-text-light dark:text-text-dark">
                {formatTime(post.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          {canFollowFromPost ? (
            <TouchableOpacity
              onPress={handleFollowFromPost}
              disabled={followLoading}
              className="mr-2 px-3 py-1.5 rounded-full bg-primary dark:bg-primary-light"
            >
              <Text className="text-xs font-semibold text-white">
                {followLoading ? "..." : followAction.label}
              </Text>
            </TouchableOpacity>
          ) : null}

          {onMorePress && currentUser?.id ? (
            <TouchableOpacity onPress={() => onMorePress(post)} className="p-2">
              <ThreeDotsIcon size={16} color={theme.icon} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Content */}
        {post.contentText && (
          <TouchableOpacity className="" activeOpacity={0.8} onPress={openPostDetail}>
            {effectiveCultureTerms.length > 0 ? (
              <CultureHighlightedText
                text={post.contentText}
                terms={effectiveCultureTerms}
                baseTextClassName="text-[16px] leading-[23px] text-text-light dark:text-text-dark"
              />
            ) : (
              <Text className="text-[16px] leading-[23px] text-text-light dark:text-text-dark">
                {post.contentText}
              </Text>
            )}
            {showCultureAnalyzing ? (
              <Text variant="muted" className="mt-1 text-xs">
                Analyzing cultural context...
              </Text>
            ) : null}
          </TouchableOpacity>
        )}

        {/* Location & Music Tags */}
        {(post.location?.name || firstMusicTag) && (
          <View className="flex-row flex-wrap items-center">
            {post.location?.name && (
              <View className="flex-row items-center">
                <LocationIcon size={14} color={theme.icon} />
                <Text className="text-xs text-text-light dark:text-text-dark">
                  {post.location.name}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <View
            className="relative bg-white dark:bg-surface-dark"
            onLayout={(event) => setMediaCarouselWidth(event.nativeEvent.layout.width)}
          >
            {mediaCarouselWidth > 0 ? (
              <FlatList
                ref={mediaCarouselRef}
                data={post.media}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(media, index) => media.id || `post-media-${index}`}
                renderItem={({ item, index }) => renderPostMedia(item, index)}
                onMomentumScrollEnd={(event) =>
                  setActiveMediaIndex(
                    Math.round(event.nativeEvent.contentOffset.x / mediaCarouselWidth)
                  )
                }
              />
            ) : (
              <View style={{ height: singleMediaHeight }} />
            )}
            {post.media.length > 1 ? (
              <>
                <TouchableOpacity
                  onPress={() => goToMediaSlide(Math.max(0, activeMediaIndex - 1))}
                  disabled={activeMediaIndex === 0}
                  className="absolute left-3 top-[140px] h-10 w-10 rounded-full bg-black/55 items-center justify-center"
                >
                  <Text className="text-3xl leading-8 text-white">{"<"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    goToMediaSlide(Math.min(post.media!.length - 1, activeMediaIndex + 1))
                  }
                  disabled={activeMediaIndex === post.media.length - 1}
                  className="absolute right-3 top-[140px] h-10 w-10 rounded-full bg-black/55 items-center justify-center"
                >
                  <Text className="text-3xl leading-8 text-white">{">"}</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        )}

        {/* Actions */}
        <View className="flex-row items-center gap-5">
          {/* Like */}
          <TouchableOpacity
            onPress={handleLike}
            className="flex-row items-center gap-2"
            disabled={likeLoading}
          >
            <LikeIcon
              size={24}
              color={isLiked ? statusColors.error.dark : theme.icon}
              filled={isLiked}
            />
            {likesCount > 0 && (
              <Text className="text-[15px] text-text-light dark:text-text-dark">
                {likesCount}
              </Text>
            )}
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity
            onPress={openPostDetail}
            className="flex-row items-center gap-2"
          >
            <CommentIcon size={23} color={theme.icon} />
            {post.commentsCount > 0 && (
              <Text className="text-[15px] text-text-light dark:text-text-dark">
                {post.commentsCount}
              </Text>
            )}
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            onPress={handleShare}
            className="flex-row items-center gap-2"
            disabled={shareLoading}
          >
            <ShareIcon size={22} color={theme.icon} />
            {sharesCount > 0 && (
              <Text className="text-[15px] text-text-light dark:text-text-dark">
                {sharesCount}
              </Text>
            )}
          </TouchableOpacity>

          {currentUser?.id ? (
            <TouchableOpacity
              onPress={handleSave}
              className="flex-row items-center gap-3 ml-auto"
              disabled={saveLoading}
              accessibilityLabel={isSaved ? "Unsave" : "Save post"}
            >
              <SaveIcon
                size={22}
                color={isSaved ? colors.primary[100] : theme.icon}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Comment Input */}
        <View className="flex-row items-center gap-3">
          <Avatar
            size="md"
            source={
              currentUser?.avatar ? { uri: currentUser.avatar } : undefined
            }
            fallback={currentUser?.name}
          />
          <TouchableOpacity
            onPress={openPostDetail}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center px-4 py-3 rounded-[20px] bg-input-light dark:bg-input-dark"
          >
            {/* <LocationPinIcon size={22} color={semantic.textMuted} /> */}
            <Text
              variant="muted"
              className="flex-1 text-[14px] h-[18px] text-text-muted-light dark:text-text-muted-dark"
            >
              Write comment...
            </Text>
            {/* <SearchIcon size={22} color={semantic.textMuted} /> */}
          </TouchableOpacity>
        </View>
        </View>
      </View>
      <PostMediaViewer
        media={post.media ?? []}
        initialIndex={viewerMediaIndex ?? 0}
        visible={viewerMediaIndex !== null}
        onClose={() => setViewerMediaIndex(null)}
      />
    </>
  );
}
