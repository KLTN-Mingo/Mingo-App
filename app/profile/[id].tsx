import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileSkeleton } from "@/components/skeleton";
import { EmptyStateScreen } from "@/components/shared/ui/empty-state-screen";
import { Button, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  CloseFriendStatus,
  PublicUserDto,
  RelationshipStatusDto,
  UserProfileDto,
} from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FollowApi } from "@/services/follow.service";
import { userService } from "@/services/user.service";
import { getSemantic } from "@/styles/colors";

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
      "Chặn người này?",
      "Họ sẽ không thể xem hồ sơ hoặc tương tác với bạn theo chính sách ứng dụng.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chặn",
          style: "destructive",
          onPress: async () => {
            try {
              await FollowApi.blockUser(id);
              router.back();
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : "Không chặn được";
              Alert.alert("Lỗi", msg);
            }
          },
        },
      ]
    );
  };

  const followLabel = relationship?.isFollowing ? "Bỏ theo dõi" : "Theo dõi";
  const closeFriendLabel =
    relationship?.closeFriendStatus === CloseFriendStatus.ACCEPTED
      ? "Gỡ bạn thân"
      : "Thêm bạn thân";

  if (loading) return <ProfileSkeleton />;
  if (!user) {
    return (
      <EmptyStateScreen
        title="Không tìm thấy hồ sơ"
        subtitle="Người dùng này có thể không tồn tại hoặc đã bị gỡ."
        actions={[
          {
            label: "Quay lại",
            onPress: () => router.back(),
            variant: "primary",
          },
        ]}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={["top"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center px-4 pt-2 pb-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={semantic.text} />
          </TouchableOpacity>
          <Text
            className="text-[22px] text-neutral-900 dark:text-neutral-100 font-montserrat-bold flex-1 ml-1"
            numberOfLines={1}
          >
            {user.name || "Profile"}
          </Text>
        </View>

        <ProfileHeader user={user} isOwnProfile={false} />
        <ProfileInfo user={user} isOwnProfile={false} />

        {!isMine && (
          <View className="px-4 mt-4 gap-2">
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
              Chặn người dùng
            </Button>
          </View>
        )}

        {relationship && (
          <TouchableOpacity className="mx-4 mt-3 p-3 rounded-lg bg-surface-muted-light dark:bg-surface-muted-dark">
            <Text variant="muted">
              Relationship: {relationship.relationshipType}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
