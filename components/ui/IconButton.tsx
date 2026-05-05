import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  className?: string;
  iconClassName?: string;
  size?: number;
  loading?: boolean;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  className = '',
  iconClassName = '',
  loading = false,
  disabled = false,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      className={twMerge(
        `items-center justify-center ${className}`,
        disabled || loading ? 'opacity-50' : ''
      )}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#768D85" />
      ) : (
        <View className={iconClassName}>{icon}</View>
      )}
    </TouchableOpacity>
  );
}
