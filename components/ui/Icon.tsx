import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const SF_TO_MATERIAL: Record<string, MaterialIconName> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  'xmark': 'close',
  'plus': 'add',
  'minus': 'remove',
  'person.fill': 'person',
  'gear': 'settings',
  'bell.fill': 'notifications',
  'magnifyingglass': 'search',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'star.fill': 'star',
  'star': 'star-border',
  'trash.fill': 'delete',
  'pencil': 'edit',
  'camera.fill': 'camera-alt',
  'photo.fill': 'photo',
};

interface IconProps {
  name: keyof typeof SF_TO_MATERIAL | MaterialIconName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  className?: string;
}

export function Icon({ 
  name, 
  size = 24, 
  color = '#768D85', 
  style,
  className,
}: IconProps) {
  const iconName = SF_TO_MATERIAL[name as string] || (name as MaterialIconName);
  
  return (
    <MaterialIcons 
      name={iconName} 
      size={size} 
      color={color} 
      style={style}
    />
  );
}