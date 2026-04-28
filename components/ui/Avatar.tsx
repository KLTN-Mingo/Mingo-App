import { Image, ImageProps, View } from 'react-native';
import { Text } from './Text';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: ImageProps['source'];
  fallback?: string;
  size?: AvatarSize;
  className?: string;
  online?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-20 h-20',
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-2xl',
};

export function Avatar({ source, fallback, size = 'md', className = '', online }: AvatarProps) {
  return (
    <View className="relative">
      {source ? (
        <Image
          source={source}
          className={`rounded-full ${sizeClasses[size]} ${className}`}
        />
      ) : (
        <View
          className={`rounded-full bg-primary items-center justify-center ${sizeClasses[size]} ${className}`}
        >
          <Text
            className={`font-bold text-white ${textSizeClasses[size]}`}
          >
            {fallback?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      )}
      {online && (
        <View className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-online border-2 border-background-light dark:border-background-dark" />
      )}
    </View>
  );
}
