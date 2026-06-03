import React from "react";
import { useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { paletteDark, paletteLight } from "@/constants/designTokens";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/Skeleton";

export function ProfileSkeleton() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? paletteDark : paletteLight;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
        <SkeletonText width={160} height={26} />
        <SkeletonCircle size={28} />
      </View>

      <View className="px-4 pt-1">
        <Skeleton width="100%" height={192} borderRadius={24} />
        <View className="flex-row items-end -mt-[52px]">
          <View className="rounded-full overflow-hidden" style={{ borderWidth: 5, borderColor: colors.background }}>
            <SkeletonCircle size={96} />
          </View>
          <View className="flex-1 ml-3 mb-2 gap-2">
            <SkeletonText width={100} height={14} />
            <SkeletonText width={180} height={22} />
          </View>
        </View>
        <View className="mt-5 gap-2">
          <SkeletonText width="100%" height={14} />
          <SkeletonText width="88%" height={14} />
        </View>
      </View>

      <View className="mt-6 px-4">
        <View className="flex-row justify-between px-2 pb-5">
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-1 items-center gap-1">
              <SkeletonText width={28} height={20} />
              <SkeletonText width={52} height={12} />
            </View>
          ))}
        </View>
        <View className="rounded-3xl px-3 py-2" style={{ backgroundColor: colors.background }}>
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-row items-center py-3.5">
              <SkeletonCircle size={22} />
              <View className="flex-1 ml-3">
                <SkeletonText width="70%" height={16} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="px-4 mt-5">
        <Skeleton width="100%" height={50} borderRadius={999} />
      </View>

      <View className="flex-row mt-5 px-1">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="flex-1 items-center py-3 gap-1">
            <SkeletonCircle size={22} />
            <SkeletonText width={40} height={11} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
