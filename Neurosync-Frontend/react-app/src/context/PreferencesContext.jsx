import { createContext, useContext, useEffect, useState } from 'react';

const PreferencesContext = createContext(null);

const FONT_SCALES = { small: 0.9, medium: 1, large: 1.15, xlarge: 1.3 };

export function PreferencesProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('neurosync_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [dyslexicFont, setDyslexicFont] = useState(() => {
    return localStorage.getItem('neurosync_font') === 'dyslexic';
  });
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('neurosync_font_size') || 'medium';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('neurosync_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.body.setAttribute('data-font', dyslexicFont ? 'dyslexic' : 'default');
    localStorage.setItem('neurosync_font', dyslexicFont ? 'dyslexic' : 'default');
  }, [dyslexicFont]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', FONT_SCALES[fontSize] ?? 1);
    localStorage.setItem('neurosync_font_size', fontSize);
  }, [fontSize]);

  const value = {
    darkMode,
    toggleDarkMode: () => setDarkMode((d) => !d),
    dyslexicFont,
    toggleDyslexicFont: () => setDyslexicFont((d) => !d),
    fontSize,
    setFontSize,
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
