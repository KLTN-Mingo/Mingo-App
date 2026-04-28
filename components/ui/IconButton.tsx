import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { paletteIcon } from '@/styles/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  const colorScheme = useColorScheme() ?? 'light';
  const loadingColor = paletteIcon[colorScheme];

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
        <ActivityIndicator size="small" color={loadingColor} />
      ) : (
        <View className={iconClassName}>{icon}</View>
      )}
    </TouchableOpacity>
  );
}
