import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { CommentModal } from "@/components/post/CommentModal";
import { PostCard } from "@/components/post/PostCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileRepostsList } from "@/components/profile/ProfileRepostsList";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { VideoIcon } from "@/components/shared/icons/Icons";
import { EmptyStateScreen } from "@/components/shared/ui/empty-state-screen";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { ProfileSkeleton } from "@/components/skeleton";
import { BackHeader, Button, Icon, Text } from "@/components/ui";
import { paletteIcon } from "@/constants/designTokens";
import { useAuth } from "@/context/AuthContext";
import {
  CloseFriendStatus,
  FollowStatus,
  PostResponseDto,
  PublicUserDto,
  RelationshipStatusDto,
  ReportEntityType,
  UserMinimalDto,
  UserProfileDto,
} from "@/dtos";
import { getFollowActionState } from "@/services/follow-contract";
import {
  frontendCacheKeys,
  subscribeCacheInvalidation,
} from "@/services/frontend-cache";
import { useReport } from "@/hooks/use-report";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSharePost } from "@/hooks/use-share-post";
import { FollowApi } from "@/services/follow.service";
import { messageService } from "@/services/message.service";
import { postService } from "@/services/post.service";
import { userService } from "@/services/user.service";
import { colors } from "@/styles/colors";

type TabKey = "posts" | "photos" | "videos" | "reposts";

type RelationshipViewState =
  | "friend"
  | "close_friend"
  | "stranger"
  | "follower"
  | "following"
  | "pending";

function getRelationshipViewState(
  relationship: RelationshipStatusDto | null
): RelationshipViewState {
  if (relationship?.isCloseFriend) return "close_friend";
  if (relationship?.isFriend) return "friend";
  if (relationship?.followerStatus === FollowStatus.PENDING) return "follower";
  if (relationship?.followStatus === FollowStatus.PENDING) return "pending";
  if (relationship?.isFollowing) return "following";
  return "stranger";
}

function getRelationshipBadge(state: RelationshipViewState): {
  label: string;
  backgroundColor: string;
  color: string;
} {
  switch (state) {
    case "close_friend":
      return {
        label: "Close friend",
        backgroundColor: "#FEF3C7",
        color: "#92400E",
      };
    case "friend":
      return {
        label: "Friend",
        backgroundColor: "#E8EDEB",
        color: "#475852",
      };
    case "follower":
      return {
        label: "Follower",
        backgroundColor: "#DBEAFE",
        color: "#1D4ED8",
      };
    case "following":
      return {
        label: "Following",
        backgroundColor: "#ECFDF5",
        color: "#047857",
      };
    case "pending":
      return {
        label: "Request sent",
        backgroundColor: "#F3F4F6",
        color: "#4B5563",
      };
    case "stranger":
    default:
      return {
        label: "Not connected",
        backgroundColor: "#FEE2E2",
        color: "#B91C1C",
      };
  }
}

