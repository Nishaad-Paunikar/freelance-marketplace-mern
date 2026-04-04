import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectCard.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatBudget = (budget) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });

/**
 * ProjectCard — displays a summary of a project.
 * Used on ProjectsPage and ClientDashboard.
 *
 * Props:
 *   project — full project object from the API
 *   actions — optional JSX rendered in the footer instead of "View →"
 */
const ProjectCard = ({ project, actions }) => {
  const { _id, title, description, budget, status, client, createdAt } = project;

  return (
    <div className="project-card card">
      {/* ── Header: status badge + budget ─────────────────── */}
      <div className="project-card-header">
        <span className={`badge badge-${status}`}>{status}</span>
        <div style={{ textAlign: 'right' }}>
          <div className="project-budget">{formatBudget(budget)}</div>
          <div className="project-budget-label">budget</div>
        </div>
      </div>

      {/* ── Title & description ───────────────────────────── */}
      <h3 className="project-card-title">{title}</h3>
      <p className="project-card-desc">{description}</p>

      {/* ── Footer: client info + CTA ─────────────────────── */}
      <div className="project-card-footer">
        {client && (
          <div className="project-client">
            <div className="project-client-avatar">
              {(client.name?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <div className="project-client-name">{client.name}</div>
              <div className="project-posted">{formatDate(createdAt)}</div>
            </div>
          </div>
        )}

        {/* Custom actions or default "View →" link */}
        {actions ?? (
          <Link to={`/projects/${_id}`} className="btn btn-secondary btn-sm">
            View →
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
