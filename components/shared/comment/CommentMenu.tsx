import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal } from "react-native";
import { useAuth } from "@/context/AuthContext";
import {
  deleteComment,
  deleteCommentMedia,
  deleteCommentReply,
  deleteCommentReplyMedia,
  updateComment,
} from "@/lib/service/comment.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReportCard from "@/components/card/report/ReportCard";
import { CommentResponseDTO } from "@/dtos/CommentDTO";

interface CommentMenuProps {
  comment: CommentResponseDTO;
  // originalCommentId: string;
  // content: string;
  setCommentsData: React.Dispatch<React.SetStateAction<CommentResponseDTO[]>>;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  postId?: string;
  mediaId?: string;
  setNumberOfComments: React.Dispatch<React.SetStateAction<number>>;
  numberOfComments: number;
  setParentCommentsData?: React.Dispatch<
    React.SetStateAction<CommentResponseDTO[]>
  >;
  repliesCount?: number;
}

const CommentMenu = ({
  comment,
  // commentsData,
  setCommentsData,
  setModalVisible,
  postId,
  mediaId,
  setNumberOfComments,
  numberOfComments,
  repliesCount,
  setParentCommentsData,
}: CommentMenuProps) => {
  const [newComment, setNewComment] = useState(comment.content); // Khởi tạo giá trị mặc định là content
  const [isEditing, setIsEditing] = useState(false);
  const [isReport, setIsReport] = useState(false);

  const { profile } = useAuth();

  const closeReport = () => {
    setIsReport(false);
  };

  const handleEditComment = async (
    commentId: string,
    updatedContent: string
  ) => {
    const token: string | null = await AsyncStorage.getItem("token");
    if (!token || !updatedContent.trim()) return;

    try {
      const updatedComment = await updateComment(
        { content: updatedContent },
        commentId,
        token
      );
      setCommentsData((prev: any) =>
        prev.map((comment: any) =>
          comment._id === commentId
            ? { ...comment, content: updatedComment.comment.content }
            : comment
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const token: string | null = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("User is not authenticated");
      return;
    }

    try {
      if (postId) {
        if (comment.originalCommentId === null) {
          await deleteComment(commentId, postId, token);
          if (repliesCount)
            setNumberOfComments(numberOfComments - (repliesCount + 1));
          setCommentsData((prev: any) =>
            prev.filter((comment: any) => comment._id !== commentId)
          );
        } else {
          await deleteCommentReply(
            commentId,
            postId,
            comment.originalCommentId,
            token
          );
          setCommentsData((prev: any) =>
            prev.filter((comment: any) => comment._id !== commentId)
          );

          if (setParentCommentsData) {
            setParentCommentsData((prev: any) =>
              prev.map((comment: any) => {
                if (comment._id === comment.originalCommentId) {
                  return {
                    ...comment,
                    replies: comment.replies.filter(
                      (id: string) => id !== commentId
                    ),
                  };
                }
                return comment;
              })
            );
          }
          setNumberOfComments(numberOfComments - 1);
        }
      } else {
        if (comment.originalCommentId === null) {
          if (mediaId) await deleteCommentMedia(commentId, mediaId, token);
          if (repliesCount)
            setNumberOfComments(numberOfComments - (repliesCount + 1));
          setCommentsData((prev: any) =>
            prev.filter((comment: any) => comment._id !== commentId)
          );
        } else {
          if (mediaId)
            await deleteCommentReplyMedia(
              commentId,
              mediaId,
              comment.originalCommentId,
              token
            );
          setCommentsData((prev: any) =>
            prev.filter((comment: any) => comment._id !== commentId)
          );

          if (setParentCommentsData) {
            setParentCommentsData((prev: any) =>
              prev.map((comment: any) => {
                if (comment._id === comment.originalCommentId) {
                  return {
                    ...comment,
                    replies: comment.replies.filter(
                      (id: string) => id !== commentId
                    ),
                  };
                }
                return comment;
              })
            );
          }

          setNumberOfComments(numberOfComments - 1);
        }
      }

      setCommentsData(
        (prev: any) => prev.filter((comment: any) => comment._id !== commentId) // Remove deleted comment from state
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };
  const handleReportComment = () => {
    setIsReport(true);
    console.log("Báo cáo comment");
  };

  return (
    <View className="flex-1 justify-center items-center">
      <View className="bg-white rounded-lg p-4 w-3/4 shadow-lg">
        {isEditing ? (
          <View>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              className="border border-gray-300 rounded-lg p-2 text-sm font-mmedium"
              placeholder="Update comment..."
            />
            <View className="flex-row mt-4">
              <TouchableOpacity
                onPress={() => handleEditComment(comment._id, newComment)}
                className="bg-primary-100 rounded-lg px-3 py-2 mr-2"
              >
                <Text className="text-white text-sm font-mmedium">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                className="bg-gray-300 rounded-lg px-3 py-2"
              >
                <Text className="text-gray-600 text-sm font-mmedium">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {comment.author._id === profile._id ? (
              <>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(true);
                    console.log("isEditing set to true");
                  }}
                  className="mb-4"
                >
                  <Text className="text-blue-500 text-sm font-mmedium">
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteComment(comment._id)}
                  className="mb-4"
                >
                  <Text className="text-red-500 text-sm font-mmedium">
                    Delete
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={handleReportComment} className="mb-4">
                <Text className="text-yellow-500 text-sm font-mmedium">
                  Report
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-2"
            >
              <Text className="text-gray-500 text-sm font-mmedium">Close</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <Modal
        animationType="none"
        visible={isReport}
        onRequestClose={closeReport}
        transparent={true}
      >
        <ReportCard
          onClose={closeReport}
          type="comment"
          entityId={comment._id}
          reportedId={profile._id || ""}
          postId={postId}
        />
      </Modal>
    </View>
  );
};

export default CommentMenu;
