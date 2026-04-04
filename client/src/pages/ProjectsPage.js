import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import { useAuth } from '../context/AuthContext';
import './ProjectsPage.css';

const STATUS_FILTERS = [
  { label: 'All',       value: 'all'       },
  { label: 'Open',      value: 'open'      },
  { label: 'Assigned',  value: 'assigned'  },
  { label: 'Completed', value: 'completed' },
];

/**
 * ProjectsPage — public page listing all projects.
 * Supports live search by title and status filter tabs.
 */
const ProjectsPage = () => {
  const { isClient } = useAuth();

  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');

  // ── Fetch all projects ───────────────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // ── Client-side filter (no extra API calls) ──────────────────
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* ── Page Header ───────────────────────────────────── */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="page-title">Browse Projects</h1>
            <p className="page-subtitle">Find the perfect project to work on</p>
          </div>
          {isClient && (
            <Link to="/projects/new" className="btn btn-primary">
              + Post a Project
            </Link>
          )}
        </div>

        {/* ── Search + Filter toolbar ───────────────────────── */}
        <div className="projects-toolbar">
          {/* Search */}
          <div className="projects-search-wrapper">
            <span className="projects-search-icon">🔍</span>
            <input
              type="text"
              className="form-input projects-search-input"
              placeholder="Search projects by title or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search projects"
            />
          </div>

          {/* Status filter tabs */}
          <div className="filter-tabs" role="tablist">
            {STATUS_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                role="tab"
                aria-selected={statusFilter === value}
                className={`filter-tab ${statusFilter === value ? 'active' : ''}`}
                onClick={() => setStatus(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────── */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Loading ───────────────────────────────────────── */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="projects-results-info">
              Showing <strong>{filtered.length}</strong> of {projects.length} projects
              {search && <> matching "<strong>{search}</strong>"</>}
            </p>

            {/* Grid of project cards */}
            {filtered.length > 0 ? (
              <div className="projects-grid">
                {filtered.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔭</div>
                <div className="empty-state-title">No projects found</div>
                <p className="text-muted text-sm">
                  {search
                    ? 'Try a different search term or clear the filter.'
                    : 'No projects have been posted yet.'}
                </p>
                {isClient && (
                  <Link to="/projects/new" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                    Post the First Project
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
