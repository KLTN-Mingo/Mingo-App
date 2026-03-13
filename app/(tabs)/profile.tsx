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

import { PostCard } from "@/components/post/PostCard";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileSkeleton } from "@/components/skeleton";
import { Icon, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { PostResponseDto, UserProfileDto } from "@/dtos";
import { postService } from "@/services/post.service";
import { userService } from "@/services/user.service";

type TabKey = "posts" | "photos" | "videos";

export default function ProfileScreen() {
  const { profile, setProfile, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setProfileError(null);
    try {
      const userData = await userService.getCurrentUser();
      setUserProfile(userData);

      try {
        const postsData = await postService.getAllPosts();
        const userPosts = postsData.filter((p) => p.userId === userData.id);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
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
            />
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Icon name="doc.text" size={48} color="#9CA3AF" />
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
            <Icon name="photo" size={48} color="#9CA3AF" />
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
                    <Icon name="play.fill" size={20} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <Icon name="video" size={48} color="#9CA3AF" />
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
        <Icon name="exclamationmark.triangle" size={48} color="#EF4444" />
        <Text className="mt-4 text-center">
          {profileError || "Không tải được thông tin cá nhân"}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          className="mt-4 bg-primary-400 px-6 py-3 rounded-xl w-48 items-center"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoToLogin}
          className="mt-3 px-6 py-3"
        >
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
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={["top"]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#768D85"]}
            tintColor="#768D85"
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
            <Text className="text-primary-400 font-semibold text-sm">Thử lại</Text>
          </TouchableOpacity>
        )}
        {/* Header with name and settings */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text variant="title" className="text-xl">
            {userProfile.name || "Profile"}
          </Text>
          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            className="p-2"
          >
            <Icon name="gear" size={24} color="#768D85" />
          </TouchableOpacity>
        </View>

        {/* Profile Header (Background + Avatar) */}
        <ProfileHeader
          user={userProfile}
          onEditBackground={() => console.log("Edit background")}
          onEditAvatar={() => console.log("Edit avatar")}
        />

        {/* Profile Info */}
        <ProfileInfo
          user={userProfile}
          onEditBio={() => console.log("Edit bio")}
        />

        {/* Edit Profile Button */}
        <View className="px-4 mt-4">
          <TouchableOpacity
            onPress={handleEditProfile}
            className="bg-surface-light dark:bg-surface-dark py-2.5 rounded-lg items-center border border-border-light dark:border-border-dark"
          >
            <Text className="font-semibold">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <View className="min-h-[200px]">{renderTabContent()}</View>
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
              <Icon name="pencil" size={22} color="#768D85" />
              <Text className="ml-3">Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSettingsVisible(false);
                // Navigate to settings
              }}
              className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
            >
              <Icon name="gear" size={22} color="#768D85" />
              <Text className="ml-3">Account Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSettingsVisible(false);
                handleLogout();
              }}
              className="flex-row items-center px-4 py-4 border-b border-border-light dark:border-border-dark"
            >
              <Icon
                name="rectangle.portrait.and.arrow.right"
                size={22}
                color="#EF4444"
              />
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
    </SafeAreaView>
  );
}
