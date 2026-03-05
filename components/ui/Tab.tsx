import { TouchableOpacity } from 'react-native';
import { Text } from './Text';

interface TabProps {
  content: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: number;
  className?: string;
}

export function Tab({ 
  content, 
  isActive = false, 
  onClick, 
  badge,
  className = '' 
}: TabProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.8}
      className={`px-4 py-2 rounded-full ${
        isActive 
          ? 'bg-primary-400' 
          : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark'
      } ${className}`}
    >
      <Text 
        className={`font-medium ${
          isActive 
            ? 'text-white' 
            : 'text-text-light dark:text-text-dark'
        }`}
      >
        {content}
        {badge !== undefined && badge > 0 && ` (${badge})`}
      </Text>
    </TouchableOpacity>
  );
}