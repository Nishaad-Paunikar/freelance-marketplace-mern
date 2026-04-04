import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

/**
 * LandingPage — hero section shown to all visitors.
 * Authenticated users see a CTA to their dashboard.
 */
const LandingPage = () => {
  const { isAuthenticated, isClient, isFreelancer } = useAuth();

  const dashboardLink = isClient
    ? '/dashboard/client'
    : isFreelancer
    ? '/dashboard/freelancer'
    : null;

  return (
    <div className="landing-page">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-content">
          <div className="hero-badge">
            <span>✨</span> The Future of Freelancing
          </div>

          <h1 className="hero-title">
            Connect. Collaborate.<br />
            <span className="gradient-text">Get Things Done.</span>
          </h1>

          <p className="hero-subtitle">
            A marketplace where top clients post projects and skilled freelancers
            compete to bring them to life. No fluff — just results.
          </p>

          <div className="hero-cta">
            {isAuthenticated ? (
              <>
                <Link to="/projects" className="btn btn-primary btn-lg">
                  Browse Projects
                </Link>
                <Link to={dashboardLink} className="btn btn-secondary btn-lg">
                  My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start for Free →
                </Link>
                <Link to="/projects" className="btn btn-secondary btn-lg">
                  Browse Projects
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="landing-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Projects Posted</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Skilled Freelancers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">$5M+</div>
              <div className="stat-label">Paid Out</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <p className="section-subtitle text-center text-muted">
            Three simple steps to get started
          </p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📝</div>
              <div className="step-number">01</div>
              <h3 className="step-title">Post a Project</h3>
              <p className="step-desc text-muted">
                Clients describe their project, set a budget, and publish it instantly.
              </p>
            </div>

            <div className="step-connector" />

            <div className="step-card">
              <div className="step-icon">💼</div>
              <div className="step-number">02</div>
              <h3 className="step-title">Receive Proposals</h3>
              <p className="step-desc text-muted">
                Freelancers submit competitive proposals with their bid and pitch.
              </p>
            </div>

            <div className="step-connector" />

            <div className="step-card">
              <div className="step-icon">🚀</div>
              <div className="step-number">03</div>
              <h3 className="step-title">Hire & Complete</h3>
              <p className="step-desc text-muted">
                Accept the best proposal and mark the project complete when done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="landing-cta-section">
          <div className="container landing-cta-inner">
            <h2 className="cta-title">Ready to get started?</h2>
            <p className="cta-sub text-muted">Join thousands of clients and freelancers today.</p>
            <div className="hero-cta">
              <Link to="/register?role=client" className="btn btn-primary btn-lg">
                I'm Hiring
              </Link>
              <Link to="/register?role=freelancer" className="btn btn-secondary btn-lg">
                I'm a Freelancer
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
