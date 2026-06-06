import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScreenContainer } from '@/components/containers/ScreenContainer';
import { CallIcon, SearchIcon } from '@/components/shared/icons/Icons';
import { SearchBarInput } from '@/components/shared/ui/search-bar';
import { Avatar, BackButton } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { PublicUserDto } from '@/dtos';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FollowApi } from '@/services/follow.service';
import { userService } from '@/services/user.service';
import { colors } from '@/styles/colors';

export default function AddFriendScreen() {
  const isDark = useColorScheme() === 'dark';
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState<PublicUserDto | null>(null);

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
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);
    setError('');
    setFoundUser(null);

    try {
      const user = await userService.getUserByPhone(phoneNumber.trim());
      setFoundUser(user);
    } catch {
      setError('Không tìm thấy người dùng với số điện thoại này');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (foundUser) {
      router.push(`/profile/${foundUser.id}` as any);
    }
  };

  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleAddFriend = async () => {
    if (!foundUser || sendingRequest) return;
    setSendingRequest(true);
    try {
      await FollowApi.sendFollowRequest(foundUser.id);
      setRequestSent(true);
      Alert.alert('Thành công', 'Đã gửi yêu cầu kết bạn');
    } catch (err: unknown) {
      console.error('[follow] add-friend send request failed', err);
      Alert.alert(
        'Lỗi',
        err instanceof Error ? err.message : 'Không gửi được yêu cầu'
      );
    } finally {
      setSendingRequest(false);
    }
  };

  return (
      <ScreenContainer className="gap-4">
        <BackButton className="-ml-4" />

        <SearchBarInput
          placeholder="Enter phone number"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            setError('');
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

        {/* Loading */}
        {loading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}

        {/* Error Message */}
        {error && !loading && (
          <View className="px-4 py-8">
            <View className="items-center">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: isDark ? colors.dark.surface : colors.light.surface }}
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

        {/* Found User */}
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
                fallback={foundUser.name?.charAt(0) || '?'}
                size="xl"
              />
              <View className="flex-1 ml-3 mr-2">
                <Text className="text-base font-semibold" style={{ color: theme.text }}>
                  {foundUser.name || 'Người dùng'}
                </Text>
                {foundUser.bio && (
                  <Text variant="muted" className="text-sm mt-1" numberOfLines={2}>
                    {foundUser.bio}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 py-3 rounded-full items-center"
              style={{
                backgroundColor: requestSent ? theme.textMuted : theme.primary,
                opacity: sendingRequest || requestSent ? 0.6 : 1,
              }}
              onPress={handleAddFriend}
              disabled={sendingRequest || requestSent}
            >
              {sendingRequest ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {requestSent ? 'Đã gửi yêu cầu' : 'Kết bạn'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Empty State */}
        {!foundUser && !loading && !error && (
          <View className="flex-1 justify-center items-center px-8">
            <View className="items-center">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: isDark ? colors.dark.surface : colors.light.surface }}
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
