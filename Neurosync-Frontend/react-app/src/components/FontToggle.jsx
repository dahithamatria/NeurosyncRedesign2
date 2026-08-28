import { usePreferences } from '../context/PreferencesContext';
import './ThemeToggle.css';

export default function FontToggle() {
  const { dyslexicFont, toggleDyslexicFont } = usePreferences();

  return (
    <button
      className="icon-toggle"
      onClick={toggleDyslexicFont}
      aria-label={dyslexicFont ? 'Use standard font' : 'Use dyslexia-friendly font'}
      aria-pressed={dyslexicFont}
      title={dyslexicFont ? 'Use standard font' : 'Use dyslexia-friendly font'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 20V6a2 2 0 0 1 2-2h6a4 4 0 0 1 0 8H7m0 0h7a4 4 0 0 1 0 8H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
}
