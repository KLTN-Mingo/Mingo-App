import { formatDistanceToNow } from "date-fns";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommentComposer } from "@/components/post/CommentComposer";
import { CommentThreadItem } from "@/components/post/CommentThreadItem";
import { Icon, ScreenHeader, Text } from "@/components/ui";
import { paletteDark, paletteLight } from "@/constants/designTokens";
import { useAuth } from "@/context/AuthContext";
import { CommentResponseDto } from "@/dtos";
import { commentService } from "@/services/comment.service";

interface CommentWithReplies extends CommentResponseDto {
  replies?: CommentResponseDto[];
}

interface CommentModalProps {
  postId: string | null;
  onClose: () => void;
  onCommentCountChange?: (postId: string, delta: number) => void;
}

function replyMentionName(
  reply: CommentResponseDto,
  topComment: CommentWithReplies
): string | undefined {
  if (!reply.parentCommentId || reply.parentCommentId === topComment.id) {
    return undefined;
  }
  return topComment.replies?.find((r) => r.id === reply.parentCommentId)?.user
    ?.name;
}

export function CommentModal({
  postId,
  onClose,
  onCommentCountChange,
}: CommentModalProps) {
  const { profile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? paletteDark : paletteLight;

  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
    originalCommentId: string;
  } | null>(null);
  const inputRef = useRef<TextInput>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await commentService.getComments(postId);
      setComments(data.comments);
    } catch (err) {
      console.error("[comment] load failed", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      setComments([]);
      setCommentText("");
      setEditingCommentId(null);
      setEditCommentDraft("");
      setExpandedReplies(new Set());
      setReplyingTo(null);
      fetchComments();
    }
  }, [postId, fetchComments]);

  const handleSubmit = async () => {
    const text = commentText.trim();
    if (!text || submitting || !postId) return;

    setSubmitting(true);
    try {
      if (replyingTo) {
        const newComment = await commentService.createReply(
          postId,
          replyingTo.id,
          {
            contentText: text,
            parentCommentId: replyingTo.id,
            originalCommentId: replyingTo.originalCommentId,
          }
        );
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.originalCommentId
              ? {
                  ...c,
                  replies: [newComment, ...(c.replies ?? [])],
                  repliesCount: (c.repliesCount ?? 0) + 1,
                }
              : c
          )
        );
        setExpandedReplies(
          (prev) => new Set([...prev, replyingTo.originalCommentId])
        );
        onCommentCountChange?.(postId, 1);
      } else {
        const newComment = await commentService.createComment(postId, {
          contentText: text,
        });
        setComments((prev) => [newComment, ...prev]);
        onCommentCountChange?.(postId, 1);
      }

      setReplyingTo(null);
      setCommentText("");
    } catch (err) {
      console.error("[comment] submit failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (
    comment: CommentResponseDto,
    parentId?: string
  ) => {
    const newIsLiked = !comment.isLiked;

    const updateComment = (c: CommentWithReplies) =>
      c.id === comment.id
        ? {
            ...c,
            isLiked: newIsLiked,
            likesCount: newIsLiked ? c.likesCount + 1 : c.likesCount - 1,
          }
        : c;

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: (c.replies ?? []).map(updateComment) }
            : c
        )
      );
    } else {
      setComments((prev) => prev.map(updateComment));
    }

    try {
      if (newIsLiked) {
        await commentService.likeComment(comment.id);
      } else {
        await commentService.unlikeComment(comment.id);
      }
    } catch {
      const revertComment = (c: CommentWithReplies) =>
        c.id === comment.id
          ? {
              ...c,
              isLiked: !newIsLiked,
              likesCount: newIsLiked ? c.likesCount - 1 : c.likesCount + 1,
            }
          : c;
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: (c.replies ?? []).map(revertComment) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.map(revertComment));
      }
    }
  };

  const handleDeleteComment = async (
    comment: CommentResponseDto,
    parentId?: string
  ) => {
    try {
      await commentService.deleteComment(comment.id);
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: (c.replies ?? []).filter((r) => r.id !== comment.id),
                  repliesCount: Math.max(0, (c.repliesCount ?? 1) - 1),
                }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
        onCommentCountChange?.(postId!, -1);
      }
      if (editingCommentId === comment.id) {
        setEditingCommentId(null);
        setEditCommentDraft("");
      }
    } catch (error) {
      console.error("[comment] delete failed", error);
    }
  };

  const handleSaveEditComment = async (commentId: string, parentId?: string) => {
    const text = editCommentDraft.trim();
    if (!text || !postId) return;
    try {
      const updated = await commentService.updateComment(commentId, {
        contentText: text,
      });
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: (c.replies ?? []).map((r) =>
                    r.id === commentId ? { ...r, ...updated } : r
                  ),
                }
              : c
          )
        );
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c))
        );
      }
      setEditingCommentId(null);
      setEditCommentDraft("");
    } catch (error) {
      console.error("[comment] update failed", error);
    }
  };

  const handleToggleReplies = async (comment: CommentWithReplies) => {
    const commentId = comment.id;
    const isExpanded = expandedReplies.has(commentId);

    if (isExpanded) {
      setExpandedReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
      return;
    }

    const needsFetch =
      (comment.repliesCount ?? 0) > 0 && !(comment.replies?.length ?? 0);

    if (needsFetch) {
      setLoadingReplies((prev) => new Set([...prev, commentId]));
      try {
        const data = await commentService.getCommentReplies(commentId);
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, replies: data.comments } : c
          )
        );
      } catch (err) {
        console.error("[comment] replies load failed", err);
        return;
      } finally {
        setLoadingReplies((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      }
    }

    setExpandedReplies((prev) => new Set([...prev, commentId]));
  };

  const handleReply = (
    comment: CommentResponseDto,
    originalCommentId: string
  ) => {
    setReplyingTo({
      id: comment.id,
      name: comment.user?.name ?? "Unknown",
      originalCommentId,
    });
    inputRef.current?.focus();
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const renderThreadItem = (
    item: CommentResponseDto,
    opts: {
      parentId?: string;
      mentionName?: string;
      originalCommentId: string;
    }
  ) => {
    const isEditing = editingCommentId === item.id;
    const isOwner = profile?.id && item.userId === profile.id;

    return (
      <CommentThreadItem
        key={item.id}
        comment={item}
        colors={colors}
        formatTime={formatTime}
        mentionName={opts.mentionName}
        isEditing={isEditing}
        editDraft={editCommentDraft}
        onEditDraftChange={setEditCommentDraft}
        onLike={() => handleLikeComment(item, opts.parentId)}
        onReply={() => handleReply(item, opts.originalCommentId)}
        onDelete={isOwner ? () => handleDeleteComment(item, opts.parentId) : undefined}
        onSaveEdit={() => handleSaveEditComment(item.id, opts.parentId)}
        onCancelEdit={() => {
          setEditingCommentId(null);
          setEditCommentDraft("");
        }}
      />
    );
  };

  const renderComment = ({ item }: { item: CommentWithReplies }) => {
    const replyCount = item.repliesCount ?? item.replies?.length ?? 0;
    const hasReplies = replyCount > 0;
    const isExpanded = expandedReplies.has(item.id);
    const isLoadingReplies = loadingReplies.has(item.id);

    return (
      <View>
        {renderThreadItem(item, { originalCommentId: item.id })}

        {hasReplies ? (
          <View className="ml-11">
            <TouchableOpacity
              onPress={() => handleToggleReplies(item)}
              className="flex-row items-center gap-2 px-4 py-1"
              disabled={isLoadingReplies}
            >
              <View
                className="h-px w-8"
                style={{ backgroundColor: colors.border }}
              />
              {isLoadingReplies ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textMuted }}
                >
                  {isExpanded
                    ? "Hide replies"
                    : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                </Text>
              )}
            </TouchableOpacity>

            {isExpanded
              ? (item.replies ?? []).map((reply) =>
                  renderThreadItem(reply, {
                    parentId: item.id,
                    mentionName: replyMentionName(reply, item),
                    originalCommentId: item.id,
                  })
                )
              : null}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <Modal
      visible={!!postId}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        edges={["top"]}
      >
        <ScreenHeader
          title="Comments"
          rightSlot={
            <TouchableOpacity onPress={onClose} className="p-2">
              <Icon name="xmark" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          }
        />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.textMuted} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20">
                  <Icon name="bubble.left" size={40} color={colors.textMuted} />
                  <Text className="mt-3" style={{ color: colors.textMuted }}>
                    No comments yet
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}

          {replyingTo ? (
            <View
              className="flex-row items-center px-4 py-2"
              style={{
                backgroundColor: colors.surfaceMuted,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Text className="text-xs flex-1" style={{ color: colors.textMuted }}>
                Replying to{" "}
                <Text
                  className="font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  {replyingTo.name}
                </Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Icon name="xmark" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : null}

          <CommentComposer
            colors={colors}
            avatarUri={profile?.avatar}
            avatarFallback={profile?.name}
            value={commentText}
            onChangeText={setCommentText}
            onSubmit={handleSubmit}
            submitting={submitting}
            inputRef={inputRef}
            placeholder="Write comment..."
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
