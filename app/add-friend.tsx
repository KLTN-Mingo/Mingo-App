import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui';
import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { userService } from '@/services/user.service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/styles/colors';
import { PublicUserDto } from '@/dtos';
import { SearchIcon } from '@/components/shared/icons/Icons';
import Svg, { Path } from 'react-native-svg';

const BackIcon = ({ size = 24, color = 'currentColor' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      fill={color}
    />
  </Svg>
);

const PhoneIcon = ({ size = 20, color = 'currentColor' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill={color}
    />
  </Svg>
);

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
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);
    setError('');
    setFoundUser(null);

    try {
      const user = await userService.getUserByPhone(phoneNumber.trim());
      setFoundUser(user);
    } catch (err) {
      setError('Không tìm thấy người dùng với số điện thoại này');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = () => {
    if (foundUser) {
      // TODO: Call API to send friend request
      console.log('Send friend request to:', foundUser.id);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackIcon size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Thêm bạn mới
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark
                ? colors.dark[200]
                : colors.light[200],
            },
          ]}
        >
          <View style={styles.searchIconContainer}>
            <SearchIcon size={20} color={theme.textMuted} />
          </View>
          <RNTextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Nhập số điện thoại"
            placeholderTextColor={theme.textMuted}
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setError('');
            }}
            keyboardType="phone-pad"
          />
          <IconButton
            icon={<PhoneIcon size={20} color={theme.primary} />}
            onPress={handleSearchByPhone}
            className={styles.phoneButton}
            disabled={loading}
          />
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Error Message */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
        </View>
      )}

      {/* Found User */}
      {foundUser && !loading && (
        <ScrollView
          style={styles.resultContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultContent}
        >
          <View style={styles.userCard}>
            <Avatar
              source={foundUser.avatar ? { uri: foundUser.avatar } : undefined}
              fallback={foundUser.name?.charAt(0) || '?'}
              size="xl"
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {foundUser.name || 'Người dùng'}
              </Text>
              {foundUser.bio && (
                <Text
                  style={[styles.userBio, { color: theme.textMuted }]}
                  numberOfLines={2}
                >
                  {foundUser.bio}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={handleAddFriend}
            >
              <Text style={styles.addButtonText}>Kết bạn</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Empty State */}
      {!foundUser && !loading && !error && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Nhập số điện thoại để tìm kiếm bạn bè
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  phoneButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultContent: {
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
