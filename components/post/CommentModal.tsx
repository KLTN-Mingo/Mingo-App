// import { formatDistanceToNow } from "date-fns";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   FlatList,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// import { Avatar, Icon, Text } from "@/components/ui";
// import { useAuth } from "@/context/AuthContext";
// import { CommentResponseDto } from "@/dtos";
// import { commentService } from "@/services/comment.service";
// import { BORDER_DEFAULT, colors, statusColors } from "@/styles/colors";

// interface CommentModalProps {
//   postId: string | null;
//   onClose: () => void;
//   onCommentCountChange?: (postId: string, delta: number) => void;
// }

// export function CommentModal({
//   postId,
//   onClose,
//   onCommentCountChange,
// }: CommentModalProps) {
//   const { profile } = useAuth();
//   const [comments, setComments] = useState<CommentResponseDto[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [commentText, setCommentText] = useState("");
//   const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
//   const [editCommentDraft, setEditCommentDraft] = useState("");
//   const inputRef = useRef<TextInput>(null);

//   const fetchComments = useCallback(async () => {
//     if (!postId) return;
//     setLoading(true);
//     try {
//       const data = await commentService.getComments(postId);
//       setComments(data.comments);
//     } catch (err) {
//       console.warn("Cannot load comments:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [postId]);

//   useEffect(() => {
//     if (postId) {
//       setComments([]);
//       setCommentText("");
//       setEditingCommentId(null);
//       setEditCommentDraft("");
//       fetchComments();
//     }
//   }, [postId, fetchComments]);

//   const handleSubmit = async () => {
//     const text = commentText.trim();
//     if (!text || submitting || !postId) return;

//     setSubmitting(true);
//     try {
//       const newComment = await commentService.createComment(postId, {
//         contentText: text,
//       });
//       setComments((prev) => [newComment, ...prev]);
//       setCommentText("");
//       onCommentCountChange?.(postId, 1);
//     } catch (err) {
//       console.warn("Cannot submit comment:", err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleLikeComment = async (comment: CommentResponseDto) => {
//     const newIsLiked = !comment.isLiked;
//     setComments((prev) =>
//       prev.map((c) =>
//         c.id === comment.id
//           ? {
//               ...c,
//               isLiked: newIsLiked,
//               likesCount: newIsLiked ? c.likesCount + 1 : c.likesCount - 1,
//             }
//           : c
//       )
//     );
//     try {
//       if (newIsLiked) {
//         await commentService.likeComment(postId!, comment.id);
//       } else {
//         await commentService.unlikeComment(postId!, comment.id);
//       }
//     } catch {
//       setComments((prev) =>
//         prev.map((c) =>
//           c.id === comment.id
//             ? {
//                 ...c,
//                 isLiked: !newIsLiked,
//                 likesCount: newIsLiked ? c.likesCount - 1 : c.likesCount + 1,
//               }
//             : c
//         )
//       );
//     }
//   };

//   const handleDeleteComment = async (comment: CommentResponseDto) => {
//     if (!postId) return;
//     try {
//       await commentService.deleteComment(postId, comment.id);
//       setComments((prev) => prev.filter((c) => c.id !== comment.id));
//       onCommentCountChange?.(postId, -1);
//       if (editingCommentId === comment.id) {
//         setEditingCommentId(null);
//         setEditCommentDraft("");
//       }
//     } catch (error) {
//       console.warn("Cannot delete comment:", error);
//     }
//   };

//   const handleStartEditComment = (comment: CommentResponseDto) => {
//     setEditingCommentId(comment.id);
//     setEditCommentDraft(comment.contentText);
//   };

//   const handleCancelEditComment = () => {
//     setEditingCommentId(null);
//     setEditCommentDraft("");
//   };

//   const handleSaveEditComment = async (commentId: string) => {
//     const text = editCommentDraft.trim();
//     if (!text || !postId) return;
//     try {
//       const updated = await commentService.updateComment(commentId, {
//         contentText: text,
//       });
//       setComments((prev) =>
//         prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c))
//       );
//       setEditingCommentId(null);
//       setEditCommentDraft("");
//     } catch (error) {
//       console.warn("Cannot update comment:", error);
//     }
//   };

//   const formatTime = (dateStr: string) => {
//     try {
//       return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
//     } catch {
//       return "";
//     }
//   };

