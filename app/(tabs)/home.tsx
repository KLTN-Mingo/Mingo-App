import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreatePostButton } from '@/components/post/CreatePostButton';
import { PostCard } from '@/components/post/PostCard';
import { Icon, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { PostResponseDto, UserMinimalDto } from '@/dtos';
import { postService } from '@/services/post.service';

export default function HomeScreen() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert profile to UserMinimalDto for components
  const userMinimal: UserMinimalDto | null = profile
    ? {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        verified: profile.verified,
      }
    : null;

  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLikeChange = (postId: string, isLiked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked,
              likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
            }
          : p
      )
    );
  };

  const handleCommentPress = (postId: string) => {
    router.push(`/post/${postId}` as any);
  };  

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };

  const handleCreatePost = () => {
    router.push('/create-post' as any);
  };

  const handleSearch = () => {
    router.push('/search' as any);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#768D85" />
        <Text variant="muted" className="mt-4">
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-4">
        <Icon name="exclamationmark.triangle" size={48} color="#EF4444" />
        <Text className="mt-4 text-center">{error}</Text>
        <TouchableOpacity
          onPress={fetchPosts}
          className="mt-4 bg-primary-400 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={['top']}
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-2xl font-semibold">
                Min<Text className="text-primary-400 font-bold">gle</Text>
              </Text>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={handleSearch} className="p-2">
                  <Icon name="magnifyingglass" size={24} color="#768D85" />
                </TouchableOpacity>
                {/* <Link href="/(tabs)/message" asChild>
                  <TouchableOpacity className="p-2">
                    <Icon name="bubble.left.and.bubble.right" size={24} color="#768D85" />
                  </TouchableOpacity>
                </Link> */}
              </View>
            </View>

            {/* Create Post Button */}
            <CreatePostButton user={userMinimal} onPress={handleCreatePost} />

            {/* Divider */}
            <View className="h-2 bg-surface-light dark:bg-surface-dark" />
          </>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLikeChange={handleLikeChange}
            onCommentPress={handleCommentPress}
            onUserPress={handleUserPress}
          />
        )}
        ItemSeparatorComponent={() => (
          <View className="h-2 bg-surface-light dark:bg-surface-dark" />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#768D85']}
            tintColor="#768D85"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="doc.text" size={48} color="#9CA3AF" />
            <Text variant="muted" className="mt-4">
              No posts yet
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}