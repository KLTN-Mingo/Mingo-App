import { formatDistanceToNow } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/containers/ScreenContainer";

import { CultureHighlightedText } from "@/components/post/CultureHighlightedText";
import { ModerationBanner } from "@/components/post/ModerationBanner";
import { CommentThreadItem } from "@/components/post/CommentThreadItem";
import {
  ArrowIcon,
  CommentIcon,
  LikeIcon,
  LocationIcon,
  SaveIcon,
  ShareIcon,
  ThreeDotsIcon,
} from "@/components/shared/icons/Icons";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { Avatar, Text } from "@/components/ui";
import { paletteDark, paletteLight } from "@/constants/designTokens";
import {
  CommentResponseDto,
  FeedTab,
  PostDetailDto,
  PostResponseDto,
  ReportEntityType,
  UserMinimalDto,
} from "@/dtos";
import { useReport } from "@/hooks/use-report";
import { useAuth } from "@/context/AuthContext";
import { useSharePost } from "@/hooks/use-share-post";
import { commentService } from "@/services/comment.service";
import { FollowApi } from "@/services/follow.service";
import {
  frontendCacheKeys,
  invalidateCacheKeys,
} from "@/services/frontend-cache";
import { postService } from "@/services/post.service";
import { isPostPermissionDeniedError } from "@/services/post-permission";
import { colors, getSemantic, paletteIcon, statusColors } from "@/styles/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type CommentTreeNode = CommentResponseDto & {
  children: CommentTreeNode[];
};

