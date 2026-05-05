import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import { colors } from '@/styles/colors';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const SF_TO_MATERIAL: Record<string, MaterialIconName> = {
  // Navigation
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
  
  // User & Profile
  'person.fill': 'person',
  'person.2': 'people',
  'person.badge.plus': 'person-add',
  'person.fill.badge.plus': 'person-add',
  'person.fill.checkmark': 'how-to-reg',
  
  // Settings & Actions
  'gear': 'settings',
  'bell.fill': 'notifications',
  'bell': 'notifications-none',
  'magnifyingglass': 'search',
  'trash.fill': 'delete',
  'trash': 'delete-outline',
  'pencil': 'edit',
  'checkmark.circle': 'check-circle',
  'checkmark.seal.fill': 'verified',
  
  // Media
  'camera.fill': 'camera-alt',
  'photo.fill': 'photo',
  'photo': 'photo-library',
  'video': 'videocam',
  'play.fill': 'play-arrow',
  'music.note': 'music-note',
  'doc.text': 'description',
  
  // Social
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'star.fill': 'star',
  'star': 'star-border',
  'bubble.left.fill': 'chat-bubble',
  'bubble.left': 'chat-bubble-outline',
  'bubble.left.and.bubble.right': 'forum',
  
  // Arrows & Sharing
  'arrowshape.turn.up.right.fill': 'share',
  'arrowshape.turn.up.left.fill': 'reply',
  'ellipsis': 'more-horiz',
  'rectangle.portrait.and.arrow.right': 'logout',
  
  // Grid & Layout
  'square.grid.2x2': 'grid-view',
  
  // Misc
  'at': 'alternate-email',
  'envelope.fill': 'email',
  'location': 'location-on',
  'exclamationmark.triangle': 'warning',
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
  color = colors.primary[100], 
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