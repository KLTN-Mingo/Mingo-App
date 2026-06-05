import { formatDistanceToNow } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/containers/ScreenContainer";

import { CommentComposer } from "@/components/post/CommentComposer";
import { PostCard } from "@/components/post/PostCard";
import { CommentThreadItem } from "@/components/post/CommentThreadItem";
import { ArrowIcon } from "@/components/shared/icons/Icons";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { Text } from "@/components/ui";
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
import { postService } from "@/services/post.service";
import { colors, getSemantic } from "@/styles/colors";

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
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState<CommentResponseDto | null>(null);
  const [expandedReplyIds, setExpandedReplyIds] = useState<Record<string, boolean>>({});
  const [loadingReplyIds, setLoadingReplyIds] = useState<Record<string, boolean>>({});
  const inputRef = useRef<TextInput>(null);
  const feedTab: FeedTab | undefined =
    tab === "explore" || tab === "friends"
      ? tab
      : source === "explore"
        ? "explore"
        : source === "feed"
          ? "friends"
          : undefined;
  const recommendationSource =
    feedTab === "explore" ? "explore" : feedTab === "friends" ? "feed" : undefined;

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

  const fetchPost = useCallback(async () => {
    if (!id) return;
    try {
      const data = await postService.getPostById(id);
      setPost(data);
    } catch (err) {
      console.warn("Cannot load post:", err);
    } finally {
      setLoadingPost(false);
    }
  }, [id]);

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

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text || submitting) return;
    if (!id) return;

    setSubmitting(true);
    try {
      if (replyTarget) {
        const newReply = await commentService.createReply(id, replyTarget.id, {
          contentText: text,
          parentCommentId: replyTarget.id,
          originalCommentId: replyTarget.originalCommentId ?? replyTarget.id,
        });
        setComments((prev) => [newReply, ...prev]);
        setExpandedReplyIds((prev) => ({ ...prev, [replyTarget.id]: true }));
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTarget.id
              ? { ...c, repliesCount: c.repliesCount + 1 }
              : c
          )
        );
      } else {
        const newComment = await commentService.createComment(id, {
          contentText: text,
        });
        setComments((prev) => [newComment, ...prev]);
      }
      setCommentText("");
      setReplyTarget(null);
      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
    } catch (err) {
      console.warn("Cannot submit comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

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
            onReply={() => {
              setReplyTarget(item);
              inputRef.current?.focus();
            }}
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
    if (!post) return null;
    return (
      <>
        <PostCard
          post={post}
          currentUser={currentUser}
          hiddenReason={(post as PostDetailDto).hiddenReason}
          onLikeChange={(postId, isLiked) =>
            setPost((prev) =>
              prev
                ? {
                    ...prev,
                    isLiked,
                    likesCount: isLiked
                      ? prev.likesCount + 1
                      : prev.likesCount - 1,
                  }
                : prev
            )
          }
          onShareChange={(postId, nextCount) =>
            setPost((prev) =>
              prev && prev.id === postId ? { ...prev, sharesCount: nextCount } : prev
            )
          }
          onSharePress={share.openSheet}
          onSaveChange={(postId, isSaved, savesCount) =>
            setPost((prev) =>
              prev && prev.id === postId
                ? { ...prev, isSaved, savesCount }
                : prev
            )
          }
          onCommentPress={() => inputRef.current?.focus()}
          onMorePress={handlePostMorePress}
          recommendationSource={recommendationSource}
        />
        <View
          className="px-4 py-3 border-b"
          style={{ borderBottomColor: themeColors.border }}
        >
          <Text
            className="font-semibold"
            style={{ color: themeColors.textPrimary }}
          >
            {post.commentsCount > 0
              ? `${post.commentsCount} comments`
              : "No comments yet"}
          </Text>
        </View>
      </>
    );
  };

  return (
    <ScreenContainer
      horizontalPadding="none"
      style={{ paddingBottom: 0, backgroundColor: semantic.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b"
        style={{
          backgroundColor: semantic.surface,
          borderBottomColor: semantic.border,
        }}
      >
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home" as any)} className="mr-3 p-1">
          <ArrowIcon size={22} color={semantic.text} />
        </TouchableOpacity>
        <Text className="font-semibold text-lg" style={{ color: semantic.text }}>
          Post
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Comments list */}
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
          contentContainerStyle={{ paddingBottom: 16 }}
        />

        <CommentComposer
          colors={themeColors}
          avatarUri={currentUser?.avatar}
          avatarFallback={currentUser?.name}
          value={commentText}
          onChangeText={setCommentText}
          onSubmit={handleSubmitComment}
          submitting={submitting}
          inputRef={inputRef}
          placeholder={
            replyTarget
              ? `Reply to ${replyTarget.user?.name ?? "this comment"}...`
              : "Write comment..."
          }
        />
      </KeyboardAvoidingView>

      {share.modals}
      {report.modal}
    </ScreenContainer>
  );
}