//   const renderComment = ({ item }: { item: CommentResponseDto }) => {
//     const isEditing = editingCommentId === item.id;
//     return (
//       <View className="px-4 py-2.5 flex-row">
//         <Avatar
//           source={item.user?.avatar ? { uri: item.user.avatar } : undefined}
//           fallback={item.user?.name}
//           size="sm"
//         />
//         <View className="ml-2.5 flex-1 pr-8">
//           {/* Row: username · time · heart */}
//           <View className="flex-row items-center gap-1.5 mb-1">
//             <Text className="font-semibold text-sm text-text-dark leading-tight">
//               {item.user?.name || "Unknown"}
//             </Text>
//             <Text variant="muted" className="text-xs leading-tight">·</Text>
//             <Text variant="muted" className="text-xs leading-tight flex-1">
//               {formatTime(item.createdAt)}
//             </Text>
//             <TouchableOpacity onPress={() => handleLikeComment(item)}>
//               <Icon
//                 name={item.isLiked ? "heart.fill" : "heart"}
//                 size={13}
//                 color={
//                   item.isLiked ? statusColors.error.dark : colors.dark[300]
//                 }
//               />
//             </TouchableOpacity>
//           </View>
//           {/* Comment text */}
//           {isEditing ? (
//             <TextInput
//               value={editCommentDraft}
//               onChangeText={setEditCommentDraft}
//               className="text-sm text-text-dark border border-border-dark rounded-lg px-2 py-1.5 mb-1"
//               multiline
//               maxLength={500}
//               placeholderTextColor={colors.dark[300]}
//             />
//           ) : (
//             <Text className="text-sm text-text-dark leading-relaxed">
//               {item.contentText}
//             </Text>
//           )}
//           {/* Action row */}
//           {!isEditing && (
//             <View className="flex-row items-center gap-4 mt-1.5">
//               {item.likesCount > 0 && (
//                 <Text variant="muted" className="text-xs text-red-400 leading-tight">
//                   {item.likesCount} lượt thích
//                 </Text>
//               )}
//               {profile?.id && item.userId === profile.id && (
//                 <TouchableOpacity onPress={() => handleDeleteComment(item)}>
//                   <Text variant="muted" className="text-xs text-red-400 leading-tight">
//                     Xóa
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}
//           {isEditing && (
//             <View className="flex-row gap-4 mt-1">
//               <TouchableOpacity onPress={() => handleSaveEditComment(item.id)}>
//                 <Text className="text-xs font-semibold text-primary-100 leading-tight">Lưu</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleCancelEditComment}>
//                 <Text variant="muted" className="text-xs leading-tight">Hủy</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <Modal
//       visible={!!postId}
//       animationType="slide"
//       presentationStyle="pageSheet"
//       onRequestClose={onClose}
//     >
//       <SafeAreaView
//         className="flex-1 bg-background-dark"
//         edges={["top"]}
//       >
//         {/* Header */}
//         <View className="flex-row items-center justify-between px-4 py-3 bg-surface-dark border-b border-border-dark">
//           <Text className="font-semibold text-base text-text-dark">Bình luận</Text>
//           <TouchableOpacity onPress={onClose} className="p-1">
//             <Icon name="xmark" size={20} color={colors.dark[100]} />
//           </TouchableOpacity>
//         </View>

//         <KeyboardAvoidingView
//           className="flex-1"
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//         >
//           {loading ? (
//             <View className="flex-1 items-center justify-center">
//               <ActivityIndicator color={colors.primary[100]} />
//             </View>
//           ) : (
//             <FlatList
//               data={comments}
//               keyExtractor={(item) => item.id}
//               renderItem={renderComment}
//               ListEmptyComponent={
//                 <View className="flex-1 items-center justify-center py-20">
//                   <Icon
//                     name="bubble.left"
//                     size={40}
//                     color={colors.dark[300]}
//                   />
//                   <Text variant="muted" className="mt-3">
//                     Chưa có bình luận nào
//                   </Text>
//                 </View>
//               }
//               contentContainerStyle={{ paddingBottom: 16 }}
//             />
//           )}

