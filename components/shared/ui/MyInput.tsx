// import React from "react";
// import { TextInput, View, StyleSheet } from "react-native";
// import { useTheme } from "../../context/ThemeContext"; // Using hook to get colorScheme
// import { colors } from "../../styles/colors";

// const MyInput = ({
//   value,
//   onChangeText,
//   placeholder,
//   secureTextEntry = false,
//   width = "100%",
//   height = 40,
//   borderRadius = 20,
//   borderWidth = 1,
//   borderColor,
//   backgroundColor,
//   color = "black",
//   padding = 10,
//   fontSize = 14,
//   fontWeight,
//   onSubmit,
//   fontFamily,
// }) => {
//   const { colorScheme } = useTheme(); // Get colorScheme from context

//   const styles = StyleSheet.create({
//     inputContainer: {
//       width: width,
//       height: height,
//       backgroundColor:
//         backgroundColor ||
//         (colorScheme === "dark" ? colors.dark[300] : colors.light[700]), // Conditionally set background color
//       borderRadius: borderRadius,
//       borderWidth: borderWidth,
//       borderColor: borderColor || (colorScheme === "dark" ? "#444" : "#ccc"), // Default border color
//       padding: padding,
//     },
//     input: {
//       color: colorScheme === "dark" ? colors.dark[100] : colors.light[500],
//       fontSize: fontSize,
//       fontWeight: fontWeight,
//       fontFamily: fontFamily,
//       flex: 1, // To make TextInput expand to the container height
//     },
//   });

//   return (
//     <View style={styles.inputContainer}>
//       <TextInput
//         className="font-mregular"
//         value={value}
//         onChangeText={onChangeText}
//         placeholder={placeholder}
//         placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
//         secureTextEntry={secureTextEntry}
//         style={styles.input}
//         onSubmitEditing={onSubmit}
//       />
//     </View>
//   );
// };

// export default MyInput;
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
import { useTheme } from "../../../context/ThemeContext";
import { colors } from "../../../styles/colors";

interface MyInputProps extends TextInputProps {
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

const MyInput: React.FC<MyInputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  onSubmitEditing,
  width = "100%",
  height = 40,
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
      justifyContent: "center",
    },
    input: {
      color: colorScheme === "dark" ? colors.dark[100] : colors.light[100],
      fontSize: fontSize ?? 14,
      fontFamily: fontFamily ?? "System",
      flex: 1,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
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

export default MyInput;
