import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/containers/ScreenContainer";
import { CallIcon, SearchIcon } from "@/components/shared/icons/Icons";
import { SearchBarInput } from "@/components/shared/ui/search-bar";
import { Avatar, BackHeader } from "@/components/ui";
import { Text } from "@/components/ui/Text";
import { PublicUserDto, RelationshipStatusDto } from "@/dtos";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getFollowActionState } from "@/services/follow-contract";
import { FollowApi } from "@/services/follow.service";
import { userService } from "@/services/user.service";
import { colors } from "@/styles/colors";

export default function AddFriendScreen() {
  const isDark = useColorScheme() === "dark";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundUser, setFoundUser] = useState<PublicUserDto | null>(null);
  const [relationship, setRelationship] =
    useState<RelationshipStatusDto | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  const theme = {
    background: isDark ? colors.dark.background : colors.light.background,
    surface: isDark ? colors.dark.surface : colors.light.surface,
    text: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
    textMuted: isDark ? colors.dark.textMuted : colors.light.textMuted,
    primary: colors.primary.light,
    border: isDark ? colors.dark.border : colors.light.border,
  };

  const handleSearchByPhone = async () => {
    if (!phoneNumber.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    setLoading(true);
    setError("");
    setFoundUser(null);
    setRelationship(null);

    try {
      const user = await userService.getUserByPhone(phoneNumber.trim());
      setFoundUser(user);
      try {
        const nextRelationship = await FollowApi.getRelationshipStatus(user.id);
        setRelationship(nextRelationship);
      } catch {
        setRelationship(null);
      }
    } catch {
      setError("Không tìm thấy người dùng với số điện thoại này");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (foundUser) {
      router.push(`/profile/${foundUser.id}` as any);
    }
  };

  const handleAddFriend = async () => {
    if (!foundUser || sendingRequest) return;
    setSendingRequest(true);
    try {
      const action = getFollowActionState(relationship);
      if (action.action === "unfollow") {
        await FollowApi.unfollow(foundUser.id);
      } else if (action.action === "cancel_request") {
        await FollowApi.cancelRequest(foundUser.id);
      } else {
        await FollowApi.sendFollowRequest(foundUser.id);
      }
      const nextRelationship = await FollowApi.getRelationshipStatus(foundUser.id);
      setRelationship(nextRelationship);
    } catch (err: unknown) {
      console.error("[follow] add-friend send request failed", err);
    } finally {
      setSendingRequest(false);
    }
  };

  const followAction = getFollowActionState(relationship);

  return (
    <ScreenContainer className="gap-4">
      <BackHeader title="Add Friend" />

      <SearchBarInput
        placeholder="Enter phone number"
        value={phoneNumber}
        onChangeText={(text) => {
          setPhoneNumber(text);
          setError("");
        }}
        keyboardType="phone-pad"
        returnKeyType="search"
        onSubmitEditing={handleSearchByPhone}
        rightElement={
          <TouchableOpacity
            onPress={handleSearchByPhone}
            disabled={loading}
            className="ml-2"
            accessibilityRole="button"
            accessibilityLabel="Search by phone number"
          >
            <CallIcon size={24} color={theme.primary} />
          </TouchableOpacity>
        }
      />

      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {error && !loading && (
        <View className="px-4 py-8">
          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
              }}
            >
              <Ionicons name="person-outline" size={32} color={theme.textMuted} />
            </View>
            <Text className="text-base font-medium mb-1" style={{ color: theme.text }}>
              Không tìm thấy
            </Text>
            <Text variant="muted" className="text-sm text-center">
              {error}
            </Text>
          </View>
        </View>
      )}

      {foundUser && !loading && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            className="flex-row items-center py-4 px-4 rounded-2xl"
            style={{ backgroundColor: theme.surface }}
            onPress={handleViewProfile}
            activeOpacity={0.7}
          >
            <Avatar
              source={foundUser.avatar ? { uri: foundUser.avatar } : undefined}
              fallback={foundUser.name?.charAt(0) || "?"}
              size="xl"
            />
            <View className="flex-1 ml-3 mr-2">
              <Text className="text-base font-semibold" style={{ color: theme.text }}>
                {foundUser.name || "Người dùng"}
              </Text>
              {foundUser.bio ? (
                <Text variant="muted" className="text-sm mt-1" numberOfLines={2}>
                  {foundUser.bio}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 py-3 rounded-full items-center"
            style={{
              backgroundColor:
                followAction.action === "follow" ? theme.primary : theme.textMuted,
              opacity: sendingRequest ? 0.6 : 1,
            }}
            onPress={handleAddFriend}
            disabled={sendingRequest}
          >
            {sendingRequest ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                {followAction.label}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {!foundUser && !loading && !error && (
        <View className="flex-1 justify-center items-center px-8">
          <View className="items-center">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: isDark ? colors.dark.surface : colors.light.surface,
              }}
            >
              <SearchIcon size={40} color={theme.textMuted} />
            </View>
            <Text variant="muted" className="text-center">
              Nhập số điện thoại để tìm kiếm bạn bè
            </Text>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
