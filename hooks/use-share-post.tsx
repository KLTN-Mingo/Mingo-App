import React, { useCallback, useState } from "react";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";

import { RepostModal } from "@/components/post/RepostModal";
import { SharePostModal } from "@/components/post/SharePostModal";
import { SafeModalSheet } from "@/components/containers/SafeLayout";
import { Text } from "@/components/ui";
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

  const [chooserPost, setChooserPost] = useState<PostResponseDto | null>(null);
  const [dmPost, setDmPost] = useState<PostResponseDto | null>(null);
  const [repostPost, setRepostPost] = useState<PostResponseDto | null>(null);

  const openSheet = useCallback(
    (post: PostResponseDto) => {
      setChooserPost(post);
    },
    []
  );

  const closeChooser = useCallback(() => {
    setChooserPost(null);
  }, []);

  const openDmShare = useCallback(() => {
    if (!chooserPost) return;
    setDmPost(chooserPost);
    setChooserPost(null);
  }, [chooserPost]);

  const openRepost = useCallback(() => {
    if (!chooserPost) return;
    setRepostPost(chooserPost);
    setChooserPost(null);
  }, [chooserPost]);

  const canRepost =
    !!chooserPost && (!currentUserId || chooserPost.userId !== currentUserId);

  const modals = (
    <>
      <Modal
        visible={!!chooserPost}
        transparent
        animationType="slide"
        onRequestClose={closeChooser}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={closeChooser} />
          <SafeModalSheet className="gap-2">
            <Text className="mb-1 text-base font-semibold text-text-light dark:text-text-dark">
              Share post
            </Text>
            <TouchableOpacity
              onPress={openDmShare}
              activeOpacity={0.75}
              className="rounded-2xl px-4 py-3 bg-surface-muted-light dark:bg-surface-muted-dark"
            >
              <Text className="font-semibold text-text-light dark:text-text-dark">
                Send via message
              </Text>
            </TouchableOpacity>
            {canRepost ? (
              <TouchableOpacity
                onPress={openRepost}
                activeOpacity={0.75}
                className="rounded-2xl px-4 py-3 bg-surface-muted-light dark:bg-surface-muted-dark"
              >
                <Text className="font-semibold text-text-light dark:text-text-dark">
                  Repost
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={closeChooser}
              activeOpacity={0.75}
              className="mt-1 rounded-2xl px-4 py-3"
            >
              <Text className="text-center font-semibold text-title-light dark:text-title-dark">
                Cancel
              </Text>
            </TouchableOpacity>
          </SafeModalSheet>
        </View>
      </Modal>
      <SharePostModal
        visible={!!dmPost}
        post={dmPost}
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
