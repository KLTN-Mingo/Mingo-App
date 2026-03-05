import { View } from 'react-native';

interface DividerProps {
  className?: string;
}

export function Divider({ className = '' }: DividerProps) {
  return (
    <View className={`h-px bg-border-light dark:bg-border-dark my-4 ${className}`} />
  );
}