import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './PostProjectPage.css';

const MAX_DESC = 2000;

/**
 * PostProjectPage — client-only form to create a new project.
 * After success, redirects to client dashboard.
 */
const PostProjectPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title:       '',
    description: '',
    budget:      '',
  });
  const [error,   setError]   = useState('');
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (error) setError('');
  };

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.title.trim())
      errs.title = 'Project title is required.';
    else if (formData.title.trim().length < 5)
      errs.title = 'Title must be at least 5 characters.';

    if (!formData.description.trim())
      errs.description = 'Description is required.';
    else if (formData.description.trim().length < 20)
      errs.description = 'Please write at least 20 characters.';

    if (!formData.budget || Number(formData.budget) <= 0)
      errs.budget = 'Enter a valid budget greater than $0.';

    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/projects', {
        title:       formData.title.trim(),
        description: formData.description.trim(),
        budget:      Number(formData.budget),
      });
      // Redirect with success signal
      navigate('/dashboard/client', { state: { newProject: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const descLength = formData.description.length;
  const nearLimit  = descLength > MAX_DESC * 0.85;

  return (
    <div className="post-project-page">
      <div className="post-project-container">
        {/* ── Back link ─────────────────────────────────────── */}
        <Link to="/dashboard/client" className="post-project-back">
          ← Back to Dashboard
        </Link>

        <div className="post-project-card">
          {/* ── Header ────────────────────────────────────────── */}
          <div className="post-project-header">
            <h1 className="post-project-title">Post a New Project</h1>
            <p className="post-project-sub">
              Describe your project clearly to attract the best freelancers.
            </p>
          </div>

          {/* ── API Error ──────────────────────────────────────── */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* ── Form ──────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="form-group">
              <label htmlFor="proj-title" className="form-label">Project Title *</label>
              <input
                id="proj-title"
                type="text"
                name="title"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g. Build a React e-commerce website"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="proj-desc" className="form-label">Project Description *</label>
              <textarea
                id="proj-desc"
                name="description"
                className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe what you need in detail — technology stack, features, deliverables, timeline expectations…"
                rows={8}
                value={formData.description}
                onChange={handleChange}
                maxLength={MAX_DESC}
              />
              <div className={`char-counter ${nearLimit ? 'near-limit' : ''}`}>
                {descLength} / {MAX_DESC}
              </div>
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Budget */}
            <div className="form-group">
              <label htmlFor="proj-budget" className="form-label">Budget (USD) *</label>
              <input
                id="proj-budget"
                type="number"
                name="budget"
                className={`form-input ${errors.budget ? 'input-error' : ''}`}
                placeholder="e.g. 1500"
                min="1"
                step="1"
                value={formData.budget}
                onChange={handleChange}
              />
              <div className="budget-hint">
                Set a realistic budget. Freelancers will bid against this amount.
              </div>
              {errors.budget && <span className="form-error">{errors.budget}</span>}
            </div>

            {/* Tips */}
            <div className="post-project-tips">
              <div className="post-project-tips-title">💡 Tips for a great listing</div>
              <ul>
                <li>Be specific about the tech stack or tools required</li>
                <li>Include expected timeline or deadline</li>
                <li>Mention any relevant samples or references</li>
                <li>Set a fair budget to get quality proposals faster</li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="post-project-submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 'var(--space-xl)' }}
            >
              {loading
                ? <><span style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:8 }} />Publishing…</>
                : '🚀 Publish Project'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostProjectPage;
