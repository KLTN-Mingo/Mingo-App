import React, { useState } from 'react';
import {
  ActivityIndicator,
  TextInput as RNTextInput,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScreenContainer } from '@/components/containers/ScreenContainer';
import { CallIcon, SearchIcon } from '@/components/shared/icons/Icons';
import { Avatar } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { PublicUserDto } from '@/dtos';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { userService } from '@/services/user.service';
import { colors } from '@/styles/colors';

export default function AddFriendScreen() {
  const isDark = useColorScheme() === 'dark';
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState<PublicUserDto | null>(null);

  const theme = {
    background: isDark ? colors.dark[500] : colors.light[500],
    surface: isDark ? colors.dark[400] : colors.light[500],
    text: isDark ? colors.dark[100] : colors.light[100],
    textMuted: isDark ? colors.dark[300] : colors.light[300],
    primary: colors.primary[100],
  };

  const handleSearchByPhone = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter phone number');
      return;
    }

    setLoading(true);
    setError('');
    setFoundUser(null);

    try {
      const user = await userService.getUserByPhone(phoneNumber.trim());
      setFoundUser(user);
    } catch (err) {
      setError('No user found with this phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = () => {
    if (foundUser) {
      console.log('Send friend request to:', foundUser.id);
    }
  };

  return (
      <ScreenContainer className="gap-4">
        {/* Search Bar */}
        <View
          className={`flex-row items-center rounded-xl px-4 py-3 ${
            isDark ? 'bg-surface-dark' : 'bg-surface-light'
          }`}
        >
          <View className="mr-2">
            <SearchIcon size={20} color={theme.textMuted} />
          </View>
          <RNTextInput
            className="flex-1 text-base"
            style={{ color: theme.text }}
            placeholder="Enter phone number"
            placeholderTextColor={theme.textMuted}
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setError('');
            }}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            onPress={handleSearchByPhone}
            disabled={loading}
            className="ml-2"
          >
            <CallIcon size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}

        {/* Error Message */}
        {error && !loading && (
          <View className="px-4 py-3">
            <Text className="text-red-500 text-center text-sm">{error}</Text>
          </View>
        )}

        {/* Found User */}
        {foundUser && !loading && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center py-4">
              <Avatar
                source={foundUser.avatar ? { uri: foundUser.avatar } : undefined}
                fallback={foundUser.name?.charAt(0) || '?'}
                size="xl"
              />
              <View className="flex-1 ml-3 mr-2">
                <Text className="text-base font-semibold">
                  {foundUser.name || 'User'}
                </Text>
                {foundUser.bio && (
                  <Text variant="muted" className="text-sm mt-1" numberOfLines={2}>
                    {foundUser.bio}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: theme.primary }}
                onPress={handleAddFriend}
              >
                <Text className="text-white text-sm font-medium">Add friend</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Empty State */}
        {!foundUser && !loading && !error && (
          <View className="flex-1 justify-center items-center px-8">
            <Text variant="muted" className="text-center">
              Enter phone number to search for friends
            </Text>
          </View>
        )}
      </ScreenContainer>
  );
}
