import React from "react";
import { TextInput, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { colors } from "@/styles/colors";

const MyTextArea = ({ value, onChangeText, placeholder }) => {
  const { colorScheme } = useTheme();

  return (
    <View className="mb-4 h-32 w-full">
      <TextInput
        className="rounded-lg p-2 h-full w-full font-mmedium"
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF" // Màu sắc cho placeholder (tùy chọn)
        style={{
          textAlign: "left",
          color: colorScheme === "dark" ? colors.dark[100] : colors.light[500],
        }} // Căn trái cho placeholder
        textAlignVertical="top" // Để căn chỉnh văn bản từ trên
      />
    </View>
  );
};

export default MyTextArea;
