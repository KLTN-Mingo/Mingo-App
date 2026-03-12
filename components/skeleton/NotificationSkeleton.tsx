import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';

export function NotificationItemSkeleton() {
  return (
    <View className="flex-row items-start p-4 bg-surface-light dark:bg-surface-dark">
      {/* Avatar */}
      <View className="relative">
        <SkeletonCircle size={48} />
        <View className="absolute -bottom-1 -right-1">
          <SkeletonCircle size={20} />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 ml-3 gap-1.5">
        <SkeletonText width="90%" height={16} />
        <SkeletonText width="60%" height={14} />
        <SkeletonText width={80} height={12} />
      </View>

      {/* Thumbnail */}
      <Skeleton width={48} height={48} borderRadius={8} className="ml-2" />
    </View>
  );
}

export function NotificationListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i}>
          <NotificationItemSkeleton />
          {i < count - 1 && (
            <View className="h-px bg-border-light dark:bg-border-dark" />
          )}
        </View>
      ))}
    </View>
  );
}

export function NotificationScreenSkeleton() {
  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      edges={['top']}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark">
        <SkeletonText width={140} height={28} />
        <View className="flex-row gap-3">
          <SkeletonCircle size={28} />
          <SkeletonCircle size={28} />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-2 gap-2">
        <Skeleton width={60} height={32} borderRadius={16} />
        <Skeleton width={80} height={32} borderRadius={16} />
        <Skeleton width={70} height={32} borderRadius={16} />
      </View>

      {/* Notification List */}
      <NotificationListSkeleton count={8} />
    </SafeAreaView>
  );
}
