import React, { createContext, useContext, useState } from "react";

// Tạo Context
const ThemeContext = createContext();

// Provider để chia sẻ trạng thái dark/light mode
export const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState("light");

  const toggleColorScheme = () => {
    setColorScheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook để sử dụng Theme
export const useTheme = () => useContext(ThemeContext);
