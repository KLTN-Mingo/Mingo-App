// MyButton.js
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { colors } from "../../../styles/colors"; // Đảm bảo đường dẫn tới file colors.js chính xác
import { useTheme } from "../../../context/ThemeContext"; // Sử dụng hook để lấy colorScheme
import { useFonts } from "expo-font"; // Import thư viện sử dụng font

const MyButton = ({
  title,
  onPress,
  padding,
  paddingTop,
  backgroundColor = "white",
  paddingBottom,
  color = colors.light[500],
  paddingLeft,
  paddingRight,
  borderRadius = 10,
  borderWidth = 0,
  borderColor, // Màu viền mặc định
  fontSize = 16,
  fontWeight,
  width, // Chiều rộng mặc định
  height = 50, // Chiều cao mặc định
  textAligh = "center",
  fontFamily,
  isShadow = false, // Thêm thuộc tính isShadow
  isActive,
}) => {
  const { colorScheme } = useTheme();
  const textColor = isActive ? "#fff" : color;

  const [fontsLoaded] = useFonts({
    "Montserrat-Black": require("../../assets/fonts/Montserrat-Black.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-ExtraLight": require("../../assets/fonts/Montserrat-ExtraLight.ttf"),
    "Montserrat-Light": require("../../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Thin": require("../../assets/fonts/Montserrat-Thin.ttf"),
    "JosefinSans-SemiBold": require("../../assets/fonts/JosefinSans-SemiBold.ttf"),
  });

  // Kiểm tra xem font có tải xong chưa
  if (!fontsLoaded) {
    return null; // Hoặc có thể hiển thị loading component
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: backgroundColor,
        padding: padding,
        paddingTop: paddingTop, // Padding top
        paddingBottom: paddingBottom, // Padding bottom
        paddingLeft: paddingLeft, // Padding left
        paddingRight: paddingRight, // Padding right
        borderRadius: borderRadius,
        borderWidth: borderWidth,
        borderColor: colorScheme === "dark" ? colors.dark[100] : borderColor,
        alignItems: "center",
        justifyContent: "center",
        width: width || "100%", // Thiết lập chiều rộng
        height: height, // Thiết lập chiều cao
        // Bóng đổ cho cả iOS và Android nếu isShadow là true
        ...(isShadow && {
          // Bóng đổ cho iOS
          shadowColor: "#000", // Màu bóng
          shadowOffset: {
            width: 0,
            height: 2, // Độ cao bóng (chỉ ở dưới)
          },
          shadowOpacity: 0.15, // Độ mờ của bóng
          shadowRadius: 3.5, // Bán kính bóng
          // Bóng đổ cho Android
          elevation: 5, // Độ cao của bóng
        }),
      }}
    >
      <Text
        style={{
          color: colorScheme === "dark" ? colors.dark[100] : textColor,
          fontSize: fontSize,
          fontWeight: fontWeight,
          textAligh: textAligh,
          fontFamily: fontFamily,
        }}
        // className="font-mbold"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default MyButton;
