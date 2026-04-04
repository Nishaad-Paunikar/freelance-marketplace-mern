import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ProjectDetailPage.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatBudget = (budget) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

/**
 * ProposalForm — shown to logged-in freelancers when project is open.
 * Handles bid submission in-page without navigating away.
 */
const ProposalForm = ({ projectId }) => {
  const [message,   setMessage]   = useState('');
  const [bidAmount, setBid]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!message.trim()) return setError('Please write a proposal message.');
    if (!bidAmount || Number(bidAmount) <= 0) return setError('Enter a valid bid amount.');

    setLoading(true);
    try {
      await api.post('/proposals', {
        projectId,
        message: message.trim(),
        bidAmount: Number(bidAmount),
      });
      setSubmitted(true);
      showToast('Proposal submitted successfully! 🎉', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="proposal-success">
        <div className="proposal-success-icon">🎉</div>
        <div className="proposal-success-title">Proposal Sent!</div>
        <p className="proposal-success-sub">
          The client will review your proposal and get back to you.
        </p>
      </div>
    );
  }

  return (
    <div className="proposal-card">
      <div className="proposal-card-title">Submit a Proposal</div>
      <p className="proposal-card-sub">Pitch your bid and win this project</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Bid amount */}
        <div className="form-group">
          <label htmlFor="bid-amount" className="form-label">Your Bid (USD)</label>
          <input
            id="bid-amount"
            type="number"
            className="form-input"
            placeholder="e.g. 500"
            min="1"
            step="1"
            value={bidAmount}
            onChange={(e) => { setBid(e.target.value); if (error) setError(''); }}
          />
        </div>

        {/* Message */}
        <div className="form-group">
          <label htmlFor="proposal-message" className="form-label">Cover Letter</label>
          <textarea
            id="proposal-message"
            className="form-textarea"
            placeholder="Introduce yourself and explain why you're the best fit for this project…"
            rows={5}
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (error) setError(''); }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading
            ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: 8 }} />Submitting…</>
            : 'Submit Proposal →'
          }
        </button>
      </form>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ProjectDetailPage — full project view with:
 * - Project title, description, budget, status, client info
 * - Proposal form (freelancers on open projects only)
 * - Context-aware sidebar notices for other cases
 */
const ProjectDetailPage = () => {
  const { id } = useParams();
  const { isFreelancer, isClient } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Project not found.'
            : 'Failed to load project. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // ── Sidebar content logic ────────────────────────────────────
  const renderSidebar = () => {
    if (!project) return null;

    // Project is not open any more
    if (project.status === 'assigned') {
      return (
        <div className="project-status-notice">
          <span className="notice-icon">🔒</span>
          <strong>Project Assigned</strong>
          <p style={{ marginTop: 6 }}>A freelancer has already been selected for this project.</p>
        </div>
      );
    }

    if (project.status === 'completed') {
      return (
        <div className="project-status-notice">
          <span className="notice-icon">✅</span>
          <strong>Project Completed</strong>
          <p style={{ marginTop: 6 }}>This project has been successfully completed.</p>
        </div>
      );
    }

    // Open project — show proposal form or prompts
    if (project.status === 'open') {
      if (isFreelancer) {
        return <ProposalForm projectId={project._id} />;
      }

      if (isClient) {
        return (
          <div className="project-status-notice">
            <span className="notice-icon">👀</span>
            <strong>You are viewing as a Client</strong>
            <p style={{ marginTop: 6 }}>
              <Link to="/dashboard/client" className="auth-link">Go to your dashboard →</Link> to manage proposals.
            </p>
          </div>
        );
      }

      // Not logged in
      return (
        <div className="project-status-notice">
          <span className="notice-icon">💼</span>
          <strong>Want to apply?</strong>
          <p style={{ marginTop: 6, marginBottom: 'var(--space-md)' }}>
            Sign in as a freelancer to submit a proposal.
          </p>
          <Link to="/login" className="btn btn-primary btn-full btn-sm">
            Sign In to Apply
          </Link>
        </div>
      );
    }

    return null;
  };

  // ── Render ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container loading-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <Link to="/projects" className="detail-back">← Back to Projects</Link>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const { title, description, budget, status, client, createdAt, assignedFreelancer } = project;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* ── Back navigation ────────────────────────────────── */}
        <Link to="/projects" className="detail-back">
          ← Back to Projects
        </Link>

        {/* ── Two-column layout ──────────────────────────────── */}
        <div className="detail-layout">
          {/* ── Left: Project Info ─────────────────────────── */}
          <div className="detail-main">
            <div className="detail-header">
              <div className="detail-title-row">
                <h1 className="detail-title">{title}</h1>
                <span className={`badge badge-${status}`}>{status}</span>
              </div>

              {/* Meta row */}
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <span className="detail-meta-icon">📅</span>
                  <span>Posted {formatDate(createdAt)}</span>
                </div>
                {assignedFreelancer && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-icon">👷</span>
                    <span className="detail-meta-label">Assigned to {assignedFreelancer.name || 'a freelancer'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="detail-section">
              <div className="detail-section-title">Project Description</div>
              <p className="detail-description">{description}</p>
            </div>

            {/* Assigned freelancer detail if any */}
            {assignedFreelancer && typeof assignedFreelancer === 'object' && (
              <div className="detail-section">
                <div className="detail-section-title">Assigned Freelancer</div>
                <div className="client-card" style={{ padding: 'var(--space-md)' }}>
                  <div className="client-card-info">
                    <div className="client-card-avatar">
                      {(assignedFreelancer.name?.[0] || 'F').toUpperCase()}
                    </div>
                    <div>
                      <div className="client-card-name">{assignedFreelancer.name}</div>
                      <div className="client-card-email">{assignedFreelancer.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Sidebar ─────────────────────────────── */}
          <div className="detail-sidebar">
            {/* Budget card */}
            <div className="budget-card">
              <div className="budget-card-amount">{formatBudget(budget)}</div>
              <div className="budget-card-label">Project Budget</div>
            </div>

            {/* Client info */}
            {client && (
              <div className="client-card">
                <div className="client-card-title">Posted by</div>
                <div className="client-card-info">
                  <div className="client-card-avatar">
                    {(client.name?.[0] || 'C').toUpperCase()}
                  </div>
                  <div>
                    <div className="client-card-name">{client.name}</div>
                    <div className="client-card-email">{client.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Proposal / status section */}
            {renderSidebar()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
