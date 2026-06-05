/**
 * chatTheme — Source of truth cho màu sắc chat, lấy từ tailwind.config.js
 * Dùng chung cho MessageBubble, InfoChat, và bất kỳ component chat nào.
 */

export const chatTheme = {
  // Bubble của mình
  ownBubble: "#768D85", // primary[500]
  ownBubbleText: "#FFFFFF", // primary.foreground.light

  // Bubble của người khác
  otherBubbleDark: "#2D2F2F", // surface.dark
  otherBubbleLight: "#F1F4F3", // component.light
  otherBubbleTextDark: "#EFE7DF", // text.dark
  otherBubbleTextLight: "#1E2021", // text.light

  // Background màn hình
  bgDark: "#1E2021", // background.dark
  bgLight: "#FFFFFF", // background.light

  // Surface (card, section)
  surfaceDark: "#2D2F2F", // surface.dark
  surfaceLight: "#FFFFFF", // surface.light

  // Surface muted (input, row nền nhạt)
  surfaceMutedDark: "#252525", // surface-muted.dark
  surfaceMutedLight: "#F2F2F2", // surface-muted.light

  // Bottom sheet
  sheetDark: "#252525", // sheet.dark
  sheetLight: "#FFFFFF", // sheet.light

  // Component block
  componentDark: "#2D2F2F", // component.dark
  componentLight: "#F1F4F3", // component.light

  // Text
  textDark: "#EFE7DF", // text.dark
  textLight: "#1E2021", // text.light
  textMuted: "#515E5A", // text.muted (cả 2 mode)

  // Accent / brand (xanh rêu primary)
  accent: "#768D85",
  accentText: "#FFFFFF",
  accentSubtle: "rgba(118,141,133,0.15)",

  // Info (xanh dương nhạt)
  info: "#60A5FA", // info.dark
  infoSubtle: "rgba(96,165,250,0.15)",

  // Danger
  danger: "#EF4444", // error.light
  dangerMuted: "#E57373", // warning nhẹ hơn

  // Divider
  dividerDark: "#333333",
  dividerLight: "#F0F0F0",

  // Handle bar
  handleDark: "#555555",
  handleLight: "#DEDEDE",

  // Input background
  inputBgDark: "#2a2a2a",
  inputBgLight: "#F0F0F0",

  // Cancel button
  cancelBgDark: "#333333",
  cancelBgLight: "#F5F5F5",

  // Date separator
  dateMuted: "#515E5A", // text.muted
} as const;
