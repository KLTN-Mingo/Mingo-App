import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';
import { PostListSkeleton } from './PostCardSkeleton';

export function HomeSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <SkeletonText width={100} height={28} />
        <View className="flex-row gap-3">
          <SkeletonCircle size={28} />
          <SkeletonCircle size={28} />
        </View>
      </View>

      {/* Stories */}
      <View className="px-4 py-2">
        <View className="flex-row gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} className="items-center gap-1">
              <SkeletonCircle size={64} />
              <SkeletonText width={50} height={10} />
            </View>
          ))}
        </View>
      </View>

      {/* Create Post */}
      <View className="flex-row items-center px-4 py-3 bg-surface-light dark:bg-surface-dark mb-2">
        <SkeletonCircle size={40} />
        <View className="flex-1 ml-3">
          <Skeleton width="100%" height={40} borderRadius={20} />
        </View>
      </View>

      {/* Posts */}
      <PostListSkeleton count={2} />
    </SafeAreaView>
  );
}
