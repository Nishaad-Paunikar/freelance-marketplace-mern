import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import './ProposalsPage.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatBudget = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * ProposalsPage — client-only page.
 * Shows all proposals submitted for one of their projects.
 * - Accept a proposal (sets project to "assigned")
 * - Mark project as complete (if status is "assigned")
 */
const ProposalsPage = () => {
  const { projectId } = useParams();
  const { showToast } = useToast();

  const [project,   setProject]   = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // IDs being acted on (to show per-button loading)
  const [accepting,   setAccepting]   = useState(null);
  const [completing,  setCompleting]  = useState(false);

  // ── Fetch project + proposals ────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projRes, propRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/proposals/${projectId}`),
        ]);
        setProject(projRes.data);
        setProposals(propRes.data);
      } catch (err) {
        setError(
          err.response?.status === 403
            ? 'You are not authorized to view these proposals.'
            : 'Failed to load proposals. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // ── Accept a proposal ────────────────────────────────────────
  const handleAccept = async (proposalId) => {
    setAccepting(proposalId);
    setError('');
    try {
      const res = await api.put(`/proposals/accept/${proposalId}`);
      setProject(res.data.project);
      showToast('Proposal accepted! Project is now assigned. 🎉', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept proposal.');
    } finally {
      setAccepting(null);
    }
  };

  // ── Mark project complete ─────────────────────────────────────
  const handleComplete = async () => {
    setCompleting(true);
    setError('');
    try {
      const res = await api.put(`/projects/complete/${projectId}`);
      setProject(res.data.project);
      showToast('Project marked as completed! ✅', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete project.');
    } finally {
      setCompleting(false);
    }
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

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Back nav */}
        <Link to="/dashboard/client" className="detail-back" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14, fontWeight: 500, marginBottom: 'var(--space-xl)', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="page-header">
          <h1 className="page-title">Proposals</h1>
          <p className="page-subtitle">
            {project
              ? `Reviewing proposals for: "${project.title}"`
              : 'Loading project…'}
          </p>
        </div>

        {/* Alerts */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Error state */}
        {error && !project && (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div>{error}</div>
            <Link to="/dashboard/client" className="btn btn-secondary" style={{ marginTop: 'var(--space-md)' }}>Back to Dashboard</Link>
          </div>
        )}

        {/* Main content */}
        {project && (
          <div className="proposals-layout">
            {/* ── Left: proposals list ────────────────────────── */}
            <div>
              {proposals.length === 0 ? (
                <div className="empty-state card">
                  <div className="empty-state-icon">📭</div>
                  <div className="empty-state-title">No proposals yet</div>
                  <p className="text-muted text-sm">
                    Freelancers haven't submitted proposals for this project yet.
                    Share the project link to get more visibility.
                  </p>
                  <Link
                    to={`/projects/${projectId}`}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 'var(--space-md)' }}
                  >
                    View Public Listing →
                  </Link>
                </div>
              ) : (
                <div className="proposal-list">
                  <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)' }}>
                    {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
                    {project.status !== 'open' && ' — project is no longer accepting new proposals'}
                  </p>

                  {proposals.map((proposal) => {
                    const isAccepted = project.assignedFreelancer &&
                      (typeof project.assignedFreelancer === 'object'
                        ? project.assignedFreelancer._id === proposal.freelancer._id
                        : project.assignedFreelancer === proposal.freelancer._id);

                    return (
                      <div
                        key={proposal._id}
                        className={`proposal-item ${isAccepted ? 'accepted' : ''}`}
                      >
                        {/* Header */}
                        <div className="proposal-header">
                          <div className="proposal-freelancer">
                            <div className="proposal-avatar">
                              {(proposal.freelancer?.name?.[0] || 'F').toUpperCase()}
                            </div>
                            <div>
                              <div className="proposal-name">{proposal.freelancer?.name}</div>
                              <div className="proposal-email">{proposal.freelancer?.email}</div>
                            </div>
                          </div>

                          <div className="proposal-bid">
                            <div className="proposal-bid-amount">{formatBudget(proposal.bidAmount)}</div>
                            <div className="proposal-bid-label">bid amount</div>
                          </div>
                        </div>

                        {/* Message */}
                        <div className="proposal-message">{proposal.message}</div>

                        {/* Footer */}
                        <div className="proposal-footer">
                          <span className="proposal-date">Submitted {formatDate(proposal.createdAt)}</span>

                          {isAccepted ? (
                            <span className="badge badge-accepted">✓ Accepted</span>
                          ) : project.status === 'open' ? (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleAccept(proposal._id)}
                              disabled={accepting === proposal._id}
                            >
                              {accepting === proposal._id
                                ? 'Accepting…'
                                : 'Accept Proposal'}
                            </button>
                          ) : (
                            <span className="badge badge-pending">Not selected</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Right: sidebar ──────────────────────────────── */}
            <div className="proposals-project-card">
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 'var(--space-sm)' }}>
                Project
              </div>
              <div className="proposals-project-title">{project.title}</div>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
              <div className="proposals-project-budget">{formatBudget(project.budget)}</div>
              <div className="budget-card-label text-muted text-sm">project budget</div>

              <Link
                to={`/projects/${projectId}`}
                className="btn btn-secondary btn-sm btn-full"
                style={{ marginTop: 'var(--space-md)' }}
              >
                View Public Listing →
              </Link>

              {/* Mark Complete section — only if project is assigned */}
              {project.status === 'assigned' && (
                <div className="mark-complete-box">
                  <div className="mark-complete-title">Ready to close?</div>
                  <p className="mark-complete-desc">
                    Once the work is delivered and you are satisfied, mark this
                    project as complete.
                  </p>
                  <button
                    className="btn btn-primary btn-full btn-sm"
                    onClick={handleComplete}
                    disabled={completing}
                  >
                    {completing ? 'Marking…' : '🎉 Mark as Complete'}
                  </button>
                </div>
              )}

              {project.status === 'completed' && (
                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: 13, color: 'var(--status-completed)' }}>
                  ✅ This project has been completed
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalsPage;
