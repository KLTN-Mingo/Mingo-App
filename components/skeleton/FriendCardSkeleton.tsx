import React from 'react';
import { View } from 'react-native';

import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';

export function FriendRequestSkeleton() {
  return (
    <View className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl">
      <View className="flex-row items-center">
        <SkeletonCircle size={60} />
        <View className="ml-3 flex-1 gap-1">
          <SkeletonText width={120} height={16} />
          <SkeletonText width={80} height={12} />
        </View>
      </View>

      {/* Buttons */}
      <View className="flex-row gap-2 mt-3">
        <View className="flex-1">
          <Skeleton width="100%" height={36} borderRadius={8} />
        </View>
        <View className="flex-1">
          <Skeleton width="100%" height={36} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

export function FriendCardSkeleton() {
  return (
    <View className="flex-row items-center p-3 border-b border-border-light dark:border-border-dark">
      <SkeletonCircle size={50} />
      <View className="ml-3 flex-1 gap-1">
        <SkeletonText width={140} height={16} />
        <SkeletonText width={100} height={12} />
      </View>
      <Skeleton width={80} height={32} borderRadius={16} />
    </View>
  );
}

export function FriendListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <FriendCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function FriendRequestListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <FriendRequestSkeleton key={i} />
      ))}
    </View>
  );
}
