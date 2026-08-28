import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';

    const existing = JSON.parse(localStorage.getItem('neurosync_users') || '[]');
    if (existing.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      errs.email = 'An account with this email already exists.';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const users = JSON.parse(localStorage.getItem('neurosync_users') || '[]');
    users.push({ name: form.name, email: form.email, password: form.password });
    localStorage.setItem('neurosync_users', JSON.stringify(users));
    navigate('/login');
  };

  return (
    <div className="auth-shell">
      <Navbar showAuthLinks={false} />
      <main className="auth-main">
        <form className="card auth-card" onSubmit={handleSubmit} noValidate>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start your reading screening in a couple of minutes.</p>

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" value={form.name} onChange={handleChange('name')} autoComplete="name" />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={handleChange('email')} autoComplete="email" />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={handleChange('password')} autoComplete="new-password" />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} autoComplete="new-password" />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit">Sign up</button>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')}>Log in</button>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
