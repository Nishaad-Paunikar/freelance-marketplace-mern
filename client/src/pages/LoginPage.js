import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AuthPages.css';

/**
 * LoginPage — authenticates a user and stores their JWT.
 * After login, redirects to the page they tried to access,
 * or to their role-specific dashboard.
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // If coming from a ProtectedRoute redirect, go back there after login
  const from = location.state?.from?.pathname || null;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(''); // clear error on new input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', formData);
      const { user, token } = res.data;

      // Persist to context + localStorage
      login(user, token);

      // Redirect logic
      if (from) {
        navigate(from, { replace: true });
      } else {
        const dest = user.role === 'client'
          ? '/dashboard/client'
          : '/dashboard/freelancer';
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-glow-right" />

      <div className="auth-container">
        <div className="auth-card">
          {/* ── Header ──────────────────────────────────────── */}
          <div className="auth-header">
            <div className="auth-logo">⚡</div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your FreeLance account</p>
          </div>

          {/* ── Error Alert ─────────────────────────────────── */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* ── Form ────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading
                ? <><span className="btn-spinner" />Signing in...</>
                : 'Sign In →'
              }
            </button>
          </form>

          {/* ── Footer ──────────────────────────────────────── */}
          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
