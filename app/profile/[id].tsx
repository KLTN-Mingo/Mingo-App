import { Ionicons } from "@expo/vector-icons";
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
import { Button, Text } from "@/components/ui";
import { paletteIcon } from "@/constants/designTokens";
import { useAuth } from "@/context/AuthContext";
import {
  CloseFriendStatus,
  PostResponseDto,
  PublicUserDto,
  RelationshipStatusDto,
  UserMinimalDto,
  UserProfileDto,
} from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSharePost } from "@/hooks/use-share-post";
import { FollowApi } from "@/services/follow.service";
import { postService } from "@/services/post.service";
import { userService } from "@/services/user.service";
import { colors, getSemantic } from "@/styles/colors";

type TabKey = "posts" | "photos" | "videos" | "reposts";

export default function UserProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile: me } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);
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
      if (relationship?.isFollowing) {
        await FollowApi.unfollow(id);
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
      } else {
        await FollowApi.sendCloseFriendRequest(id);
      }
      await fetchData();
    } finally {
      setActing(false);
    }
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

  const followLabel = relationship?.isFollowing ? "Unfollow" : "Follow";
  const closeFriendLabel =
    relationship?.closeFriendStatus === CloseFriendStatus.ACCEPTED
      ? "Remove best friend"
      : "Add best friend";

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
                onSaveChange={(postId, isSaved) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === postId ? { ...p, isSaved } : p
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
          <ProfileRepostsList userId={user.id} currentUser={userMinimal} />
        );

      default:
        return null;
    }
  };

  return (
    <ScreenContainer className="gap-6">
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
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1 -ml-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={semantic.text} />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Montserrat-Bold", fontSize: 18 }}
            className="text-text-light dark:text-text-dark flex-1 ml-2"
            numberOfLines={1}
          >
            {user.name || "Profile"}
          </Text>
        </View>

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
            <View className="flex-row gap-2">
              <Button
                variant={relationship?.isFollowing ? "outline" : "primary"}
                onPress={handleFollowAction}
                disabled={acting}
                className="flex-1"
              >
                {followLabel}
              </Button>
              <Button
                variant="outline"
                onPress={handleCloseFriendAction}
                disabled={acting}
                className="flex-1"
              >
                {closeFriendLabel}
              </Button>
            </View>
            <Button variant="outline" onPress={handleBlockUser} disabled={acting}>
              Block user
            </Button>
            {relationship ? (
              <View className="p-3 rounded-lg bg-surface-muted-light dark:bg-surface-muted-dark">
                <Text variant="muted">
                  Relationship: {relationship.relationshipType}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFriendPress={() => router.push("/(tabs)/friend" as never)}
        />

        <View className="min-h-[200px] px-2">{renderTabContent()}</View>
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
    </ScreenContainer>
  );
}
