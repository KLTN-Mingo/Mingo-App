import { Image, ImageProps, View } from 'react-native';
import { Text } from './Text';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: ImageProps['source'];
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

export function Avatar({ source, fallback, size = 'md', className = '' }: AvatarProps) {
  if (source) {
    return (
      <Image
        source={source}
        className={`rounded-full ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <View
      className={`rounded-full bg-primary-100 items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <Text
        className={`font-bold text-primary-foreground-light dark:text-primary-foreground-dark ${textSizeClasses[size]}`}
      >
        {fallback?.charAt(0).toUpperCase() || '?'}
      </Text>
    </View>
  );
}