import { formatDistanceToNow } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { Avatar, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { CommentResponseDto, PostResponseDto, UserMinimalDto } from "@/dtos";
import { commentService } from "@/services/comment.service";
import { postService } from "@/services/post.service";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  const [post, setPost] = useState<PostResponseDto | null>(null);
  const [comments, setComments] = useState<CommentResponseDto[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
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
        await commentService.likeComment(id!, comment.id);
      } else {
        await commentService.unlikeComment(id!, comment.id);
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
            <LikeIcon size={13} color={item.isLiked ? "#EB5A5A" : "#9CA3AF"} />
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

  const ListHeader = () => {
    if (loadingPost) {
      return (
        <View className="py-8 items-center">
          <ActivityIndicator color="#768D85" />
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
        />
        <View className="px-4 py-3 border-b border-border-dark">
          <Text className="font-semibold text-text-dark">
            {post.commentsCount > 0
              ? `${post.commentsCount} bình luận`
              : "Chưa có bình luận"}
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
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <ArrowIcon size={22} color="#CFBFAD" />
        </TouchableOpacity>
        <Text className="font-semibold text-lg text-text-dark">Bài viết</Text>
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
                <ActivityIndicator color="#768D85" />
              </View>
            ) : null
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
            placeholderTextColor="#515E5A"
            className="flex-1 bg-[#2D2F2F] rounded-full px-4 py-2.5 text-base font-regular text-text-dark"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
            className="p-2"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#768D85" />
            ) : (
              <SendIcon
                size={22}
                color={commentText.trim() ? "#768D85" : "#C4C4C4"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
