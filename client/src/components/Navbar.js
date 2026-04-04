import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

/**
 * Navbar — role-aware navigation bar.
 * Shows different links depending on whether the user is a guest,
 * client, or freelancer.
 */
const Navbar = () => {
  const { user, isAuthenticated, isClient, isFreelancer, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Build initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* ── Brand ──────────────────────────────────────────── */}
          <Link to="/" className="navbar-brand" onClick={closeMobile}>
            <div className="navbar-logo-icon">⚡</div>
            <span className="navbar-logo-text">
              Free<span>Lance</span>
            </span>
          </Link>

          {/* ── Desktop Links ───────────────────────────────────── */}
          <div className="navbar-links">
            {/* Always visible */}
            <NavLink to="/projects" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
              Browse Projects
            </NavLink>

            {/* Client-specific */}
            {isClient && (
              <>
                <NavLink to="/dashboard/client" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                  My Dashboard
                </NavLink>
                <NavLink to="/projects/new" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                  Post Project
                </NavLink>
              </>
            )}

            {/* Freelancer-specific */}
            {isFreelancer && (
              <NavLink to="/dashboard/freelancer" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                My Dashboard
              </NavLink>
            )}
          </div>

          {/* ── Right side ─────────────────────────────────────── */}
          {isAuthenticated ? (
            <div className="navbar-user">
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user.name}</span>
                <span className="navbar-user-role">{user.role}</span>
              </div>
              <div className="navbar-avatar">{initials}</div>
              <button className="navbar-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <NavLink to="/login" className="btn btn-ghost btn-sm">
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Get Started
              </NavLink>
            </div>
          )}

          {/* ── Hamburger (mobile) ─────────────────────────────── */}
          <button
            className="navbar-hamburger"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ────────────────────────────────────────── */}
      <div className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`} style={{ top: 'var(--navbar-height)', position: 'fixed', left: 0, right: 0, zIndex: 999 }}>
        <NavLink to="/projects" className={({ isActive }) => `navbar-mobile-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
          Browse Projects
        </NavLink>

        {isClient && (
          <>
            <NavLink to="/dashboard/client" className={({ isActive }) => `navbar-mobile-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              My Dashboard
            </NavLink>
            <NavLink to="/projects/new" className={({ isActive }) => `navbar-mobile-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
              Post Project
            </NavLink>
          </>
        )}

        {isFreelancer && (
          <NavLink to="/dashboard/freelancer" className={({ isActive }) => `navbar-mobile-link${isActive ? ' active' : ''}`} onClick={closeMobile}>
            My Dashboard
          </NavLink>
        )}

        {!isAuthenticated && (
          <>
            <NavLink to="/login" className="navbar-mobile-link" onClick={closeMobile}>Login</NavLink>
            <NavLink to="/register" className="navbar-mobile-link" onClick={closeMobile}>Register</NavLink>
          </>
        )}

        {isAuthenticated && (
          <button className="navbar-mobile-link" style={{ textAlign: 'left', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </>
  );
};

export default Navbar;
