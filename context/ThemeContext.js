import React, { createContext, useContext } from "react";

// Luôn chạy ở chế độ dark – không còn light mode
const ThemeContext = createContext({
  colorScheme: "dark",
  // Để tránh crash nếu code cũ vẫn gọi toggle
  toggleColorScheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const value = {
    colorScheme: "dark",
    toggleColorScheme: () => {},
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook để sử dụng Theme
export const useTheme = () => useContext(ThemeContext);
