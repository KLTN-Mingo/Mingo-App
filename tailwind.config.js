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
          50: "#768D85",
          100: "#768D85",
          200: "#768D85",
          300: "#768D85",
          400: "#768D85",
          500: "#768D85",
          600: "#768D85",
          700: "#768D85",
          800: "#768D85",
          900: "#768D85",
          /** Chữ trên nền primary */
          foreground: {
            light: "#FFFFFF",
            dark: "#EFE7DF",
          },
        },
        background: {
          light: "#FFFFFF",
          dark: "#1E2021",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#2D2F2F",
        },
        "surface-muted": {
          light: "#F2F2F2",
          dark: "#252525",
        },
        /** Nền block: trắng (light) / #252525 (dark) */
        sheet: {
          light: "#FFFFFF",
          dark: "#252525",
        },
        /** Nền component: #F1F4F3 (light) / #2D2F2F (dark) */
        component: {
          light: "#F1F4F3",
          dark: "#2D2F2F",
        },
        input: {
          light: "#FFFFFF",
          dark: "#2D2F2F",
        },
        text: {
          light: "#1E2021",
          dark: "#EFE7DF",
          muted: {
            light: "#515E5A",
            dark: "#515E5A",
          },
        },
        border: {
          light: "#CCCCCC",
          dark: "#CCCCCC",
        },
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
      borderColor: {
        "pill-light": "#CCCCCC",
        "pill-dark": "#CCCCCC",
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
        /** Logo / brand — @expo-google-fonts/jost */
        jost: ["Jost_600SemiBold"],
        "jost-bold": ["Jost_700Bold"],
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
