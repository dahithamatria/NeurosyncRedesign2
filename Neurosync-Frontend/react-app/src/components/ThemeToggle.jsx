import { usePreferences } from '../context/PreferencesContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = usePreferences();

  return (
    <button
      className="icon-toggle"
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={darkMode}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
      )}
    </button>
  );
}
