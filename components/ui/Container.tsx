import { View, type ViewProps } from 'react-native';

interface ContainerProps extends ViewProps {
  className?: string;
}

export function Container({ className = '', ...props }: ContainerProps) {
  return (
    <View 
      className={`bg-background-light dark:bg-background-dark ${className}`} 
      {...props} 
    />
  );
}