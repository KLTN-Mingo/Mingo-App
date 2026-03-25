import React from "react";
import { TextInput, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { colors } from "@/styles/colors";

const MyTextArea = ({ value, onChangeText, placeholder }) => {
  const { colorScheme } = useTheme();

  return (
    <View className="mb-4 h-32 w-full">
      <TextInput
        className="rounded-lg p-2 h-full w-full font-mmedium bg-[#2D2F2F]"
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#515E5A"
        style={{
          textAlign: "left",
          color: colors.dark[100],
        }}
        textAlignVertical="top" // Để căn chỉnh văn bản từ trên
      />
    </View>
  );
};

export default MyTextArea;
