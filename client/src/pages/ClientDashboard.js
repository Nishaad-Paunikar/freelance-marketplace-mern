import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ClientDashboard.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatBudget = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * ClientDashboard — main hub for clients.
 *
 * Features:
 * - Stats: total / open / assigned / completed counts
 * - Full project list with status badge + proposal link
 * - Mark complete action inline
 * - "New project published" success banner (from PostProjectPage redirect)
 */
const ClientDashboard = () => {
  const { user }   = useAuth();
  const location   = useLocation();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Per-row completing state
  const [completing, setCompleting] = useState(null);

  // Success banner from PostProjectPage redirect
  const showNewBanner = location.state?.newProject === true;

  // ── Fetch my projects ────────────────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get('/projects/my');
        setProjects(res.data);
      } catch (err) {
        setError('Failed to load your projects. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // ── Stats (computed from fetched data) ───────────────────────
  const stats = useMemo(() => ({
    total:     projects.length,
    open:      projects.filter(p => p.status === 'open').length,
    assigned:  projects.filter(p => p.status === 'assigned').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }), [projects]);

  // ── Mark complete ────────────────────────────────────────────
  const handleComplete = async (projectId) => {
    setCompleting(projectId);
    try {
      const res = await api.put(`/projects/complete/${projectId}`);
      setProjects(prev =>
        prev.map(p => p._id === projectId ? res.data.project : p)
      );
      showToast('Project marked as complete! ✅', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark project as complete.');
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* ── Welcome Header ────────────────────────────────── */}
        <div className="dashboard-welcome">
          <div>
            <div className="dashboard-greeting">Client Dashboard</div>
            <h1 className="dashboard-title">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="dashboard-sub">
              Manage your projects and find the right talent.
            </p>
          </div>
          <Link to="/projects/new" className="btn btn-primary">
            + Post New Project
          </Link>
        </div>

        {/* ── New project banner (from PostProjectPage) ─────── */}
        {showNewBanner && (
          <div className="new-project-banner">
            🎉 Your project has been published and is now accepting proposals!
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────── */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Stats row ─────────────────────────────────────── */}
        {!loading && (
          <div className="dashboard-stats">
            <div className="stat-item">
              <div className="stat-item-icon">📋</div>
              <div className="stat-item-value">{stats.total}</div>
              <div className="stat-item-label">Total Projects</div>
            </div>
            <div className="stat-item open">
              <div className="stat-item-icon">🟢</div>
              <div className="stat-item-value">{stats.open}</div>
              <div className="stat-item-label">Open</div>
            </div>
            <div className="stat-item assigned">
              <div className="stat-item-icon">⚙️</div>
              <div className="stat-item-value">{stats.assigned}</div>
              <div className="stat-item-label">In Progress</div>
            </div>
            <div className="stat-item completed">
              <div className="stat-item-icon">✅</div>
              <div className="stat-item-value">{stats.completed}</div>
              <div className="stat-item-label">Completed</div>
            </div>
          </div>
        )}

        {/* ── Projects Section ──────────────────────────────── */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">My Projects</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">
              Browse All →
            </Link>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : projects.length === 0 ? (
            /* Empty state */
            <div className="empty-state card">
              <div className="empty-state-icon">📂</div>
              <div className="empty-state-title">No projects yet</div>
              <p className="text-muted text-sm">
                Post your first project and start receiving proposals from talented freelancers.
              </p>
              <Link to="/projects/new" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                Post Your First Project →
              </Link>
            </div>
          ) : (
            /* Project list */
            <div className="dashboard-project-list">
              {projects.map((project) => (
                <div key={project._id} className="dashboard-project-item">
                  {/* Info */}
                  <div className="dashboard-proj-info">
                    <div className="dashboard-proj-title">{project.title}</div>
                    <div className="dashboard-proj-meta">
                      <span className={`badge badge-${project.status}`}>{project.status}</span>
                      <span className="dashboard-proj-budget">{formatBudget(project.budget)}</span>
                      <span className="dashboard-proj-date">Posted {formatDate(project.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="dashboard-proj-actions">
                    {/* View public listing */}
                    <Link
                      to={`/projects/${project._id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      View
                    </Link>

                    {/* View proposals — available for all statuses */}
                    <Link
                      to={`/dashboard/client/proposals/${project._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Proposals →
                    </Link>

                    {/* Mark complete — only when assigned */}
                    {project.status === 'assigned' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleComplete(project._id)}
                        disabled={completing === project._id}
                      >
                        {completing === project._id ? 'Saving…' : '✓ Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
