import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/styles/colors";
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
        const mutedIcon =
          colorScheme === "dark" ? colors.dark[100] : colors.light[100];
        const iconColor = isSelected ? "#FFFFFF" : mutedIcon;

        return (
          <TouchableOpacity
            key={hobby}
            onPress={() => onToggle(hobby)}
            style={{
              backgroundColor: isSelected
                ? colors.primary[100]
                : colorScheme === "dark"
                  ? colors.dark[400]
                  : colors.light[400],
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
                color: isSelected ? "#FFFFFF" : mutedIcon,
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
