import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { paletteDark, paletteLight, paletteIcon, palettePrimary } from "@/constants/designTokens";
import { resolveHobbyIcon } from "@/constants/hobbyCatalog";
import { useTheme } from "@/context/ThemeContext";

interface HobbySelectorProps {
  hobbies: readonly string[];
  selectedHobbies: string[];
  onToggle: (hobby: string) => void;
}

const HobbySelector: React.FC<HobbySelectorProps> = ({
  hobbies,
  selectedHobbies,
  onToggle,
}) => {
  const { colorScheme } = useTheme();

  return (
    <View className="mt-2 flex-row flex-wrap" style={{ marginBottom: 4 }}>
      {hobbies.map((hobby) => {
        const isSelected = selectedHobbies.includes(hobby);
        const Icon = resolveHobbyIcon(hobby);
        if (!Icon) return null;
        const iconColor = isSelected ? "#FFFFFF" : paletteIcon[colorScheme];
        const selectedBg = colorScheme === "dark" ? palettePrimary.dark : palettePrimary.light;
        const unselectedBg = colorScheme === "dark" ? paletteDark.surface : paletteLight.surface;
        const textColor = colorScheme === "dark" ? paletteDark.textMuted : paletteLight.textMuted;

        return (
          <TouchableOpacity
            key={hobby}
            onPress={() => onToggle(hobby)}
            style={{
              backgroundColor: isSelected ? selectedBg : unselectedBg,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon size={18} color={iconColor} />
            <Text
              style={{
                color: isSelected ? "#FFFFFF" : textColor,
                fontFamily: "Montserrat-Medium",
                fontSize: 14,
              }}
            >
              {hobby}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default HobbySelector;
