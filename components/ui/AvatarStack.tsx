import { Image, View } from 'react-native';
import { Text } from './Text';

interface AvatarStackProps {
  avatars: string[];
  maxDisplay?: number;
  size?: number;
  label?: string;
}

export function AvatarStack({ 
  avatars, 
  maxDisplay = 3, 
  size = 20,
  label 
}: AvatarStackProps) {
  const displayAvatars = avatars.slice(0, maxDisplay);
  
  return (
    <View className="flex-row items-center">
      <View className="flex-row">
        {displayAvatars.map((avatar, index) => (
          <Image
            key={index}
            source={{ uri: avatar }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: index > 0 ? -8 : 0,
              borderWidth: 2,
              borderColor: 'white',
            }}
          />
        ))}
      </View>
      {label && (
        <Text variant="muted" className="ml-2 text-xs">
          {label}
        </Text>
      )}
    </View>
  );
}