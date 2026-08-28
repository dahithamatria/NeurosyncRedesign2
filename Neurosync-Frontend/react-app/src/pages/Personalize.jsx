import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePreferences } from '../context/PreferencesContext';
import './Auth.css';
import './Personalize.css';

const defaultProfile = {
  age: '',
  gender: '',
  education: '',
  nativeLanguage: '',
  readingFrequency: '',
  glasses: '',
  diagnosedDyslexia: '',
};

export default function Personalize() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, dyslexicFont, toggleDyslexicFont, fontSize, setFontSize } = usePreferences();
  const [profile, setProfile] = useState(defaultProfile);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('neurosync_current_user') || 'null');

  const handleChange = (field) => (e) => setProfile((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ['age', 'gender', 'education', 'nativeLanguage', 'readingFrequency', 'glasses', 'diagnosedDyslexia'];
    if (required.some((k) => !profile[k])) {
      setError('Please fill out every field so we can personalize your assessment.');
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }
    localStorage.setItem(`neurosync_profile_${user.email}`, JSON.stringify({ ...profile, fontSize, darkMode, dyslexicFont }));
    navigate('/assessment');
  };

  return (
    <div className="auth-shell">
      <Navbar />
      <main className="auth-main">
        <form className="card auth-card personalize-card" onSubmit={handleSubmit} noValidate>
          <h1 className="auth-title">Let's personalize things</h1>
          <p className="auth-subtitle">This helps us tailor the assessment and interpret your results fairly.</p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input id="age" type="number" min="5" max="110" value={profile.age} onChange={handleChange('age')} />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" value={profile.gender} onChange={handleChange('gender')}>
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="education">Education level</label>
            <select id="education" value={profile.education} onChange={handleChange('education')}>
              <option value="">Select</option>
              <option>Primary school</option>
              <option>Secondary school</option>
              <option>Undergraduate</option>
              <option>Postgraduate</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nativeLanguage">Native language</label>
              <input id="nativeLanguage" type="text" value={profile.nativeLanguage} onChange={handleChange('nativeLanguage')} />
            </div>
            <div className="form-group">
              <label htmlFor="readingFrequency">Reading frequency</label>
              <select id="readingFrequency" value={profile.readingFrequency} onChange={handleChange('readingFrequency')}>
                <option value="">Select</option>
                <option>Daily</option>
                <option>A few times a week</option>
                <option>Rarely</option>
                <option>Never</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="glasses">Do you wear glasses?</label>
              <select id="glasses" value={profile.glasses} onChange={handleChange('glasses')}>
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="diagnosedDyslexia">Diagnosed with dyslexia?</label>
              <select id="diagnosedDyslexia" value={profile.diagnosedDyslexia} onChange={handleChange('diagnosedDyslexia')}>
                <option value="">Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          <h2 className="personalize-subheading">Reading preferences</h2>

          <div className="form-group">
            <label htmlFor="fontSize">Preferred font size</label>
            <select id="fontSize" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-row-label">Dyslexia-friendly font</div>
              <div className="toggle-row-sub">Switches body text to a more readable typeface</div>
            </div>
            <button type="button" className="switch" role="switch" aria-checked={dyslexicFont} onClick={toggleDyslexicFont} aria-label="Toggle dyslexia-friendly font" />
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-row-label">Dark mode</div>
              <div className="toggle-row-sub">Easier on the eyes in low light</div>
            </div>
            <button type="button" className="switch" role="switch" aria-checked={darkMode} onClick={toggleDarkMode} aria-label="Toggle dark mode" />
          </div>

          {error && <p className="form-error" style={{ marginTop: 16 }}>{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" style={{ marginTop: 24 }}>Continue to Assessment</button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
