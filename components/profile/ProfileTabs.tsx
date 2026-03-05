import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Icon, Text } from '@/components/ui';

type TabKey = 'posts' | 'photos' | 'videos';

interface ProfileTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'posts', label: 'Posts', icon: 'square.grid.2x2' },
  { key: 'photos', label: 'Photos', icon: 'photo' },
  { key: 'videos', label: 'Videos', icon: 'video' },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <View className="flex-row border-b border-border-light dark:border-border-dark mt-4">
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          className={`flex-1 items-center py-3 ${
            activeTab === tab.key
              ? 'border-b-2 border-primary-400'
              : ''
          }`}
        >
          <Icon
            name={tab.icon}
            size={22}
            color={activeTab === tab.key ? '#768D85' : '#9CA3AF'}
          />
          <Text
            className={`text-xs mt-1 ${
              activeTab === tab.key
                ? 'text-primary-400 font-semibold'
                : 'text-text-muted-light dark:text-text-muted-dark'
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}