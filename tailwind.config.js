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
        primary: {
          DEFAULT: "#768D85",
          muted: "#BAC6C2",
          50: "#E8EDEB",
          100: "#768D85",
          200: "#9AA9A2",
          300: "#BAC6C2",
          400: "#D4DED9",
          500: "#768D85",
          600: "#5E7069",
          700: "#475852",
          800: "#313F3B",
          900: "#1A2723",
          foreground: {
            light: "#FFFFFF",
            dark: "#FFFFFF",
          },
        },
        background: {
          light: "#FFFFFF",
          dark: "#1E2021",
        },
        surface: {
          light: "#F1F4F3",
          dark: "#252525",
        },
        "surface-light": {
          light: "#FAFAFA",
          dark: "#2D2F2F",
        },
        "surface-muted": {
          light: "#F1F4F3",
          dark: "#252525",
        },
        "surface-elevated": {
          light: "#FFFFFF",
          dark: "#2D2F2F",
        },
        sheet: {
          light: "#FFFFFF",
          dark: "#252525",
        },
        component: {
          light: "#F1F4F3",
          dark: "#252525",
        },
        input: {
          light: "#F1F4F3",
          dark: "#252525",
        },
        text: {
          light: "#1E2021",
          dark: "#FAFAFA",
          secondary: {
            light: "#6B6B6B",
            dark: "#6B6B6B",
          },
          muted: {
            light: "#CCCCCC",
            dark: "#CCCCCC",
          },
        },
        border: {
          light: "#BAC6C2",
          dark: "#2D2F2F",
        },
        "border-subtle": {
          light: "#F1F4F3",
          dark: "#2D2F2F",
        },
        online: {
          light: "#22C55E",
          dark: "#22C55E",
        },
        danger: {
          light: "#EF4444",
          dark: "#FF453A",
        },
      },
      borderColor: {
        pill: {
          light: "#BAC6C2",
          dark: "#2D2F2F",
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
        montserrat: ["Montserrat-Regular"],
        "montserrat-bold": ["Montserrat-Bold"],
        "montserrat-semibold": ["Montserrat-SemiBold"],
        "montserrat-medium": ["Montserrat-Medium"],
        // Short aliases
        mmedium: ["Montserrat-Medium"],
        mregular: ["Montserrat-Regular"],
        msemibold: ["Montserrat-SemiBold"],
        josefin: ["JosefinSans-SemiBold"],
        jost: ["Jost_600SemiBold"],
        "jost-bold": ["Jost_700Bold"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        full: "9999px",
        "4xl": "2rem",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        xxl: "24px",
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [],
};
