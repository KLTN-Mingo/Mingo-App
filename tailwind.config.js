/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary accent từ bảng màu dark mode
        primary: {
          100: "#768D85", // main accent
        },
        // Nền chính của app (toàn màn)
        background: {
          light: "#1E2021", // không dùng light mode nữa nhưng giữ để class cũ không lỗi
          dark: "#1E2021",
        },
        // Nền của card / surface
        surface: {
          light: "#252525",
          dark: "#252525",
        },
        // Màu chữ
        text: {
          light: "#CFBFAD",
          dark: "#CFBFAD",
          muted: {
            light: "#515E5A",
            dark: "#515E5A",
          },
        },
        // Viền
        border: {
          light: "#2D2F2F",
          dark: "#2D2F2F",
        },
        // Status colors giữ nguyên để reuse
        success: {
          light: "#22C55E",
          dark: "#4ADE80",
        },
        warning: {
          light: "#F59E0B",
          dark: "#FBBF24",
        },
        error: {
          light: "#EF4444",
          dark: "#F87171",
        },
        info: {
          light: "#3B82F6",
          dark: "#60A5FA",
        },
      },
      fontFamily: {
        sans: ["Montserrat-Regular"],
        thin: ["Montserrat-Thin"],
        light: ["Montserrat-Light"],
        regular: ["Montserrat-Regular"],
        medium: ["Montserrat-Medium"],
        semibold: ["Montserrat-SemiBold"],
        bold: ["Montserrat-Bold"],
        extrabold: ["Montserrat-ExtraBold"],
        black: ["Montserrat-Black"],
        josefin: ["JosefinSans-SemiBold"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [],
};