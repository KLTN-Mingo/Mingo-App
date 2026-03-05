import { Text as RNText, type TextProps } from 'react-native';

type TextVariant = 'default' | 'title' | 'subtitle' | 'semibold' | 'link' | 'muted' | 'small';

interface CustomTextProps extends TextProps {
  variant?: TextVariant;
  className?: string;
}

const variantClasses: Record<TextVariant, string> = {
  default: 'text-base leading-6 text-text-light dark:text-text-dark font-regular',
  title: 'text-3xl font-bold leading-8 text-text-light dark:text-text-dark',
  subtitle: 'text-xl font-bold text-text-light dark:text-text-dark',
  semibold: 'text-base leading-6 font-semibold text-text-light dark:text-text-dark',
  link: 'text-base leading-8 text-primary-400 underline',
  muted: 'text-sm text-text-muted-light dark:text-text-muted-dark',
  small: 'text-xs text-text-light dark:text-text-dark',
};

export function Text({ variant = 'default', className = '', ...props }: CustomTextProps) {
  return (
    <RNText 
      className={`${variantClasses[variant]} ${className}`} 
      {...props} 
    />
  );
}