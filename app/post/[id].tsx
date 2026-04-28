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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PostCard } from "@/components/post/PostCard";
import { ArrowIcon, LikeIcon, SendIcon } from "@/components/shared/icons/Icons";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { Avatar, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { CommentResponseDto, PostResponseDto, UserMinimalDto } from "@/dtos";
import { commentService } from "@/services/comment.service";
import { postService } from "@/services/post.service";
import { BORDER_DEFAULT, colors, statusColors } from "@/styles/colors";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  const [post, setPost] = useState<PostResponseDto | null>(null);
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState("");
  const inputRef = useRef<TextInput>(null);

  const currentUser: UserMinimalDto | null = profile
    ? {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        verified: profile.verified,
      }
    : null;

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

    setSubmitting(true);
    try {
      const newComment = await commentService.createComment(id!, {
        contentText: text,
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
    } catch (err) {
      console.warn("Cannot submit comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

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
            await postService.submitFeedFeedback(p.id, "hide");
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
            await postService.submitFeedFeedback(p.id, "not_interested");
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
            await postService.submitFeedFeedback(p.id, "see_more");
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Cannot send feedback";
            Alert.alert("Error", msg);
          }
        },
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

  const handleStartEditComment = (comment: CommentResponseDto) => {
    setEditingCommentId(comment.id);
    setEditCommentDraft(comment.contentText);
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

  const renderComment = ({ item }: { item: CommentResponseDto }) => {
    const isEditing = editingCommentId === item.id;
    return (
      <View className="px-4 py-2.5 flex-row">
        <Avatar
          source={item.user?.avatar ? { uri: item.user.avatar } : undefined}
          fallback={item.user?.name}
          size="sm"
        />
        <View className="ml-2.5 flex-1 pr-8">
          {/* Row: username · time · heart */}
          <View className="flex-row items-center gap-1.5 mb-1">
            <Text className="font-semibold text-sm text-text-dark leading-tight">
              {item.user?.name || "Unknown"}
            </Text>
            <Text variant="muted" className="text-xs leading-tight">·</Text>
          <Text variant="muted" className="text-xs leading-tight flex-1">
              {formatTime(item.createdAt)}
            </Text>
            <TouchableOpacity onPress={() => handleLikeComment(item)}>
              <LikeIcon
                size={13}
                color={item.isLiked ? statusColors.error.dark : colors.dark[300]}
              />
            </TouchableOpacity>
          </View>
          {/* Comment text */}
          {isEditing ? (
            <TextInput
              value={editCommentDraft}
              onChangeText={setEditCommentDraft}
              className="text-sm text-text-dark border border-border-dark rounded-lg px-2 py-1.5 mb-1"
              multiline
              maxLength={500}
              placeholderTextColor={colors.dark[300]}
            />
          ) : (
            <Text className="text-sm text-text-dark leading-relaxed">
              {item.contentText}
            </Text>
          )}
          {/* Action row */}
          {!isEditing && (
            <View className="flex-row items-center gap-4 mt-1.5">
              {item.likesCount > 0 && (
                <Text variant="muted" className="text-xs text-red-400 leading-tight">
                  {item.likesCount} lượt thích
                </Text>
              )}
              {currentUser?.id && item.userId === currentUser.id && (
                <TouchableOpacity onPress={() => handleDeleteComment(item)}>
                  <Text variant="muted" className="text-xs text-red-400 leading-tight">
                    Xóa
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {isEditing && (
            <View className="flex-row gap-4 mt-1">
              <TouchableOpacity onPress={() => handleSaveEditComment(item.id)}>
                <Text className="text-xs font-semibold text-primary-100 leading-tight">Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancelEditComment}>
                <Text variant="muted" className="text-xs leading-tight">Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
          onSaveChange={(postId, isSaved) =>
            setPost((prev) =>
              prev && prev.id === postId ? { ...prev, isSaved } : prev
            )
          }
          onCommentPress={() => inputRef.current?.focus()}
          onMorePress={handlePostMorePress}
        />
        <View className="px-4 py-3 border-b border-border-dark">
          <Text className="font-semibold text-text-dark">
            {post.commentsCount > 0
              ? `${post.commentsCount} bình luận`
              : "No comments yet"}
          </Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-surface-dark border-b border-border-dark">
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home" as any)} className="mr-3 p-1">
          <ArrowIcon size={22} color={colors.dark[100]} />
        </TouchableOpacity>
        <Text className="font-semibold text-lg text-text-dark">Post</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Comments list */}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          ListHeaderComponent={<ListHeader />}
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

        {/* Comment Input */}
        <View className="flex-row items-center px-4 py-3 bg-surface-dark border-t border-border-dark gap-3">
          <Avatar
            source={
              currentUser?.avatar ? { uri: currentUser.avatar } : undefined
            }
            fallback={currentUser?.name}
            size="sm"
          />
          <TextInput
            ref={inputRef}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Viết bình luận..."
            placeholderTextColor={colors.dark[300]}
            className="flex-1 bg-surface-dark rounded-full px-4 py-2.5 text-base font-regular text-text-dark"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
            className="p-2"
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.primary[100]} />
            ) : (
              <SendIcon
                size={22}
                color={commentText.trim() ? colors.primary[100] : BORDER_DEFAULT}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
