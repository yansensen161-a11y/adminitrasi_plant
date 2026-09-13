import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  currentTheme: 'light',
  changeCurrentTheme: () => {},
});

export default function ThemeProvider({children}) {  
  // Always use light mode - remove dark from localStorage if set
  const [theme, setTheme] = useState('light');

  const changeCurrentTheme = (newTheme) => {
    // Only allow light mode
    setTheme('light');
    localStorage.setItem('theme', 'light');
  };

  useEffect(() => {
    // Force remove dark class and set light mode always
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, [theme]);

  return <ThemeContext.Provider value={{ currentTheme: 'light', changeCurrentTheme }}>{children}</ThemeContext.Provider>;
}

export const useThemeProvider = () => useContext(ThemeContext);

