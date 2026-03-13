import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/styles/colors";
import { useTheme } from "@/context/ThemeContext";

interface HobbySelectorProps {
  hobbies: string[];
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
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}
      className="mt-2"
    >
      {hobbies.map((hobby) => {
        const isSelected = selectedHobbies.includes(hobby);
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
              paddingHorizontal: 16,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: isSelected
                  ? "#ffffff"
                  : colorScheme === "dark"
                    ? colors.dark[100]
                    : colors.light[100],
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
