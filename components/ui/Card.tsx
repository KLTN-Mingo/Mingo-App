import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <View
      className={`p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}