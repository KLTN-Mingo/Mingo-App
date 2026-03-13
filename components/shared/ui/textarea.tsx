import { useTheme } from "@/context/ThemeContext";
import { colors } from "@/styles/colors";
import React from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from "react-native";

interface MyTextareaProps extends TextInputProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  fontSize?: number;
}

const MyTextarea: React.FC<MyTextareaProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  onSubmitEditing,
  width = "100%",
  height = 120, // <-- Cao hơn mặc định
  borderRadius = 12,
  borderWidth = 1,
  borderColor,
  backgroundColor,
  fontFamily,
  containerStyle,
  inputStyle,
  fontSize = 14,
  ...rest
}) => {
  const { colorScheme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width,
      height,
      backgroundColor:
        backgroundColor ??
        (colorScheme === "dark" ? colors.dark[500] : colors.light[500]),
      borderRadius,
      borderWidth,
      borderColor: borderColor ?? "#ccc",
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: "flex-start",
    },
    input: {
      color: colorScheme === "dark" ? colors.dark[100] : colors.light[100],
      fontSize,
      fontFamily: fontFamily ?? "System",
      flex: 1,
      textAlignVertical: "top", // <-- giúp căn dòng từ trên
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
        secureTextEntry={secureTextEntry}
        onSubmitEditing={onSubmitEditing}
        style={[styles.input, inputStyle]}
        {...rest}
      />
    </View>
  );
};

export default MyTextarea;
