import React, { useCallback, useState } from "react";
import { Alert } from "react-native";

import { RepostModal } from "@/components/post/RepostModal";
import { SharePostModal } from "@/components/post/SharePostModal";
import type { PostResponseDto, RepostSuccessDto } from "@/dtos";

interface UseSharePostOptions {
  /** id của user đang đăng nhập — để biết bài có phải của mình (chặn repost own). */
  currentUserId?: string;
  /** Callback khi DM share xong — parent có thể bump sharesCount. */
  onShared?: (info: { postId: string; sentCount: number }) => void;
  /** Callback khi repost xong — parent có thể bump repostCount. */
  onReposted?: (info: RepostSuccessDto) => void;
}

/**
 * Gom 2 modal share (DM + Repost) vào 1 hook để PostCard / screens dễ dùng.
 *
 * ```tsx
 * const share = useSharePost({ currentUserId: me?.id, onShared, onReposted });
 * <PostCard post={p} onSharePress={share.openSheet} />
 * {share.modals}
 * ```
 */
export function useSharePost(options: UseSharePostOptions = {}) {
  const { currentUserId, onShared, onReposted } = options;

  const [dmPost, setDmPost] = useState<PostResponseDto | null>(null);
  const [repostPost, setRepostPost] = useState<PostResponseDto | null>(null);

  const openSheet = useCallback(
    (post: PostResponseDto) => {
      const isOwn = !!currentUserId && post.userId === currentUserId;

      Alert.alert("Chia sẻ bài viết", undefined, [
        {
          text: "Gửi qua tin nhắn",
          onPress: () => setDmPost(post),
        },
        // REPOST_OWN_POST_FORBIDDEN guard (guide §3) — disable ở UI thay vì chờ BE.
        ...(isOwn
          ? []
          : [
              {
                text: "Repost",
                onPress: () => setRepostPost(post),
              },
            ]),
        { text: "Huỷ", style: "cancel" as const },
      ]);
    },
    [currentUserId]
  );

  const modals = (
    <>
      <SharePostModal
        visible={!!dmPost}
        postId={dmPost?.id ?? null}
        onShared={(info) => {
          onShared?.(info);
          setDmPost(null);
        }}
        onClose={() => setDmPost(null)}
      />
      <RepostModal
        visible={!!repostPost}
        post={repostPost}
        onReposted={(info) => {
          onReposted?.(info);
          setRepostPost(null);
        }}
        onClose={() => setRepostPost(null)}
      />
    </>
  );

  return { openSheet, modals };
}
