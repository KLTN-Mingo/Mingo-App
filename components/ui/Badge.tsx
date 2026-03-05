import { View } from 'react-native';
import { Text } from './Text';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary-100 dark:bg-primary-900',
  success: 'bg-green-100 dark:bg-green-900',
  warning: 'bg-yellow-100 dark:bg-yellow-900',
  error: 'bg-red-100 dark:bg-red-900',
  info: 'bg-blue-100 dark:bg-blue-900',
};

const textVariantClasses: Record<BadgeVariant, string> = {
  default: 'text-primary-600 dark:text-primary-300',
  success: 'text-green-600 dark:text-green-300',
  warning: 'text-yellow-600 dark:text-yellow-300',
  error: 'text-red-600 dark:text-red-300',
  info: 'text-blue-600 dark:text-blue-300',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <View className={`px-2 py-1 rounded-full ${variantClasses[variant]} ${className}`}>
      <Text className={`text-xs font-medium ${textVariantClasses[variant]}`}>
        {children}
      </Text>
    </View>
  );
}