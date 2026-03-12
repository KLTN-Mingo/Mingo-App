import React from 'react';
import { View } from 'react-native';

import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';

export function PostCardSkeleton() {
  return (
    <View className="bg-surface-light dark:bg-surface-dark p-4">
      {/* Header */}
      <View className="flex-row items-center">
        <SkeletonCircle size={44} />
        <View className="ml-3 flex-1 gap-1">
          <SkeletonText width={140} height={16} />
          <SkeletonText width={80} height={12} />
        </View>
        <SkeletonCircle size={24} />
      </View>

      {/* Content */}
      <View className="mt-3 gap-2">
        <SkeletonText width="100%" height={14} />
        <SkeletonText width="90%" height={14} />
        <SkeletonText width="60%" height={14} />
      </View>

      {/* Image */}
      <View className="mt-3">
        <Skeleton width="100%" height={200} borderRadius={12} />
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border-light dark:border-border-dark">
        <View className="flex-row items-center gap-2">
          <SkeletonCircle size={24} />
          <SkeletonText width={30} height={14} />
        </View>
        <View className="flex-row items-center gap-2">
          <SkeletonCircle size={24} />
          <SkeletonText width={30} height={14} />
        </View>
        <SkeletonCircle size={24} />
      </View>
    </View>
  );
}

export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i}>
          <PostCardSkeleton />
          {i < count - 1 && (
            <View className="h-2 bg-background-light dark:bg-background-dark" />
          )}
        </View>
      ))}
    </View>
  );
}
