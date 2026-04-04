import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AuthPages.css';

/**
 * RegisterPage — creates a new user account.
 *
 * Supports a ?role=client or ?role=freelancer query param so
 * the landing page CTA buttons can pre-select the role.
 *
 * After registration, auto-logs in the user and redirects
 * to their role dashboard.
 */
const RegisterPage = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name:     '',
    email:    '',
    password: '',
    role:     'freelancer', // default
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-select role from URL query param (?role=client)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'client' || roleParam === 'freelancer') {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  // ── Handlers ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  // ── Client-side validation ───────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = 'Full name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'A valid email address is required';
    if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // 1. Register the user
      await api.post('/auth/register', formData);

      // 2. Auto-login immediately after registration
      const loginRes = await api.post('/auth/login', {
        email:    formData.email,
        password: formData.password,
      });

      const { user, token } = loginRes.data;
      login(user, token);

      // 3. Redirect to role dashboard
      const dest = user.role === 'client'
        ? '/dashboard/client'
        : '/dashboard/freelancer';
      navigate(dest, { replace: true });

    } catch (err) {
      // Handle array of validation errors from express-validator
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setApiError(data.errors.map(e => e.msg).join(' · '));
      } else {
        setApiError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-glow-right" />

      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <div className="auth-card">
          {/* ── Header ──────────────────────────────────────── */}
          <div className="auth-header">
            <div className="auth-logo">⚡</div>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Join FreeLance and start today</p>
          </div>

          {/* ── API Error ────────────────────────────────────── */}
          {apiError && <div className="alert alert-error">{apiError}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* ── Role Picker ───────────────────────────────── */}
            <div className="form-group">
              <label className="form-label">I want to…</label>
              <div className="role-picker">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={formData.role === 'client'}
                    onChange={() => handleRoleChange('client')}
                  />
                  <div className="role-option-card">
                    <span className="role-option-icon">🏢</span>
                    <span className="role-option-label">Hire Talent</span>
                    <span className="role-option-desc">Post projects &amp; find freelancers</span>
                  </div>
                </label>

                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="freelancer"
                    checked={formData.role === 'freelancer'}
                    onChange={() => handleRoleChange('freelancer')}
                  />
                  <div className="role-option-card">
                    <span className="role-option-icon">💻</span>
                    <span className="role-option-label">Find Work</span>
                    <span className="role-option-desc">Browse projects &amp; submit proposals</span>
                  </div>
                </label>
              </div>
            </div>

            {/* ── Name ─────────────────────────────────────── */}
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">Full name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="Jane Smith"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* ── Email ────────────────────────────────────── */}
            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email address</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* ── Password ─────────────────────────────────── */}
            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* ── Submit ───────────────────────────────────── */}
            <button
              type="submit"
              id="register-submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading
                ? <><span className="btn-spinner" />Creating account...</>
                : `Join as ${formData.role === 'client' ? 'Client' : 'Freelancer'} →`
              }
            </button>
          </form>

          <p className="auth-terms">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>

          {/* ── Footer ──────────────────────────────────────── */}
          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
