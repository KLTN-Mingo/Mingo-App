import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommentModal } from "@/components/post/CommentModal";
import { PostCard } from "@/components/post/PostCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import {
  ImageIcon,
  LogoutIcon,
  MovieIcon,
  PenIcon,
  PostIcon,
  ReportIcon,
  SaveIcon,
  SettingsIcon,
  VideoIcon,
} from "@/components/shared/icons/Icons";
import { ProfileSkeleton } from "@/components/skeleton";
import { Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { PostResponseDto, UserMinimalDto, UserProfileDto } from "@/dtos";
import { postService } from "@/services/post.service";
import { userService } from "@/services/user.service";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, getSemantic, getStatusColor } from "@/styles/colors";
import { useTheme } from "@/context/ThemeContext";

type TabKey = "posts" | "photos" | "videos";

export default function ProfileScreen() {
  const { profile, setProfile, logout } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const semantic = getSemantic(colorScheme);
  const errorColor = getStatusColor(colorScheme, "error");
  const { colorScheme: themeColorScheme, toggleColorScheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setProfileError(null);
    try {
      const userData = await userService.getCurrentUser();
      setUserProfile(userData);

      try {
        const postsData = await postService.getAllPosts(1, 50, {
          userId: userData.id,
        });
        setPosts(
          postService.filterPostsForUser(postsData.posts, userData.id)
        );
      } catch (postError) {
        console.warn("Cannot load posts on profile:", postError);
      }
    } catch (error: any) {
      console.warn("Cannot load profile:", error);

      setProfileError(error?.message || "Không tải được thông tin cá nhân");

      // Fallback: dùng profile từ AuthContext để vẫn hiển thị được.
      if (profile) {
        setUserProfile({
          id: profile.id,
          phoneNumber: profile.phoneNumber,
          name: profile.name,
          avatar: profile.avatar,
          role: profile.role as any,
          verified: profile.verified,
          twoFactorEnabled: false,
          isActive: true,
          isBlocked: false,
          onlineStatus: false,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/edit-profile" as any);
  };

  const userMinimal: UserMinimalDto | null = userProfile
    ? {
        id: userProfile.id,
        name: userProfile.name,
        avatar: userProfile.avatar,
        verified: userProfile.verified,
      }
    : null;

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };

  const handlePostMorePress = (post: PostResponseDto) => {
    if (!userProfile || post.userId !== userProfile.id) return;

    Alert.alert("Bài viết của bạn", undefined, [
      {
        text: "Chỉnh sửa",
        onPress: () =>
          router.push({ pathname: "/create-post", params: { id: post.id } } as any),
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          Alert.alert("Xóa bài viết?", "Hành động này không hoàn tác.", [
            { text: "Hủy", style: "cancel" },
            {
              text: "Xóa",
              style: "destructive",
              onPress: async () => {
                try {
                  await postService.deletePost(post.id);
                  setPosts((prev) => prev.filter((p) => p.id !== post.id));
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Không xóa được";
                  Alert.alert("Lỗi", msg);
                }
              },
            },
          ]);
        },
      },
      { text: "Đóng", style: "cancel" },
    ]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return posts.length > 0 ? (
          posts.map((post) => (
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
              onShareChange={(postId, nextCount) => {
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === postId ? { ...p, sharesCount: nextCount } : p
                  )
                );
              }}
              onSaveChange={(postId, isSaved) => {
                setPosts((prev) =>
                  prev.map((p) => (p.id === postId ? { ...p, isSaved } : p))
                );
              }}
              onUserPress={handleUserPress}
              onMorePress={handlePostMorePress}
            />
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <PostIcon size={48} color={semantic.placeholder} />
            <Text variant="muted" className="mt-4">
              No posts yet
            </Text>
          </View>
        );

      case "photos":
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
          <View className="items-center justify-center py-20">
            <ImageIcon size={48} color={semantic.placeholder} />
            <Text variant="muted" className="mt-4">
              No photos yet
            </Text>
          </View>
        );

      case "videos":
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
                    <VideoIcon size={20} color={colors.light[400]} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <MovieIcon size={48} color={semantic.placeholder} />
            <Text variant="muted" className="mt-4">
              No videos yet
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!userProfile) {
    const handleRetry = () => {
      setLoading(true);
      fetchData();
    };
    const handleGoToLogin = async () => {
      try {
        await logout();
      } catch {
        setProfile(null);
      }
      router.replace("/(auth)/signin" as any);
    };

    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-4">
        <ReportIcon size={48} color={errorColor} />
        <Text className="mt-4 text-center">
          {profileError || "Không tải được thông tin cá nhân"}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          className="mt-4 bg-primary-400 px-6 py-3 rounded-xl w-48 items-center"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGoToLogin} className="mt-3 px-6 py-3">
          <Text className="text-primary-400 font-semibold">Đăng nhập lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleRetryFromBanner = () => {
    setProfileError(null);
    setLoading(true);
    fetchData();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-100 dark:bg-background-dark"
      edges={["top"]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          colors={[colors.primary[100]]}
          tintColor={colors.primary[100]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {profileError && (
          <TouchableOpacity
            onPress={handleRetryFromBanner}
            className="mx-4 mt-2 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-row items-center justify-between"
          >
            <Text className="flex-1 text-amber-800 dark:text-amber-200 text-sm">
              Không tải được thông tin mới nhất. Nhấn để thử lại.
            </Text>
            <Text className="text-primary-400 font-semibold text-sm">
              Thử lại
            </Text>
          </TouchableOpacity>
        )}
        {/* Thanh trên: tên + menu (giống mockup) */}
        <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
          <Text
            className="text-[22px] text-neutral-900 dark:text-neutral-100 font-montserrat-bold flex-1 mr-2"
            numberOfLines={1}
          >
            {userProfile.name || "Profile"}
          </Text>
          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            className="p-2 -mr-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color={semantic.text}
            />
          </TouchableOpacity>
        </View>

        <ProfileHeader
          user={userProfile}
          onEditBackground={handleEditProfile}
          onEditAvatar={handleEditProfile}
          onEditBio={handleEditProfile}
        />

        <ProfileInfo user={userProfile} />

        <View className="px-4 mt-5">
          <TouchableOpacity
            onPress={handleEditProfile}
            className="py-3.5 rounded-full bg-white dark:bg-neutral-800 items-center border border-neutral-200/80 dark:border-neutral-700"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text className="font-semibold text-[15px] text-neutral-800 dark:text-neutral-100">
              Edit profile
            </Text>
          </TouchableOpacity>
        </View>

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFriendPress={() => router.push("/(tabs)/friend" as any)}
        />

        <View className="min-h-[200px] px-2 pb-28">{renderTabContent()}</View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background-light dark:bg-background-dark rounded-t-3xl">
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-border-light dark:bg-border-dark rounded-full" />
            </View>

            <Text variant="subtitle" className="text-center py-2">
              Settings
            </Text>

            <TouchableOpacity
              onPress={() => {
                setSettingsVisible(false);
                handleEditProfile();
              }}
              className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
            >
              <PenIcon size={22} color={colors.primary[100]} />
              <Text className="ml-3">Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSettingsVisible(false);
                router.push("/saved-posts" as any);
              }}
              className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
            >
              <SaveIcon size={22} color={colors.primary[100]} />
              <Text className="ml-3">Đã lưu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSettingsVisible(false);
                // Navigate to settings
              }}
              className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
            >
              <SettingsIcon size={22} color={colors.primary[100]} />
              <Text className="ml-3">Account Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                toggleColorScheme();
              }}
              className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
            >
              <Text className="flex-1 ml-3 font-semibold text-text-dark dark:text-text-light">
                {themeColorScheme === "dark"
                  ? "Switch to Light"
                  : "Switch to Dark"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSettingsVisible(false);
                handleLogout();
              }}
              className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
            >
              <LogoutIcon size={22} color={errorColor} />
              <Text className="ml-3 text-red-500">Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSettingsVisible(false)}
              className="items-center py-4 mb-6"
            >
              <Text variant="muted">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    </SafeAreaView>
  );
}
