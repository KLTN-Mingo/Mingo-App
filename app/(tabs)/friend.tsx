import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { FriendCard } from '@/components/friend/FriendCard';
import { FriendRequestCard } from '@/components/friend/FriendRequestCard';
import {
  AddIcon,
  FriendIcon,
  SearchIcon,
} from '@/components/shared/icons/Icons';
import { FriendListSkeleton, FriendRequestListSkeleton } from '@/components/skeleton';
import { ActionInput, Button, Tab, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  CloseFriendDto,
  FollowerDto,
  FollowingDto,
  FollowRequestDto,
  FollowStatsDto,
  FriendDto,
  CloseFriendRequestDto,
} from '@/dtos';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FollowApi } from '@/services/follow.service';
import { colors, getSemantic } from '@/styles/colors';

type TabType =
  | 'requests'
  | 'sent'
  | 'closeRequests'
  | 'friends'
  | 'bestfriends'
  | 'followers'
  | 'following';

const TABS: { key: TabType; label: string }[] = [
  { key: 'requests', label: 'Requests' },
  { key: 'sent', label: 'Sent' },
  { key: 'closeRequests', label: 'Close requests' },
  { key: 'friends', label: 'Friends' },
  { key: 'bestfriends', label: 'Best friends' },
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
];

export default function FriendScreen() {
  const isDark = useColorScheme() === "dark";

  const theme = {
    icon: isDark ? colors.dark[100] : colors.light[100],
    iconMuted: isDark ? colors.dark[300] : colors.light[300],
  };

  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const semantic = getSemantic(colorScheme);
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states - using DTOs
  const [requests, setRequests] = useState<FollowRequestDto[]>([]);
  const [sentRequests, setSentRequests] = useState<FollowRequestDto[]>([]);
  const [closeFriendRequests, setCloseFriendRequests] = useState<CloseFriendRequestDto[]>([]);
  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [closeFriends, setCloseFriends] = useState<CloseFriendDto[]>([]);
  const [followers, setFollowers] = useState<FollowerDto[]>([]);
  const [following, setFollowing] = useState<FollowingDto[]>([]);
  const [stats, setStats] = useState<FollowStatsDto | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'requests':
          const reqData = await FollowApi.getPendingRequests();
          setRequests(reqData.requests);
          break;
        case 'friends':
          const friendsData = await FollowApi.getFriends(profile.id);
          setFriends(friendsData.friends);
          break;
        case 'sent':
          const sentData = await FollowApi.getSentRequests();
          setSentRequests(sentData.requests);
          break;
        case 'closeRequests':
          if (FollowApi.getPendingCloseFriendRequests) {
            const closeReqData = await FollowApi.getPendingCloseFriendRequests();
            setCloseFriendRequests(closeReqData.requests);
          }
          break;
        case 'bestfriends':
          const bffData = await FollowApi.getCloseFriends(profile.id);
          setCloseFriends(bffData.closeFriends);
          break;
        case 'followers':
          const followersData = await FollowApi.getFollowers(profile.id);
          setFollowers(followersData.followers);
          break;
        case 'following':
          const followingData = await FollowApi.getFollowing(profile.id);
          setFollowing(followingData.following);
          break;
      }

      // Always fetch stats
      const statsData = await FollowApi.getStats(profile.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Handle accept/decline request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await FollowApi.respondToRequest(requestId, true);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await FollowApi.respondToRequest(requestId, false);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    if (loading && !refreshing) {
      if (activeTab === 'requests') {
        return <FriendRequestListSkeleton count={3} />;
      }
      return <FriendListSkeleton count={5} />;
    }

    switch (activeTab) {
      case 'requests':
        return renderRequests();
      case 'friends':
        return renderFriends();
      case 'sent':
        return renderSentRequests();
      case 'closeRequests':
        return renderCloseRequests();
      case 'bestfriends':
        return renderCloseFriends();
      case 'followers':
        return renderFollowers();
      case 'following':
        return renderFollowing();
      default:
        return null;
    }
  };

  const renderRequests = () => {
    if (requests.length === 0) {
      return renderEmptyState('No pending requests');
    }

    return (
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendRequestCard
            id={item.id}
            user={item.user}
            mutualCount={5} // Replace with actual data
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderFriends = () => {
    if (friends.length === 0) {
      return renderEmptyState('No friends yet');
    }

    return (
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            user={item.user}
            isCloseFriend={item.isCloseFriend}
            onPress={() => {/* Navigate to profile */}}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const handleCancelRequest = async (targetUserId: string) => {
    try {
      if (!FollowApi.cancelRequest) return;
      await FollowApi.cancelRequest(targetUserId);
      setSentRequests((prev) => prev.filter((r) => r.user.id !== targetUserId));
    } catch (error) {
      console.error("Error canceling request:", error);
    }
  };

  const renderSentRequests = () => {
    if (sentRequests.length === 0) {
      return renderEmptyState("No sent requests");
    }

    return (
      <FlatList
        data={sentRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between px-4 py-4 bg-surface-muted-light dark:bg-surface-muted-dark rounded-[10px] mb-3">
            <Text className="flex-1 mr-3">
              {item.user.name || "Unknown"}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleCancelRequest(item.user.id)}
            >
              Cancel
            </Button>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const handleCloseFriendResponse = async (requestId: string, accept: boolean) => {
    try {
      if (!FollowApi.respondCloseFriendRequest) return;
      await FollowApi.respondCloseFriendRequest(requestId, accept);
      setCloseFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
      fetchData();
    } catch (error) {
      console.error("Error responding close friend request:", error);
    }
  };

  const renderCloseRequests = () => {
    if (closeFriendRequests.length === 0) {
      return renderEmptyState("No close-friend requests");
    }

    return (
      <FlatList
        data={closeFriendRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendRequestCard
            id={item.id}
            user={item.user}
            onAccept={(id) => handleCloseFriendResponse(id, true)}
            onDecline={(id) => handleCloseFriendResponse(id, false)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderCloseFriends = () => {
    if (closeFriends.length === 0) {
      return renderEmptyState('No best friends yet');
    }

    return (
      <FlatList
        data={closeFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            user={item.user}
            isCloseFriend={true}
            onPress={() => {/* Navigate to profile */}}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderFollowers = () => {
    if (followers.length === 0) {
      return renderEmptyState('No followers yet');
    }

    return (
      <FlatList
        data={followers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            user={item.follower}
            onPress={() => {/* Navigate to profile */}}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderFollowing = () => {
    if (following.length === 0) {
      return renderEmptyState('Not following anyone');
    }

    return (
      <FlatList
        data={following}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            user={item.following}
            onPress={() => {/* Navigate to profile */}}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderEmptyState = (message: string) => (
    <View className="flex-1 items-center justify-center py-20">
      <FriendIcon size={48} color={semantic.placeholder} />
      <Text variant="muted" className="mt-4">{message}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-10 px-5 pb-5 gap-6">
      {/* Header */}
      <View className="">
        <View className="flex-row justify-between items-center">
          <Text variant="title" className="font-semibold text-6">
            Friends
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => setIsSearchVisible(!isSearchVisible)}
              className=""
            >
              <SearchIcon size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {isSearchVisible && (
          <ActionInput
            surface="component"
            placeholder="Search friends..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="mt-3"
            leftIcon={<SearchIcon size={20} color={semantic.textMuted} />}
          />
        )}
      </View>

      {/* Tabs */}
      <View className="">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.key}
              content={tab.label}
              isActive={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              badge={
                tab.key === 'requests'
                  ? stats?.pendingFollowRequestsCount
                  : tab.key === 'closeRequests'
                    ? stats?.pendingCloseFriendRequestsCount
                    : undefined
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View className="flex-1">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
