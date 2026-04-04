import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Navbar         from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ProjectsPage        from './pages/ProjectsPage';
import ProjectDetailPage   from './pages/ProjectDetailPage';
import ClientDashboard     from './pages/ClientDashboard';
import PostProjectPage     from './pages/PostProjectPage';
import FreelancerDashboard from './pages/FreelancerDashboard';

import './App.css';

/**
 * GuestRoute — must live INSIDE AuthProvider so useAuth() works.
 * Redirects already-authenticated users away from login/register.
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    const dest = user?.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer';
    return <Navigate to={dest} replace />;
  }
  return children;
};

/**
 * AppRoutes — separated so GuestRoute and ProtectedRoute can use
 * useAuth() which requires AuthProvider to already be in the tree.
 */
const AppRoutes = () => (
  <>
    {/* Global fixed Navbar */}
    <Navbar />

    <Routes>
      {/* ── Public Routes ──────────────────────────────────── */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />

      {/* ── Client-only Routes ─────────────────────────────── */}
      <Route
        path="/dashboard/client"
        element={
          <ProtectedRoute role="client">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute role="client">
            <PostProjectPage />
          </ProtectedRoute>
        }
      />

      {/* ── Freelancer-only Routes ─────────────────────────── */}
      <Route
        path="/dashboard/freelancer"
        element={
          <ProtectedRoute role="freelancer">
            <FreelancerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Fallback ───────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
