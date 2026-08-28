import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import FontToggle from './FontToggle';
import './Navbar.css';

export default function Navbar({ showAuthLinks = true }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('neurosync_current_user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('neurosync_current_user');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <button className="navbar-logo" onClick={() => navigate('/')} aria-label="NeuroSync home">
          <span className="navbar-logo-mark">N</span>
          <span className="navbar-logo-text">NeuroSync</span>
        </button>
        <div className="navbar-actions">
          <FontToggle />
          <ThemeToggle />
          {showAuthLinks && user && (
            <button className="btn btn-secondary navbar-logout" onClick={() => navigate('/dashboard')}>Dashboard</button>
          )}
          {showAuthLinks && user && (
            <button className="btn btn-secondary navbar-logout" onClick={handleLogout}>Log out</button>
          )}
        </div>
      </div>
    </header>
  );
}
