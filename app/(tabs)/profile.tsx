import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommentModal } from "@/components/post/CommentModal";
import { PostCard } from "@/components/post/PostCard";
import { ProfileBioEditModal } from "@/components/profile/ProfileBioEditModal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileSettingsModal } from "@/components/profile/ProfileSettingsModal";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import {
  ImageIcon,
  MovieIcon,
  PostIcon,
  VideoIcon,
} from "@/components/shared/icons/Icons";
import { EmptyStateScreen } from "@/components/shared/ui/empty-state-screen";
import { ProfileSkeleton } from "@/components/skeleton";
import { Button, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { PostResponseDto, UserMinimalDto, UserProfileDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { postService } from "@/services/post.service";
import { userService } from "@/services/user.service";
import { colors, getSemantic, getStatusColor } from "@/styles/colors";
import { authUserFromProfile } from "@/utils/authUserFromProfile";
import { pickProfileImage } from "@/utils/profileMediaPicker";

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
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bioSaving, setBioSaving] = useState(false);
  const [uploadAvatarBusy, setUploadAvatarBusy] = useState(false);
  const [uploadBackgroundBusy, setUploadBackgroundBusy] = useState(false);

  const fetchData = useCallback(async () => {
    setProfileError(null);
    try {
      const userData = await userService.getCurrentUser();
      setUserProfile(userData);

      try {
        const userPosts = await postService.fetchAllUserPosts(userData.id);
        setPosts(userPosts);
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

  const handleEditAvatar = async () => {
    if (!userProfile || uploadAvatarBusy) return;
    const asset = await pickProfileImage({ aspect: [1, 1] });
    if (!asset) return;
    setUploadAvatarBusy(true);
    try {
      const updated = await userService.uploadAvatar({
        uri: asset.uri,
        fileName: asset.fileName ?? `avatar_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      setProfile(authUserFromProfile(updated));
      setUserProfile(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không tải được ảnh";
      Alert.alert("Lỗi", msg);
    } finally {
      setUploadAvatarBusy(false);
    }
  };

  const handleEditBackground = async () => {
    if (!userProfile || uploadBackgroundBusy) return;
    const asset = await pickProfileImage({ aspect: [16, 9] });
    if (!asset) return;
    setUploadBackgroundBusy(true);
    try {
      const updated = await userService.uploadBackground({
        uri: asset.uri,
        fileName: asset.fileName ?? `cover_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      setProfile(authUserFromProfile(updated));
      setUserProfile(updated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không tải được ảnh";
      Alert.alert("Lỗi", msg);
    } finally {
      setUploadBackgroundBusy(false);
    }
  };

  const handleEditBio = () => {
    if (!userProfile) return;
    setBioDraft(userProfile.bio ?? "");
    setBioModalVisible(true);
  };

  const handleSaveBio = async () => {
    if (!userProfile || bioSaving) return;
    const trimmed = bioDraft.trim();
    if (trimmed.length > 500) {
      Alert.alert("Lỗi", "Giới thiệu tối đa 500 ký tự.");
      return;
    }
    setBioSaving(true);
    try {
      const updated = await userService.updateProfile({ bio: trimmed });
      setProfile(authUserFromProfile(updated));
      setUserProfile(updated);
      setBioModalVisible(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không lưu được";
      Alert.alert("Lỗi", msg);
    } finally {
      setBioSaving(false);
    }
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
          <View className="flex-1 gap-4">
            { posts.map((post) => (
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
          ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <PostIcon size={48} color={semantic.placeholder} />
            <Text variant="muted" className="mt-4">
              No posts yet
            </Text>
          </View>
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
          <View className="items-center justify-center py-20">
            <ImageIcon size={48} color={semantic.placeholder} />
            <Text variant="muted" className="mt-4">
              No photos yet
            </Text>
          </View>
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
      }

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
      <EmptyStateScreen
        title="Không tải được thông tin"
        subtitle={
          profileError || "Không thể tải hồ sơ của bạn. Vui lòng thử lại."
        }
        actions={[
          { label: "Thử lại", onPress: handleRetry, variant: "primary" },
          { label: "Đăng nhập lại", onPress: handleGoToLogin, variant: "ghost" },
        ]}
      />
    );
  }

  const handleRetryFromBanner = () => {
    setProfileError(null);
    setLoading(true);
    fetchData();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark px-5 py-8"
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
        className="gap-6"
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        {/* Error banner */}
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

        {/* Tên và menu */}
        <View className="flex-row items-center justify-between">
          <Text
            className="text-7 text-text-light dark:text-text-dark font-bold flex-1 mr-2"
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

        {/* Avatar và background */}
        <View className="relative">
          {(uploadAvatarBusy || uploadBackgroundBusy) && (
            <View className="absolute inset-0 z-10 rounded-3xl bg-black/25 items-center justify-center pointer-events-none">
              <ActivityIndicator size="large" color={colors.light[400]} />
            </View>
          )}
          <ProfileHeader
            user={userProfile}
            onEditBackground={handleEditBackground}
            onEditAvatar={handleEditAvatar}
            onEditBio={handleEditBio}
          />
        </View>

        {/* Thông tin cá nhân */}
        <ProfileInfo user={userProfile} />

        {/* Button chỉnh sửa hồ sơ */}
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

        {/* Tab chứa post, ảnh, video */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFriendPress={() => router.push("/(tabs)/friend" as any)}
        />

        <View className="min-h-[200px] px-2">{renderTabContent()}</View>
      </ScrollView>

      {/* Modal chỉnh sửa hồ sơ */}
      <ProfileSettingsModal
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
        onEditProfile={() => {
          setSettingsVisible(false);
          handleEditProfile();
        }}
        onOpenSavedPosts={() => {
          setSettingsVisible(false);
          router.push("/saved-posts" as any);
        }}
        onOpenAccountSettings={() => {
          setSettingsVisible(false);
        }}
        themeToggleLabel={
          themeColorScheme === "dark"
            ? "Switch to Light"
            : "Switch to Dark"
        }
        onToggleTheme={toggleColorScheme}
        logoutIconColor={errorColor}
        onLogout={() => {
          setSettingsVisible(false);
          handleLogout();
        }}
      />

      {/* Modal chỉnh sửa bio */}
      <ProfileBioEditModal
        visible={bioModalVisible}
        value={bioDraft}
        onChangeText={setBioDraft}
        saving={bioSaving}
        onRequestClose={() => {
          if (!bioSaving) setBioModalVisible(false);
        }}
        onCancel={() => {
          if (!bioSaving) setBioModalVisible(false);
        }}
        onSave={handleSaveBio}
      />

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
