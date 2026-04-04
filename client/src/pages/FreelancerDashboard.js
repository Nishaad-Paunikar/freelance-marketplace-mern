import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './FreelancerDashboard.css';
import './ClientDashboard.css'; // reuse dashboard-welcome + dashboard-stats

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatBudget = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Sub-component: Inline Edit Form ─────────────────────────────────────────
const EditForm = ({ proposal, onSave, onCancel }) => {
  const [bidAmount, setBid]     = useState(String(proposal.bidAmount));
  const [message,   setMessage] = useState(proposal.message);
  const [loading,   setLoading] = useState(false);
  const [error,     setError]   = useState('');

  const handleSave = async () => {
    if (!message.trim()) return setError('Message cannot be empty.');
    if (!bidAmount || Number(bidAmount) <= 0) return setError('Enter a valid bid amount.');

    setLoading(true);
    setError('');
    try {
      const res = await api.put(`/proposals/${proposal._id}`, {
        message:   message.trim(),
        bidAmount: Number(bidAmount),
      });
      onSave(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fl-edit-form">
      <div className="fl-edit-title">✏️ Edit Proposal</div>

      {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Bid Amount (USD)</label>
        <input
          type="number"
          className="form-input"
          value={bidAmount}
          onChange={(e) => { setBid(e.target.value); setError(''); }}
          min="1"
          step="1"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Cover Letter</label>
        <textarea
          className="form-textarea"
          rows={5}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setError(''); }}
        />
      </div>

      <div className="fl-edit-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving…' : '✓ Save Changes'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Sub-component: Delete Confirmation ──────────────────────────────────────
const DeleteConfirm = ({ proposalId, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/proposals/${proposalId}`);
      onConfirm(proposalId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete proposal.');
      setLoading(false);
    }
  };

  return (
    <div className="fl-delete-confirm">
      <div>
        <div className="fl-delete-confirm-text">⚠️ Delete this proposal?</div>
        {error && <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{error}</div>}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? 'Deleting…' : 'Yes, Delete'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Sub-component: Single Proposal Card ─────────────────────────────────────
const ProposalCard = ({ proposal, onUpdated, onDeleted }) => {
  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'delete'
  const [expanded, setExpanded] = useState(false);

  const { project, message, bidAmount, status, createdAt } = proposal;
  const isPending = status === 'pending';

  return (
    <div className={`fl-proposal-card ${status}`}>
      {/* ── Card body ──────────────────────────────────────── */}
      <div className="fl-proposal-body">
        <div className="fl-proposal-top">
          {/* Project info */}
          <div className="fl-project-info">
            <Link to={`/projects/${project?._id}`} className="fl-project-title">
              {project?.title || 'Project'}
            </Link>
            <div className="fl-project-meta">
              <span className={`badge badge-${project?.status || 'open'}`}>
                Project: {project?.status}
              </span>
              {project?.budget && (
                <span className="fl-project-budget">
                  Budget: {formatBudget(project.budget)}
                </span>
              )}
            </div>
          </div>

          {/* Bid + proposal status */}
          <div className="fl-bid-area">
            <div>
              <div className="fl-bid-amount">{formatBudget(bidAmount)}</div>
              <div className="fl-bid-label">your bid</div>
            </div>
            <span className={`badge badge-${status}`}>{status}</span>
          </div>
        </div>

        {/* Message preview */}
        <div
          className={`fl-proposal-message ${expanded ? 'expanded' : ''}`}
          onClick={() => setExpanded(p => !p)}
          title={expanded ? 'Click to collapse' : 'Click to expand'}
          style={{ cursor: 'pointer' }}
        >
          {message}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      {mode === 'view' && (
        <div className="fl-proposal-footer">
          <span className="fl-proposal-date">Submitted {formatDate(createdAt)}</span>
          {isPending && (
            <div className="fl-proposal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setMode('edit')}>
                ✏️ Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setMode('delete')}>
                🗑️ Delete
              </button>
            </div>
          )}
          {!isPending && (
            <div className="fl-proposal-actions">
              <Link to={`/projects/${project?._id}`} className="btn btn-ghost btn-sm">
                View Project →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Edit form ─────────────────────────────────────── */}
      {mode === 'edit' && (
        <EditForm
          proposal={proposal}
          onSave={(updated) => { onUpdated(updated); setMode('view'); }}
          onCancel={() => setMode('view')}
        />
      )}

      {/* ── Delete confirmation ────────────────────────────── */}
      {mode === 'delete' && (
        <DeleteConfirm
          proposalId={proposal._id}
          onConfirm={(id) => onDeleted(id)}
          onCancel={() => setMode('view')}
        />
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * FreelancerDashboard — hub for freelancers.
 *
 * Features:
 * - Stats: total / pending / accepted / rejected proposals
 * - Full proposals list with status badges
 * - Inline edit form (pending proposals only)
 * - Inline delete with confirmation (pending proposals only)
 * - Message expand/collapse toggle
 */
const FreelancerDashboard = () => {
  const { user } = useAuth();

  const [proposals, setProposals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // ── Fetch my proposals ───────────────────────────────────────
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const res = await api.get('/proposals/my');
        setProposals(res.data);
      } catch (err) {
        setError('Failed to load your proposals. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    proposals.length,
    pending:  proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  }), [proposals]);

  // ── Handlers for child updates ───────────────────────────────
  const handleUpdated = (updated) => {
    setProposals(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
  };

  const handleDeleted = (deletedId) => {
    setProposals(prev => prev.filter(p => p._id !== deletedId));
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* ── Welcome Header ────────────────────────────────── */}
        <div className="dashboard-welcome">
          <div>
            <div className="dashboard-greeting">Freelancer Dashboard</div>
            <h1 className="dashboard-title">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="dashboard-sub">
              Track your proposals and manage your work.
            </p>
          </div>
          <Link to="/projects" className="btn btn-primary">
            Browse Projects →
          </Link>
        </div>

        {/* ── Error ─────────────────────────────────────────── */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Stats row ─────────────────────────────────────── */}
        {!loading && (
          <div className="dashboard-stats">
            <div className="stat-item">
              <div className="stat-item-icon">📬</div>
              <div className="stat-item-value">{stats.total}</div>
              <div className="stat-item-label">Total Sent</div>
            </div>
            <div className="stat-item" style={{ '--item-color': 'var(--text-secondary)' }}>
              <div className="stat-item-icon">⏳</div>
              <div className="stat-item-value" style={{ color: 'var(--text-secondary)' }}>{stats.pending}</div>
              <div className="stat-item-label">Pending</div>
            </div>
            <div className="stat-item accepted">
              <div className="stat-item-icon">🎉</div>
              <div className="stat-item-value" style={{ color: 'var(--success)' }}>{stats.accepted}</div>
              <div className="stat-item-label">Accepted</div>
            </div>
            <div className="stat-item">
              <div className="stat-item-icon">❌</div>
              <div className="stat-item-value" style={{ color: 'var(--error)' }}>{stats.rejected}</div>
              <div className="stat-item-label">Rejected</div>
            </div>
          </div>
        )}

        {/* ── Proposals Section ─────────────────────────────── */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">My Proposals</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">
              Find More Projects →
            </Link>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : proposals.length === 0 ? (
            /* Empty state */
            <div className="empty-state card">
              <div className="empty-state-icon">🔭</div>
              <div className="empty-state-title">No proposals yet</div>
              <p className="text-muted text-sm">
                Browse open projects and submit your first proposal to get started.
              </p>
              <Link to="/projects" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                Browse Open Projects →
              </Link>
            </div>
          ) : (
            /* Proposals list */
            <div className="freelancer-proposals">
              <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-md)' }}>
                {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} submitted —{' '}
                click a message to expand it
              </p>

              {proposals.map((proposal) => (
                <ProposalCard
                  key={proposal._id}
                  proposal={proposal}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
