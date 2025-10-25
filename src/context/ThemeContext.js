import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('#25D366'); // WhatsApp green
  const [fontSize, setFontSize] = useState('medium');
  const [sidebarPosition, setSidebarPosition] = useState('left');

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedTheme = localStorage.getItem('wa-theme') || 'light';
    const savedAccent = localStorage.getItem('wa-accent') || '#25D366';
    const savedFontSize = localStorage.getItem('wa-fontSize') || 'medium';
    const savedSidebarPos = localStorage.getItem('wa-sidebarPosition') || 'left';

    setTheme(savedTheme);
    setAccentColor(savedAccent);
    setFontSize(savedFontSize);
    setSidebarPosition(savedSidebarPos);

    // Apply theme class to document
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('wa-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeAccentColor = (color) => {
    setAccentColor(color);
    localStorage.setItem('wa-accent', color);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('wa-fontSize', size);
  };

  const changeSidebarPosition = (position) => {
    setSidebarPosition(position);
    localStorage.setItem('wa-sidebarPosition', position);
  };

  const value = {
    theme,
    accentColor,
    fontSize,
    sidebarPosition,
    toggleTheme,
    changeAccentColor,
    changeFontSize,
    changeSidebarPosition
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};