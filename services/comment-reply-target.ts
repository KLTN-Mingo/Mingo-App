type ReplyTargetComment = {
  id: string;
  parentCommentId?: string | null;
  originalCommentId?: string | null;
  user?: {
    name?: string;
  };
};

export type ReplyTarget = {
  id: string;
  name: string;
  originalCommentId: string;
};

export function getReplyTarget(comment: ReplyTargetComment): ReplyTarget {
  return {
    id: comment.id,
    name: comment.user?.name ?? "Unknown",
    originalCommentId:
      comment.originalCommentId || comment.parentCommentId || comment.id,
  };
}
