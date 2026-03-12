import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FriendCard } from '@/components/friend/FriendCard';
import { FriendRequestCard } from '@/components/friend/FriendRequestCard';
import { FriendListSkeleton, FriendRequestListSkeleton } from '@/components/skeleton';
import { Icon, Input, Tab, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  CloseFriendDto,
  FollowerDto,
  FollowingDto,
  FollowRequestDto,
  FollowStatsDto,
  FriendDto,
} from '@/dtos';
import { FollowApi } from '@/services/follow.service';

type TabType = 'requests' | 'friends' | 'bestfriends' | 'followers' | 'following';

const TABS: { key: TabType; label: string }[] = [
  { key: 'requests', label: 'Requests' },
  { key: 'friends', label: 'Friends' },
  { key: 'bestfriends', label: 'Best friends' },
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
];

export default function FriendScreen() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states - using DTOs
  const [requests, setRequests] = useState<FollowRequestDto[]>([]);
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
      <Icon name="person.2" size={48} color="#9CA3AF" />
      <Text variant="muted" className="mt-4">{message}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="px-4 pb-2">
        <View className="flex-row justify-between items-center">
          <Text variant="title" className="font-bold">
            Friends
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2"
            >
              <Icon name="magnifyingglass" size={24} color="#768D85" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Icon name="plus" size={24} color="#768D85" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {isSearchVisible && (
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="mt-3"
          />
        )}
      </View>

      {/* Tabs */}
      <View className="px-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
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
                  : undefined
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
