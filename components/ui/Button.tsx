import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-400 active:bg-primary-500',
  secondary: 'bg-surface-light dark:bg-surface-dark active:opacity-80',
  outline: 'border-2 border-primary-400 bg-transparent active:bg-primary-50',
  ghost: 'bg-transparent active:bg-surface-light dark:active:bg-surface-dark',
  danger: 'bg-error-light dark:bg-error-dark active:opacity-80',
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-text-light dark:text-text-dark',
  outline: 'text-primary-400',
  ghost: 'text-primary-400',
  danger: 'text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-4 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-2xl',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#768D85' : '#fff'} />
      ) : (
        <Text className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}