export default function PostDetailScreen() {
  const { id, source, tab } = useLocalSearchParams<{
    id: string;
    source?: string;
    tab?: FeedTab;
  }>();
  const { profile } = useAuth();
  const colorScheme = useColorScheme();
  const themeColors =
    colorScheme === "dark" ? paletteDark : paletteLight;
  const semantic = getSemantic(colorScheme === "dark" ? "dark" : "light");
  const report = useReport();

  const [post, setPost] = useState<PostResponseDto | null>(null);
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState("");
  const [expandedReplyIds, setExpandedReplyIds] = useState<Record<string, boolean>>({});
  const [loadingReplyIds, setLoadingReplyIds] = useState<Record<string, boolean>>({});
  const feedTab: FeedTab | undefined =
    tab === "explore" || tab === "friends"
      ? tab
      : source === "explore"
        ? "explore"
        : source === "feed"
          ? "friends"
          : undefined;
  const currentUser: UserMinimalDto | null = profile
    ? {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        verified: profile.verified,
      }
    : null;

  const share = useSharePost({
    currentUserId: profile?.id,
    onShared: ({ postId, sentCount }) => {
      setPost((prev) =>
        prev && prev.id === postId
          ? { ...prev, sharesCount: prev.sharesCount + sentCount }
          : prev
      );
      void postService
        .sharePost(postId, { sharedTo: "message" })
        .catch((e) => console.warn("[recommendation] share action failed", e));
    },
    onReposted: ({ postId }) => {
      setPost((prev) =>
        prev && prev.id === postId
          ? { ...prev, sharesCount: prev.sharesCount + 1 }
          : prev
      );
      void postService
        .sharePost(postId, { sharedTo: "feed" })
        .catch((e) => console.warn("[recommendation] share action failed", e));
    },
  });

  const handlePostPermissionDenied = useCallback(
    async (targetPost?: PostResponseDto | null) => {
      const activePost = targetPost ?? post;
      if (!activePost) return;

      invalidateCacheKeys([
        frontendCacheKeys.postDetail(activePost.id),
        frontendCacheKeys.feedPosts,
        frontendCacheKeys.savedPosts,
        frontendCacheKeys.relationship(activePost.userId),
        frontendCacheKeys.followStats(activePost.userId),
        frontendCacheKeys.userPosts(activePost.userId),
      ]);

      try {
        await FollowApi.getRelationshipStatus(activePost.userId);
      } catch {
        // best-effort refresh
      }

      setAccessDenied(true);
      setPost(null);
    },
    [post]
  );

  const fetchPost = useCallback(async () => {
    if (!id) return;
    try {
      const data = await postService.getPostById(id);
      setAccessDenied(false);
      setPost(data);
    } catch (err) {
      if (isPostPermissionDeniedError(err)) {
        await handlePostPermissionDenied();
      }
      console.warn("Cannot load post:", err);
    } finally {
      setLoadingPost(false);
    }
  }, [handlePostPermissionDenied, id]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const data = await commentService.getComments(id);
      setComments(data.comments);
    } catch (err) {
      console.warn("Cannot load comments:", err);
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const buildCommentTree = useCallback((items: CommentResponseDto[]): CommentTreeNode[] => {
    const map = new Map<string, CommentTreeNode>();
    const roots: CommentTreeNode[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    map.forEach((node) => {
      if (node.parentCommentId && map.has(node.parentCommentId)) {
        map.get(node.parentCommentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortByDateAsc = (a: CommentTreeNode, b: CommentTreeNode) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    const sortRecursive = (nodes: CommentTreeNode[]) => {
      nodes.sort(sortByDateAsc);
      nodes.forEach((node) => sortRecursive(node.children));
    };
    sortRecursive(roots);

    return roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const handleLikeComment = async (comment: CommentResponseDto) => {
    const newIsLiked = !comment.isLiked;
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              isLiked: newIsLiked,
              likesCount: newIsLiked ? c.likesCount + 1 : c.likesCount - 1,
            }
          : c
      )
    );
    try {
      if (newIsLiked) {
        await commentService.likeComment(comment.id);
      } else {
        await commentService.unlikeComment(comment.id);
      }
    } catch {
      // revert
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                isLiked: !newIsLiked,
                likesCount: newIsLiked ? c.likesCount - 1 : c.likesCount + 1,
              }
            : c
        )
      );
    }
  };

  const handlePostMorePress = (p: PostResponseDto) => {
    if (!profile) return;

    if (p.userId === profile.id) {
      Alert.alert("Your post", undefined, [
        {
          text: "Edit",
          onPress: () =>
            router.push({ pathname: "/create-post", params: { id: p.id } } as any),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Delete post?", "This action cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    await postService.deletePost(p.id);
                    router.back();
                  } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : "Cannot delete";
                    Alert.alert("Error", msg);
                  }
                },
              },
            ]);
          },
        },
        { text: "Close", style: "cancel" },
      ]);
      return;
    }

    Alert.alert("Post", undefined, [
      {
        text: "Hide post",
        onPress: async () => {
          try {
            await postService.submitFeedFeedback(p.id, "hide", feedTab);
            router.back();
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Cannot send feedback";
            Alert.alert("Error", msg);
          }
        },
      },
      {
        text: "Not interested",
        onPress: async () => {
          try {
            await postService.submitFeedFeedback(p.id, "not_interested", feedTab);
            router.back();
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Cannot send feedback";
            Alert.alert("Error", msg);
          }
        },
      },
      {
        text: "See more like this",
        onPress: async () => {
          try {
            await postService.submitFeedFeedback(p.id, "see_more", feedTab);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Cannot send feedback";
            Alert.alert("Error", msg);
          }
        },
      },
      {
        text: "Báo cáo",
        style: "destructive",
        onPress: () =>
          report.openReport({
            entityType: ReportEntityType.POST,
            entityId: p.id,
            entityLabel: "bài viết này",
          }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDeleteComment = async (comment: CommentResponseDto) => {
    if (!id) return;
    try {
      await commentService.deleteComment(comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
      setPost((prev) =>
        prev ? { ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) } : prev
      );
      if (editingCommentId === comment.id) {
        setEditingCommentId(null);
        setEditCommentDraft("");
      }
    } catch (error) {
      console.warn("Cannot delete comment:", error);
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentDraft("");
  };

  const handleSaveEditComment = async (commentId: string) => {
    const text = editCommentDraft.trim();
    if (!text) return;
    try {
      const updated = await commentService.updateComment(commentId, {
        contentText: text,
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c))
      );
      setEditingCommentId(null);
      setEditCommentDraft("");
    } catch (error) {
      console.warn("Cannot update comment:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const renderMentions = (targetPost: PostResponseDto) => {
    if (!targetPost.mentions || targetPost.mentions.length === 0) return null;
    const mentionNames = targetPost.mentions.map((m) => m.name).filter(Boolean);
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
      <Text className="text-text-muted-light dark:text-text-muted-dark">
        {" "}
        with{" "}
        <Text className="font-semibold text-text-light dark:text-text-dark">
          {mentionNames[0]}
        </Text>{" "}
        and {mentionNames.length - 1} others
      </Text>
    );
  };

  const handleLikePost = async () => {
    if (!post) return;
    const nextLiked = !post.isLiked;
    const previous = post;
    setPost({
      ...post,
      isLiked: nextLiked,
      likesCount: nextLiked
        ? post.likesCount + 1
        : Math.max(0, post.likesCount - 1),
    });
    try {
      if (nextLiked) {
        await postService.likePost(post.id);
      } else {
        await postService.unlikePost(post.id);
      }
    } catch (error) {
      setPost(previous);
      if (isPostPermissionDeniedError(error)) {
        await handlePostPermissionDenied(previous);
      }
      console.warn("Cannot update like:", error);
    }
  };

  const handleSharePost = () => {
    if (!post) return;
    share.openSheet(post);
  };

  const handleSavePost = async () => {
    if (!post || !currentUser?.id) return;
    const nextSaved = !post.isSaved;
    const previous = post;
    setPost({
      ...post,
      isSaved: nextSaved,
      savesCount: nextSaved
        ? (post.savesCount ?? 0) + 1
        : Math.max(0, (post.savesCount ?? 0) - 1),
    });
    try {
      if (nextSaved) {
        await postService.savePost(post.id, "default");
      } else {
        await postService.unsavePost(post.id);
      }
    } catch (error) {
      setPost(previous);
      if (isPostPermissionDeniedError(error)) {
        await handlePostPermissionDenied(previous);
      }
      console.warn("Cannot update saved post:", error);
    }
  };

  const commentTree = buildCommentTree(comments);

  const handleToggleReplies = useCallback(
    async (commentId: string, hasLoadedReplies: boolean) => {
      const isExpanded = !!expandedReplyIds[commentId];
      if (isExpanded) {
        setExpandedReplyIds((prev) => ({ ...prev, [commentId]: false }));
        return;
      }

      if (!hasLoadedReplies && !loadingReplyIds[commentId]) {
        setLoadingReplyIds((prev) => ({ ...prev, [commentId]: true }));
        try {
          const data = await commentService.getCommentReplies(commentId, 1, 50);
          setComments((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newReplies = data.comments.filter((r) => !existingIds.has(r.id));
            if (newReplies.length === 0) return prev;
            return [...prev, ...newReplies];
          });
        } catch (err) {
          console.warn("Cannot load replies:", err);
        } finally {
          setLoadingReplyIds((prev) => ({ ...prev, [commentId]: false }));
        }
      }

      setExpandedReplyIds((prev) => ({ ...prev, [commentId]: true }));
    },
    [expandedReplyIds, loadingReplyIds]
  );

  const renderCommentNode = (
    item: CommentTreeNode,
    depth = 0
  ): React.ReactElement => {
    const isEditing = editingCommentId === item.id;
    const isOwner = currentUser?.id && item.userId === currentUser.id;
    const isReplyNode = depth > 0;
    const parentName =
      isReplyNode && item.parentCommentId
        ? comments.find((c) => c.id === item.parentCommentId)?.user?.name
        : undefined;

    const uiDepth = Math.min(depth, 2);
    const shownReplyCount = Math.max(item.repliesCount ?? 0, item.children.length);
    const hasReplies = shownReplyCount > 0;
    const isExpanded = !!expandedReplyIds[item.id];
    const isLoadingReplies = !!loadingReplyIds[item.id];

    return (
      <View key={item.id}>
        <View style={{ marginLeft: uiDepth * 24 }}>
          <CommentThreadItem
            comment={item}
            colors={themeColors}
            formatTime={formatTime}
            isEditing={isEditing}
            editDraft={editCommentDraft}
            onEditDraftChange={setEditCommentDraft}
            onLike={() => handleLikeComment(item)}
            onReply={() => undefined}
            mentionName={parentName}
            onDelete={isOwner ? () => handleDeleteComment(item) : undefined}
            onSaveEdit={() => handleSaveEditComment(item.id)}
            onCancelEdit={handleCancelEditComment}
          />
        </View>
        {hasReplies ? (
          <View
            style={{
              marginLeft: uiDepth * 24 + 56,
              marginTop: -2,
              marginBottom: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => handleToggleReplies(item.id, item.children.length > 0)}
              disabled={isLoadingReplies}
              activeOpacity={0.7}
            >
              <Text className="text-xs" style={{ color: themeColors.textMuted }}>
                {isLoadingReplies
                  ? "Loading replies..."
                  : isExpanded
                    ? "Hide replies"
                    : `View ${shownReplyCount} replies`}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {isExpanded
          ? item.children.map((child) => renderCommentNode(child, depth + 1))
          : null}
      </View>
    );
  };

  const ListHeader = () => {
    if (loadingPost) {
      return (
        <View className="py-8 items-center">
          <ActivityIndicator color={colors.primary[100]} />
        </View>
      );
    }
    if (!post) {
      if (accessDenied) {
        return (
          <View className="px-4 py-10">
            <EmptyState title="Bạn không còn quyền xem bài viết này" />
          </View>
        );
      }
      return null;
    }

    const theme = {
      icon: paletteIcon[colorScheme === "dark" ? "dark" : "light"],
      iconMuted: paletteIcon.lightMuted,
    };
    const effectiveCultureTerms =
      Array.isArray(post.culturalTerms) && post.culturalTerms.length > 0
        ? post.culturalTerms
        : [];
    const showCultureAnalyzing =
      post.cultureAnalyzed === false && effectiveCultureTerms.length === 0;
    const mediaBaseWidth = SCREEN_WIDTH - 32;
    const mediaWidth = post.media?.[0]?.width;
    const mediaHeight = post.media?.[0]?.height;
    const singleMediaHeight =
      mediaWidth && mediaHeight
        ? Math.min(
            460,
            Math.max(260, (mediaBaseWidth * mediaHeight) / mediaWidth)
          )
        : mediaBaseWidth;
    const isOwnPost =
      Boolean(currentUser?.id) &&
      Boolean(post.userId) &&
      currentUser?.id === post.userId;

    return (
      <View className="px-4 pt-4 pb-3 gap-4">
        {isOwnPost ? (
          <ModerationBanner
            status={post.moderationStatus}
            isHidden={post.isHidden}
            hiddenReason={(post as PostDetailDto).hiddenReason}
          />
        ) : null}

        <View className="flex-row items-start">
          <TouchableOpacity
            onPress={() =>
              post.userId ? router.push(`/profile/${post.userId}` as any) : undefined
            }
            className="flex-row items-center flex-1"
            activeOpacity={0.75}
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
                {renderMentions(post)}
              </View>
              <Text className="mt-0.5 text-xs text-text-muted-light dark:text-text-muted-dark">
                {formatTime(post.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          {currentUser?.id ? (
            <TouchableOpacity
              onPress={() => handlePostMorePress(post)}
              className="p-2"
              activeOpacity={0.7}
            >
              <ThreeDotsIcon size={20} color={theme.icon} />
            </TouchableOpacity>
          ) : null}
        </View>

        {post.contentText ? (
          <View>
            {effectiveCultureTerms.length > 0 ? (
              <CultureHighlightedText
                text={post.contentText}
                terms={effectiveCultureTerms}
                baseTextClassName="text-[27px] leading-[31px] text-text-light dark:text-text-dark"
              />
            ) : (
              <Text className="text-[27px] leading-[31px] text-text-light dark:text-text-dark">
                {post.contentText}
              </Text>
            )}
            {showCultureAnalyzing ? (
              <Text variant="muted" className="mt-1 text-xs">
                Dang phan tich van hoa...
              </Text>
            ) : null}
          </View>
        ) : null}

        {post.location?.name ? (
          <View className="flex-row items-center gap-1">
            <LocationIcon size={14} color={theme.iconMuted} />
            <Text className="text-xs text-text-muted-light dark:text-text-muted-dark">
              {post.location.name}
            </Text>
          </View>
        ) : null}

        {post.media && post.media.length > 0 ? (
          <View>
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
                      width: "50%",
                      height: mediaBaseWidth / 2,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        <View className="flex-row items-center gap-5">
          <TouchableOpacity
            onPress={handleLikePost}
            className="flex-row items-center gap-2"
            activeOpacity={0.75}
          >
            <LikeIcon
              size={24}
              color={post.isLiked ? statusColors.error.dark : theme.icon}
              filled={post.isLiked}
            />
            {post.likesCount > 0 ? (
              <Text className="text-[17px] text-text-light dark:text-text-dark">
                {post.likesCount}
              </Text>
            ) : null}
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <CommentIcon size={23} color={theme.icon} />
            {post.commentsCount > 0 ? (
              <Text className="text-[17px] text-text-light dark:text-text-dark">
                {post.commentsCount}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleSharePost}
            className="flex-row items-center gap-2"
            activeOpacity={0.75}
          >
            <ShareIcon size={22} color={theme.icon} />
            {post.sharesCount > 0 ? (
              <Text className="text-[17px] text-text-light dark:text-text-dark">
                {post.sharesCount}
              </Text>
            ) : null}
          </TouchableOpacity>

          {currentUser?.id ? (
            <TouchableOpacity
              onPress={handleSavePost}
              className="flex-row items-center gap-3 ml-auto"
              activeOpacity={0.75}
            >
              <SaveIcon
                size={22}
                color={post.isSaved ? colors.primary[100] : theme.icon}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="pt-1">
          <Text
            className="font-semibold text-text-light dark:text-text-dark"
            style={{ fontSize: 16 }}
          >
            {post.commentsCount > 0
              ? `${post.commentsCount} comments`
              : "No comments yet"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer
      horizontalPadding="default"
      style={{ paddingBottom: 0, backgroundColor: semantic.background }}
    >
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-2"
          activeOpacity={0.75}
        >
          <ArrowIcon size={35} color={semantic.title} />
        </TouchableOpacity>
        <Text className="text-xl font-semibold leading-[28px] text-title-light dark:text-title-dark flex-1">
          Post
        </Text>
      </View>

      <FlatList
        data={commentTree}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderCommentNode(item)}
        ListHeaderComponent={<ListHeader />}
        style={{ backgroundColor: semantic.background }}
        ListEmptyComponent={
          loadingComments ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={colors.primary[100]} />
            </View>
          ) : (
            <EmptyState title="No comments yet" />
          )
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {share.modals}
      {report.modal}
    </ScreenContainer>
  );
}
