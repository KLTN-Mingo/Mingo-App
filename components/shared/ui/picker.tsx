import React from "react";
import { View, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@/context/ThemeContext";
import { colors } from "@/styles/colors";

interface PickerOption {
  label: string;
  value: string;
}

interface CustomPickerProps {
  value: string;
  setValue: (val: string) => void;
  items: PickerOption[];
  placeholder?: string;
  height?: number;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  value,
  setValue,
  items,
  placeholder = "Select",
  height = 56,
}) => {
  const { colorScheme } = useTheme();
  const bgColor = colorScheme === "dark" ? colors.dark[500] : colors.light[500];
  const textColor =
    colorScheme === "dark" ? colors.dark[100] : colors.light[100];

  return (
    <View
      style={{
        borderRadius: 12,
        padding: 0,
        margin: 0,
        overflow: "hidden",
        backgroundColor: Platform.OS === "android" ? "transparent" : bgColor, // 👈 fix viền trắng Android
      }}
    >
      <Picker
        selectedValue={value}
        onValueChange={setValue}
        dropdownIconColor={textColor}
        mode="dropdown"
        style={{
          height,
          color: textColor,
          backgroundColor: Platform.OS === "android" ? "transparent" : bgColor,
          fontSize: 14,
          fontFamily: "Montserrat-Regular",
          padding: 0,
          margin: 0,
        }}
      >
        <Picker.Item
          label={placeholder}
          value=""
          color={textColor}
          style={{ backgroundColor: bgColor }}
        />
        {items.map((item) => (
          <Picker.Item
            key={item.value}
            label={item.label}
            value={item.value}
            color={textColor}
            style={{ backgroundColor: bgColor }}
          />
        ))}
      </Picker>
    </View>
  );
};

export default CustomPicker;
