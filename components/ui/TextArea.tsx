import { TextInput, TextInputProps, View } from 'react-native';
import { Text } from './Text';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  rows?: number;
  className?: string;
}

export function TextArea({ 
  label, 
  error, 
  rows = 4, 
  className = '', 
  ...props 
}: TextAreaProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="mb-2 font-medium text-text-light dark:text-text-dark">
          {label}
        </Text>
      )}
      <TextInput
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        className={`w-full px-4 py-3 rounded-xl border font-regular text-base
          bg-surface-light dark:bg-surface-dark
          text-text-light dark:text-text-dark
          border-border-light dark:border-border-dark
          min-h-[100px]
          ${error ? 'border-error-light dark:border-error-dark' : ''}
          ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="mt-1 text-sm text-error-light dark:text-error-dark">
          {error}
        </Text>
      )}
    </View>
  );
}