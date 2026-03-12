import React from 'react';
import { Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ProfileSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <SkeletonText width={120} height={24} />
        <SkeletonCircle size={28} />
      </View>

      {/* Background Image */}
      <Skeleton width={SCREEN_WIDTH} height={180} borderRadius={0} />

      {/* Avatar */}
      <View className="px-4 -mt-12">
        <View className="border-4 border-background-light dark:border-background-dark rounded-full w-24 h-24">
          <SkeletonCircle size={88} />
        </View>
      </View>

      {/* Profile Info */}
      <View className="px-4 mt-4">
        {/* Name */}
        <SkeletonText width={180} height={28} />
        
        {/* Bio */}
        <View className="mt-3 gap-2">
          <SkeletonText width="100%" height={14} />
          <SkeletonText width="70%" height={14} />
        </View>

        {/* Stats */}
        <View className="flex-row items-center gap-8 mt-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="items-center gap-1">
              <SkeletonText width={40} height={20} />
              <SkeletonText width={60} height={14} />
            </View>
          ))}
        </View>

        {/* Edit Profile Button */}
        <View className="mt-4">
          <Skeleton width="100%" height={40} borderRadius={8} />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mt-4 border-b border-border-light dark:border-border-dark">
        {[1, 2, 3].map((i) => (
          <View key={i} className="flex-1 items-center py-3 gap-1">
            <SkeletonCircle size={24} />
            <SkeletonText width={40} height={12} />
          </View>
        ))}
      </View>

      {/* Grid Content */}
      <View className="flex-row flex-wrap mt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={{ width: '33.33%', aspectRatio: 1 }} className="p-0.5">
            <Skeleton width="100%" height="100%" borderRadius={0} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
