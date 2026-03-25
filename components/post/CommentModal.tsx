import { formatDistanceToNow } from "date-fns";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Icon, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { CommentResponseDto } from "@/dtos";
import { commentService } from "@/services/comment.service";

interface CommentModalProps {
  postId: string | null;
  onClose: () => void;
  onCommentCountChange?: (postId: string, delta: number) => void;
}

export function CommentModal({
  postId,
  onClose,
  onCommentCountChange,
}: CommentModalProps) {
  const { profile } = useAuth();
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await commentService.getComments(postId);
      setComments(data.comments);
    } catch (err) {
      console.warn("Cannot load comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      setComments([]);
      setCommentText("");
      fetchComments();
    }
  }, [postId, fetchComments]);

  const handleSubmit = async () => {
    const text = commentText.trim();
    if (!text || submitting || !postId) return;

    setSubmitting(true);
    try {
      const newComment = await commentService.createComment(postId, {
        contentText: text,
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      onCommentCountChange?.(postId, 1);
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
        await commentService.likeComment(postId!, comment.id);
      } else {
        await commentService.unlikeComment(postId!, comment.id);
      }
    } catch {
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

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const renderComment = ({ item }: { item: CommentResponseDto }) => (
    <View className="flex-row px-4 py-3">
      <Avatar
        source={item.user?.avatar ? { uri: item.user.avatar } : undefined}
        fallback={item.user?.name}
        size="sm"
      />
      <View className="ml-3 flex-1">
        <View className="rounded-2xl bg-surface-dark px-3 py-2">
          <Text className="font-semibold text-sm text-text-dark">
            {item.user?.name || "Unknown"}
          </Text>
          <Text className="text-sm mt-0.5 text-text-dark">{item.contentText}</Text>
        </View>
        <View className="flex-row items-center mt-1 gap-4 ml-1">
          <Text variant="muted" className="text-xs">
            {formatTime(item.createdAt)}
          </Text>
          <TouchableOpacity
            onPress={() => handleLikeComment(item)}
            className="flex-row items-center gap-1"
          >
            <Icon
              name={item.isLiked ? "heart.fill" : "heart"}
              size={13}
              color={item.isLiked ? "#EB5A5A" : "#9CA3AF"}
            />
            {item.likesCount > 0 && (
              <Text variant="muted" className="text-xs">
                {item.likesCount}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={!!postId}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="flex-1 bg-background-dark"
        edges={["top"]}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-surface-dark border-b border-border-dark">
          <Text className="font-semibold text-base text-text-dark">Bình luận</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Icon name="xmark" size={20} color="#CFBFAD" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#768D85" />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20">
                  <Icon name="bubble.left" size={40} color="#9CA3AF" />
                  <Text variant="muted" className="mt-3">
                    Chưa có bình luận nào
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}

          {/* Comment Input */}
          <View className="flex-row items-center px-4 py-3 bg-surface-dark border-t border-border-dark gap-3">
            <Avatar
              source={profile?.avatar ? { uri: profile.avatar } : undefined}
              fallback={profile?.name}
              size="sm"
            />
            <TextInput
              ref={inputRef}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Viết bình luận..."
              placeholderTextColor="#515E5A"
              className="flex-1 bg-[#2D2F2F] rounded-full px-4 py-2.5 text-base font-regular text-text-dark"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!commentText.trim() || submitting}
              className="p-2"
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#768D85" />
              ) : (
                <Icon
                  name="paperplane.fill"
                  size={22}
                  color={commentText.trim() ? "#768D85" : "#C4C4C4"}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