//           {/* Comment Input */}
//           <View className="flex-row items-center px-4 py-3 bg-surface-dark border-t border-border-dark gap-3">
//             <Avatar
//               source={profile?.avatar ? { uri: profile.avatar } : undefined}
//               fallback={profile?.name}
//               size="sm"
//             />
//             <TextInput
//               ref={inputRef}
//               value={commentText}
//               onChangeText={setCommentText}
//               placeholder="Viết bình luận..."
//               placeholderTextColor={colors.dark[300]}
//               className="flex-1 bg-surface-dark rounded-full px-4 py-2.5 text-base font-regular text-text-dark"
//               multiline
//               maxLength={500}
//             />
//             <TouchableOpacity
//               onPress={handleSubmit}
//               disabled={!commentText.trim() || submitting}
//               className="p-2"
//             >
//               {submitting ? (
//                 <ActivityIndicator size="small" color={colors.primary[100]} />
//               ) : (
//                 <Icon
//                   name="paperplane.fill"
//                   size={22}
//                   color={
//                     commentText.trim() ? colors.primary[100] : BORDER_DEFAULT
//                   }
//                 />
//               )}
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </Modal>
//   );
// }

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
import { BORDER_DEFAULT, colors, statusColors } from "@/styles/colors";

interface CommentWithReplies extends CommentResponseDto {
  replies?: CommentResponseDto[];
  replyCount?: number;
}

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
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(false);
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
      console.warn("Cannot load comments:", err);
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
      let newComment: CommentResponseDto;

      if (replyingTo) {
        newComment = await commentService.createReply(postId, replyingTo.id, {
          contentText: text,
          parentCommentId: replyingTo.id,
          originalCommentId: replyingTo.originalCommentId,
        });
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.id
              ? {
                  ...c,
                  replies: [newComment, ...(c.replies ?? [])],
                  repliesCount: (c.repliesCount ?? 0) + 1,
                }
              : c
          )
        );
        setExpandedReplies((prev) => new Set([...prev, replyingTo.id]));
      } else {
        newComment = await commentService.createComment(postId, {
          contentText: text,
        });
        setComments((prev) => [newComment, ...prev]);
        onCommentCountChange?.(postId, 1);
      }

      setReplyingTo(null);
      setCommentText("");
    } catch (err) {
      console.warn("Cannot submit comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (comment: CommentResponseDto, parentId?: string) => {
    const newIsLiked = !comment.isLiked;

    const updateComment = (c: CommentWithReplies) =>
      c.id === comment.id
        ? { ...c, isLiked: newIsLiked, likesCount: newIsLiked ? c.likesCount + 1 : c.likesCount - 1 }
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
          ? { ...c, isLiked: !newIsLiked, likesCount: newIsLiked ? c.likesCount - 1 : c.likesCount + 1 }
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

  const handleDeleteComment = async (comment: CommentResponseDto, parentId?: string) => {
    try {
      await commentService.deleteComment(comment.id);
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: (c.replies ?? []).filter((r) => r.id !== comment.id), repliesCount: Math.max(0, (c.repliesCount ?? 1) - 1) }
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
              ? { ...c, replies: (c.replies ?? []).map((r) => (r.id === commentId ? { ...r, ...updated } : r)) }
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
      console.warn("Cannot update comment:", error);
    }
  };

  const handleToggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const handleReply = (comment: CommentResponseDto, originalCommentId: string) => {
    setReplyingTo({ id: comment.id, name: comment.user?.name ?? "Unknown", originalCommentId });
    inputRef.current?.focus();
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const renderCommentItem = (
    item: CommentResponseDto,
    parentId?: string,
    mentionName?: string,
    originalCommentId?: string
  ) => {
    const isEditing = editingCommentId === item.id;
    const isOwner = profile?.id && item.userId === profile.id;

    return (
      <View key={item.id} className="flex-row px-4 py-2.5">
        <Avatar
          source={item.user?.avatar ? { uri: item.user.avatar } : undefined}
          fallback={item.user?.name}
          size="sm"
        />
        <View className="ml-3 flex-1">
          {/* Name + mention + time */}
          <View className="flex-row items-center gap-1 mb-0.5 flex-wrap">
            <Text className="font-semibold text-sm text-text-light leading-tight">
              {item.user?.name ?? "Unknown"}
            </Text>
            {mentionName && (
              <>
                <Icon name="chevron.right" size={10} color={colors.dark[400]} />
                <Text className="font-semibold text-sm text-text-light leading-tight">
                  {mentionName}
                </Text>
              </>
            )}
          </View>

          {/* Comment bubble */}
          {isEditing ? (
            <TextInput
              value={editCommentDraft}
              onChangeText={setEditCommentDraft}
              className="text-sm text-text-light border border-border-light rounded-2xl px-3 py-2 mb-1 bg-surface-muted-light"
              multiline
              maxLength={500}
              placeholderTextColor={colors.dark[300]}
            />
          ) : (
            <View className="bg-surface-muted-light rounded-2xl px-3 py-2 self-start max-w-full mb-1">
              <Text className="text-sm text-text-light leading-relaxed">
                {item.contentText}
              </Text>
            </View>
          )}

          {/* Meta row: time · Like N · Reply */}
          {!isEditing && (
            <View className="flex-row items-center gap-3 mt-0.5">
              <Text variant="muted" className="text-xs leading-tight">
                {formatTime(item.createdAt)}
              </Text>

              <TouchableOpacity onPress={() => handleLikeComment(item, parentId)} className="flex-row items-center gap-1">
                <Text variant="muted" className="text-xs leading-tight">
                  Like
                </Text>
                {item.likesCount > 0 && (
                  <Text className="text-xs text-red-400 leading-tight">
                    {item.likesCount}
                  </Text>
                )}
              </TouchableOpacity>

              <Text variant="muted" className="text-xs leading-tight">·</Text>

              <TouchableOpacity onPress={() => handleReply(item, item.id)}>
                <Text variant="muted" className="text-xs leading-tight">Reply</Text>
              </TouchableOpacity>

              {isOwner && (
                <>
                  <Text variant="muted" className="text-xs leading-tight">·</Text>
                  <TouchableOpacity onPress={() => handleDeleteComment(item, parentId)}>
                    <Text className="text-xs text-red-400 leading-tight">Xóa</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {isEditing && (
            <View className="flex-row gap-4 mt-1">
              <TouchableOpacity onPress={() => handleSaveEditComment(item.id, parentId)}>
                <Text className="text-xs font-semibold text-primary-100 leading-tight">Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancelEditComment}>
                <Text variant="muted" className="text-xs leading-tight">Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Heart icon */}
        <TouchableOpacity onPress={() => handleLikeComment(item, parentId)} className="ml-2 pt-7">
          <Icon
            name={item.isLiked ? "heart.fill" : "heart"}
            size={14}
            color={item.isLiked ? statusColors.error.dark : colors.dark[300]}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderComment = ({ item }: { item: CommentWithReplies }) => {
    const hasReplies = (item.repliesCount ?? 0) > 0 || (item.replies?.length ?? 0) > 0;
    const isExpanded = expandedReplies.has(item.id);
    const replyCount = item.repliesCount ?? item.replies?.length ?? 0;

    return (
      <View>
        {renderCommentItem(item)}

        {/* Replies section */}
        {hasReplies && (
          <View className="ml-16">
            {/* Toggle replies */}
            <TouchableOpacity
              onPress={() => handleToggleReplies(item.id)}
              className="flex-row items-center gap-2 px-4 pb-1"
            >
              <View className="h-px w-6 bg-border-light" />
              <Text variant="muted" className="text-xs font-medium">
                {isExpanded ? "Hide replies" : `${replyCount} replies`}
              </Text>
            </TouchableOpacity>

            {/* Expanded replies */}
            {isExpanded && (item.replies ?? []).map((reply) =>
              renderCommentItem(reply, item.id, item.user?.name, item.id)
            )}
          </View>
        )}
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
      <SafeAreaView className="flex-1 bg-background-light" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-background-light border-b border-border-light">
          <Text className="font-semibold text-base text-text-light">Bình luận</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Icon name="xmark" size={20} color={colors.dark[400]} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.primary[100]} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20">
                  <Icon name="bubble.left" size={40} color={colors.dark[300]} />
                  <Text variant="muted" className="mt-3">
                    Chưa có bình luận nào
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}

          {/* Reply banner */}
          {replyingTo && (
            <View className="flex-row items-center px-4 py-2 bg-surface-muted-light border-t border-border-light">
              <Text variant="muted" className="text-xs flex-1">
                Đang trả lời <Text className="font-semibold text-text-light">{replyingTo.name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Icon name="xmark" size={14} color={colors.dark[300]} />
              </TouchableOpacity>
            </View>
          )}

          {/* Comment Input */}
          <View className="flex-row items-center px-4 py-3 bg-background-light border-t border-border-light gap-3">
            <Avatar
              source={profile?.avatar ? { uri: profile.avatar } : undefined}
              fallback={profile?.name}
              size="sm"
            />
            <TextInput
              ref={inputRef}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write comment..."
              placeholderTextColor={colors.dark[300]}
              className="flex-1 bg-surface-muted-light rounded-full px-4 py-2.5 text-sm font-regular text-text-light"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!commentText.trim() || submitting}
              className="p-2"
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.primary[100]} />
              ) : (
                <Icon
                  name="paperplane.fill"
                  size={22}
                  color={commentText.trim() ? colors.primary[100] : BORDER_DEFAULT}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}