import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileSkeleton } from "@/components/skeleton";
import { Button, Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { CloseFriendStatus, RelationshipStatusDto, UserProfileDto, UserRole } from "@/dtos";
import { FollowApi } from "@/services/follow.service";
import { userService } from "@/services/user.service";

export default function UserProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile: me } = useAuth();
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
        userService.getUserById(id),
        isMine ? Promise.resolve(null) : FollowApi.getRelationshipStatus(id),
      ]);
      setUser({
        ...(rawUser as any),
        id: (rawUser as any).id,
        phoneNumber: "",
        role: UserRole.USER,
        twoFactorEnabled: false,
        isActive: true,
        isBlocked: false,
        updatedAt: (rawUser as any).updatedAt ?? new Date().toISOString(),
      });
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

  const followLabel = relationship?.isFollowing ? "Unfollow" : "Follow";
  const closeFriendLabel =
    relationship?.closeFriendStatus === CloseFriendStatus.ACCEPTED
      ? "Remove close friend"
      : "Add close friend";

  if (loading) return <ProfileSkeleton />;
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <Text>Không tìm thấy hồ sơ người dùng</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={["top"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 py-3">
          <Text variant="title" className="text-xl">
            {user.name}
          </Text>
        </View>

        <ProfileHeader user={user} isOwnProfile={false} />
        <ProfileInfo user={user} isOwnProfile={false} />

        {!isMine && (
          <View className="px-4 mt-4 flex-row gap-2">
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
