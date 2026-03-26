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
          100: "#768D85",
          /** Chữ trên nền primary */
          foreground: {
            light: "#FFFFFF",
            dark: "#CFBFAD",
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
        input: {
          light: "#FFFFFF",
          dark: "#2D2F2F",
        },
        text: {
          light: "#1E2021",
          dark: "#CFBFAD",
          muted: {
            light: "#515E5A",
            dark: "#515E5A",
          },
        },
        border: {
          light: "#E5E7EB",
          dark: "#515E5A",
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
        "pill-light": "#E5E7EB",
        "pill-dark": "rgba(207, 191, 173, 0.45)",
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