export default function UserProfileDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { profile: me } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState(false);
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [relationship, setRelationship] = useState<RelationshipStatusDto | null>(null);
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const isMine = useMemo(() => !!id && !!me?.id && id === me.id, [id, me?.id]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [rawUser, rel] = await Promise.all([
        isMine ? userService.getCurrentUser() : userService.getUserById(id),
        isMine ? Promise.resolve(null) : FollowApi.getRelationshipStatus(id),
      ]);
      setUser(
        isMine
          ? (rawUser as UserProfileDto)
          : userService.mapPublicUserToProfileView(rawUser as PublicUserDto)
      );
      setRelationship(rel as RelationshipStatusDto | null);

      try {
        const userPosts = await postService.fetchAllUserPosts(id);
        setPosts(userPosts);
      } catch (postError) {
        console.warn("[profile] cannot load posts:", postError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, isMine]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = [
      subscribeCacheInvalidation(frontendCacheKeys.relationship(id), fetchData),
      subscribeCacheInvalidation(
        frontendCacheKeys.followStats(id),
        fetchData
      ),
      ...(me?.id
        ? [
            subscribeCacheInvalidation(
              frontendCacheKeys.followStats(me.id),
              fetchData
            ),
            subscribeCacheInvalidation(
              frontendCacheKeys.pendingFollowRequests,
              fetchData
            ),
            subscribeCacheInvalidation(
              frontendCacheKeys.sentFollowRequests,
              fetchData
            ),
            subscribeCacheInvalidation(
              frontendCacheKeys.pendingCloseFriendRequests,
              fetchData
            ),
            subscribeCacheInvalidation(
              frontendCacheKeys.closeFriends,
              fetchData
            ),
          ]
        : []),
    ];

    return () => {
      unsubscribe.forEach((dispose) => dispose());
    };
  }, [fetchData, id, me?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const userMinimal: UserMinimalDto | null = me
    ? {
        id: me.id,
        name: me.name,
        avatar: me.avatar,
        verified: me.verified,
      }
    : null;

  const share = useSharePost({
    currentUserId: me?.id,
    onShared: ({ postId, sentCount }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, sharesCount: p.sharesCount + sentCount } : p
        )
      );
    },
    onReposted: ({ postId }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p
        )
      );
    },
  });

  const handleFollowAction = async () => {
    if (!id || isMine || acting) return;
    setActing(true);
    try {
      const followAction = getFollowActionState(relationship);

      if (followAction.action === "unfollow") {
        await FollowApi.unfollow(id);
      } else if (followAction.action === "cancel_request") {
        await FollowApi.cancelRequest(id);
      } else {
        await FollowApi.sendFollowRequest(id);
      }
      await fetchData();
    } finally {
      setActing(false);
    }
  };

  const handleCloseFriendAction = async () => {
    if (!id || isMine || acting) return;
    setActing(true);
    try {
      if (relationship?.closeFriendStatus === CloseFriendStatus.ACCEPTED) {
        await FollowApi.removeCloseFriend(id);
      } else if (relationship?.closeFriendStatus === CloseFriendStatus.PENDING) {
        Alert.alert(
          "Close friends",
          "Close friend request is pending."
        );
        return;
      } else if (!relationship?.isFriend) {
        Alert.alert(
          "Close friends",
          "You can add close friends only after both people follow each other."
        );
      } else {
        await FollowApi.sendCloseFriendRequest(id);
      }
      await fetchData();
    } finally {
      setActing(false);
    }
  };

  const handleIncomingFollowResponse = async (accept: boolean) => {
    if (!id || acting) return;

    setActing(true);
    try {
      const pending = await FollowApi.getPendingRequests();
      const request = pending.requests.find(
        (item) =>
          item.user.id === id && item.status === FollowStatus.PENDING
      );

      if (!request) {
        await fetchData();
        return;
      }

      await FollowApi.respondToRequest(request.id, accept);
      await fetchData();
    } finally {
      setActing(false);
    }
  };

  const handleMessageUser = async () => {
    if (!id || isMine || acting) return;
    setActing(true);
    try {
      const { boxId } = await messageService.getOrCreateDirectBox(id);
      router.push(`/chat/${boxId}` as never);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Cannot open chat";
      Alert.alert("Error", msg);
    } finally {
      setActing(false);
    }
  };

  const handleUnfriendUser = () => {
    if (!id || isMine || acting) return;
    Alert.alert("Unfriend this user?", "This will remove the friendship.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unfriend",
        style: "destructive",
        onPress: async () => {
          setActing(true);
          try {
            await FollowApi.unfollow(id);
            await fetchData();
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Cannot unfriend";
            Alert.alert("Error", msg);
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const handleBlockUser = () => {
    if (!id || isMine) return;
    Alert.alert(
      "Block this user?",
      "They will not be able to view your profile or interact with you according to the app policy.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              await FollowApi.blockUser(id);
              router.back();
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : "Cannot block";
              Alert.alert("Error", msg);
            }
          },
        },
      ]
    );
  };

  const report = useReport();

  const handleReportUser = () => {
    if (!id || isMine) return;
    report.openReport({
      entityType: ReportEntityType.USER,
      entityId: id,
      entityLabel: user?.name ?? "this user",
    });
  };

  const handleUserMenuPress = () => {
    if (!id || isMine) return;
    const relationState = getRelationshipViewState(relationship);
    const canUnfriend =
      relationState === "friend" || relationState === "close_friend";
    Alert.alert(user?.name ?? "User", undefined, [
      ...(canUnfriend
        ? [
            {
              text: "Unfriend",
              style: "destructive" as const,
              onPress: handleUnfriendUser,
            },
          ]
        : []),
      {
        text: "Report user",
        style: "destructive",
        onPress: handleReportUser,
      },
      {
        text: "Block user",
        style: "destructive",
        onPress: handleBlockUser,
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/edit-profile" as never);
  };

  const handleUserPress = (userId: string) => {
    if (userId === id) return;
    router.push(`/profile/${userId}` as never);
  };

  const handlePostMorePress = (post: PostResponseDto) => {
    if (!me || post.userId !== me.id) return;
    Alert.alert("Your post", undefined, [
      {
        text: "Edit",
        onPress: () =>
          router.push({ pathname: "/create-post", params: { id: post.id } } as never),
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
                  await postService.deletePost(post.id);
                  setPosts((prev) => prev.filter((p) => p.id !== post.id));
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
  };

  const followActionState = getFollowActionState(relationship);
  const relationshipViewState = getRelationshipViewState(relationship);
  const relationshipBadge = getRelationshipBadge(relationshipViewState);
  const closeFriendLabel =
    relationship?.closeFriendStatus === CloseFriendStatus.ACCEPTED
      ? "Close friends"
      : relationship?.closeFriendStatus === CloseFriendStatus.PENDING
        ? "Close friend pending"
        : "Add close friend";

  if (loading) return <ProfileSkeleton />;
  if (!user) {
    return (
      <EmptyStateScreen
        title="Profile not found"
        subtitle="This user may not exist or has been removed."
        actions={[
          {
            label: "Go back",
            onPress: () => router.back(),
            variant: "primary",
          },
        ]}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return posts.length > 0 ? (
          <View className="flex-1 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={userMinimal}
                onLikeChange={(postId, isLiked) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === postId
                        ? {
                            ...p,
                            isLiked,
                            likesCount: isLiked
                              ? p.likesCount + 1
                              : p.likesCount - 1,
                          }
                        : p
                    )
                  );
                }}
                onCommentPress={(postId) => setCommentPostId(postId)}
                onSharePress={share.openSheet}
                onSaveChange={(postId, isSaved, savesCount) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === postId ? { ...p, isSaved, savesCount } : p
                    )
                  );
                }}
                onUserPress={handleUserPress}
                onMorePress={isMine ? handlePostMorePress : undefined}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No posts yet" />
        );

      case "photos": {
        const photos = posts
          .flatMap((p) => p.media || [])
          .filter((m) => m.mediaType === "image");

        return photos.length > 0 ? (
          <View className="flex-row flex-wrap">
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={photo.id || index}
                style={{ width: "33.33%", aspectRatio: 1 }}
                className="p-0.5"
              >
                <Image
                  source={{ uri: photo.mediaUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState title="No photos yet" />
        );
      }

      case "videos": {
        const videos = posts
          .flatMap((p) => p.media || [])
          .filter((m) => m.mediaType === "video");

        return videos.length > 0 ? (
          <View className="flex-row flex-wrap">
            {videos.map((video, index) => (
              <TouchableOpacity
                key={video.id || index}
                style={{ width: "33.33%", aspectRatio: 1 }}
                className="p-0.5 relative"
              >
                <Image
                  source={{ uri: video.thumbnailUrl || video.mediaUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <View className="bg-black/50 rounded-full p-2">
                    <VideoIcon size={20} color={paletteIcon.light} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState title="No videos yet" />
        );
      }

      case "reposts":
        return (
          <ProfileRepostsList
            userId={user.id}
            profileUser={{
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              verified: user.verified,
            }}
            currentUser={userMinimal}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ScreenContainer horizontalPadding="none" className="gap-6">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.light]}
            tintColor={colors.primary.light}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}
      >
        {/* Header */}
        <BackHeader
          title={user.name || "Profile"}
          rightSlot={
            !isMine ? (
              <TouchableOpacity
                onPress={handleUserMenuPress}
                activeOpacity={0.75}
                className="p-2 -mr-2"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="User options"
              >
                <Icon name="ellipsis" size={22} color={paletteIcon[colorScheme]} />
              </TouchableOpacity>
            ) : null
          }
        />

        {/* Avatar + cover */}
        <ProfileHeader user={user} isOwnProfile={isMine} />

        {/* Bio + info */}
        <ProfileInfo user={user} isOwnProfile={isMine} />

        {/* Action buttons */}
        {isMine ? (
          <Button
            variant="outline"
            size="lg"
            onPress={handleEditProfile}
            className="rounded-full py-3.5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            Edit profile
          </Button>
        ) : (
          <View className="gap-2">
            <View className="flex-row items-center">
              <View
                className="rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: relationshipBadge.backgroundColor,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: relationshipBadge.color }}
                >
                  {relationshipBadge.label}
                </Text>
              </View>
            </View>

            {relationshipViewState === "friend" ? (
              <View className="flex-row gap-2">
                <Button
                  variant="outline"
                  onPress={handleCloseFriendAction}
                  disabled={
                    acting ||
                    relationship?.closeFriendStatus === CloseFriendStatus.PENDING
                  }
                  className="flex-1"
                >
                  {closeFriendLabel}
                </Button>
                <Button
                  variant="primary"
                  onPress={handleMessageUser}
                  disabled={acting}
                  className="flex-1"
                >
                  Message
                </Button>
              </View>
            ) : null}

            {relationshipViewState === "close_friend" ? (
              <Button
                variant="primary"
                onPress={handleMessageUser}
                disabled={acting}
              >
                Message
              </Button>
            ) : null}

            {relationshipViewState === "stranger" ? (
              <View className="flex-row gap-2">
                <Button
                  variant="primary"
                  onPress={handleFollowAction}
                  disabled={acting}
                  className="flex-1"
                >
                  Follow
                </Button>
                <Button
                  variant="outline"
                  onPress={handleBlockUser}
                  disabled={acting}
                  className="flex-1"
                >
                  Block
                </Button>
              </View>
            ) : null}

            {relationshipViewState === "follower" ? (
              <Button
                variant="primary"
                onPress={() => handleIncomingFollowResponse(true)}
                disabled={acting}
              >
                Accept
              </Button>
            ) : null}

            {relationshipViewState === "following" ? (
              <Button
                variant="outline"
                onPress={handleFollowAction}
                disabled={acting}
              >
                Unfollow
              </Button>
            ) : null}

            {relationshipViewState === "pending" ? (
              <Button
                variant="outline"
                onPress={handleFollowAction}
                disabled={acting}
              >
                {followActionState.label}
              </Button>
            ) : null}
          </View>
        )}

        {/* Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFriendPress={() => router.push("/(tabs)/friend" as never)}
        />

        <View className="min-h-[200px]">{renderTabContent()}</View>
      </ScrollView>

      <CommentModal
        postId={commentPostId}
        onClose={() => setCommentPostId(null)}
        onCommentCountChange={(postId, delta) => {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, commentsCount: Math.max(0, p.commentsCount + delta) }
                : p
            )
          );
        }}
      />

      {share.modals}
      {report.modal}
    </ScreenContainer>
  );
}
