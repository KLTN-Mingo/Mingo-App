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
        // Main color palette từ #768D85
        primary: {
          50: "#f3f6f5",
          100: "#e7edeb",
          200: "#c3d2cd",
          300: "#9fb7af",
          400: "#768D85", // Main color
          500: "#5a7770",
          600: "#476059",
          700: "#3a4d48",
          800: "#313f3b",
          900: "#2b3633",
          950: "#161d1b",
        },
        // Background colors
        background: {
          light: "#FFFFFF",
          dark: "#121212",
        },
        // Surface colors (cards, modals)
        surface: {
          light: "#F5F5F5",
          dark: "#1E1E1E",
        },
        // Text colors
        text: {
          light: "#1A1A1A",
          dark: "#FAFAFA",
          muted: {
            light: "#6B7280",
            dark: "#9CA3AF",
          },
        },
        // Border colors
        border: {
          light: "#E5E7EB",
          dark: "#374151",
        },
        // Status colors
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