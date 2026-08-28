import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('neurosync_users') || '[]');
    const match = users.find(
      (u) => u.email.toLowerCase() === form.email.toLowerCase() && u.password === form.password
    );

    if (!match) {
      setError('Incorrect email or password. Please try again.');
      return;
    }

    localStorage.setItem('neurosync_current_user', JSON.stringify({ name: match.name, email: match.email }));

    const hasPersonalized = localStorage.getItem(`neurosync_profile_${match.email}`);
    navigate(hasPersonalized ? '/assessment' : '/personalize');
  };

  return (
    <div className="auth-shell">
      <Navbar showAuthLinks={false} />
      <main className="auth-main">
        <form className="card auth-card" onSubmit={handleSubmit} noValidate>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Log in to continue your screening.</p>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={handleChange('password')} autoComplete="current-password" />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit">Log in</button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate('/signup')}>Sign up</button>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
