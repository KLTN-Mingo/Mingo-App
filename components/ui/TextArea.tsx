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
        <Text className="mb-2 font-medium text-text-dark">
          {label}
        </Text>
      )}
      <TextInput
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        className={`w-full px-4 py-3 rounded-xl border font-regular text-base
          bg-[#2D2F2F]
          text-text-dark
          border-border-dark
          min-h-[100px]
          ${error ? 'border-error-dark' : ''}
          ${className}`}
        placeholderTextColor="#515E5A"
        {...props}
      />
      {error && (
        <Text className="mt-1 text-sm text-error-dark">
          {error}
        </Text>
      )}
    </View>
  );
}