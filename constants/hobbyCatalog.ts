import type { ComponentType } from "react";

import {
  BikeIcon,
  BookIcon,
  CameraIcon,
  ChefIcon,
  ChessIcon,
  CodeIcon,
  CraftingIcon,
  DanceIcon,
  FishingIcon,
  FlowerIcon,
  GameIcon,
  MicroIcon,
  MovieIcon,
  MusicIcon,
  PaletteIcon,
  PlaneIcon,
  RunIcon,
  SoccerIcon,
  SwimIcon,
  YogaIcon,
} from "@/components/shared/icons/Icons";

export type HobbyIconProps = { size?: number; color?: string };
export type HobbyIconComponent = ComponentType<HobbyIconProps>;

/** Danh sách cố định — chỉ các sở thích này được lưu / hiển thị. */
export const hobbyIcons: Record<string, HobbyIconComponent> = {
  Soccer: SoccerIcon,
  Swimming: SwimIcon,
  Running: RunIcon,
  Reading: BookIcon,
  Gaming: GameIcon,
  Cooking: ChefIcon,
  Traveling: PlaneIcon,
  Programming: CodeIcon,
  Photography: CameraIcon,
  Painting: PaletteIcon,
  Dancing: DanceIcon,
  Yoga: YogaIcon,
  Cycling: BikeIcon,
  Fishing: FishingIcon,
  Gardening: FlowerIcon,
  Crafting: CraftingIcon,
  "Watching Movies": MovieIcon,
  "Listening to Music": MusicIcon,
  "Playing Chess": ChessIcon,
  Singing: MicroIcon,
  
};

export const PRESET_HOBBIES: readonly string[] = Object.keys(hobbyIcons);

export const PRESET_HOBBY_SET = new Set(PRESET_HOBBIES);

/** Chuỗi từ BE → khóa chuẩn trong `hobbyIcons` (không phân biệt hoa thường). */
export function matchPresetHobby(saved: string): string | null {
  const t = saved.trim();
  if (Object.prototype.hasOwnProperty.call(hobbyIcons, t)) return t;
  const found = PRESET_HOBBIES.find(
    (k) => k.toLowerCase() === t.toLowerCase()
  );
  return found ?? null;
}

export function resolveHobbyIcon(label: string): HobbyIconComponent | null {
  const key = matchPresetHobby(label);
  return key ? hobbyIcons[key]! : null;
}
