import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import jobs from '../mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  STORAGE_KEYS,
  isJobInList,
  toggleJobInList,
} from '../utils/jobStorage.js';
import { getInitials, formatDate, typeBadgeClass } from '../utils/helpers.js';

/**
 * JobDetails.jsx
 * --------------
 * Full details for a single job selected from the route param /jobs/:id.
 * Includes an Apply action (simulated) and a Save bookmark toggle.
 */
export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const job = jobs.find((item) => item.id === Number(id));

  const [applied, setApplied] = useState(() =>
    isJobInList(STORAGE_KEYS.applied, Number(id))
  );
  const [saved, setSaved] = useState(() =>
    isJobInList(STORAGE_KEYS.saved, Number(id))
  );
  const [showApplySuccess, setShowApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(false);

  if (!job) {
    return (
      <div className="container section-pad">
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">&#128260;</div>
          <h3>Job not found</h3>
          <p>
            Sorry, we couldn&rsquo;t find the job you were looking for. It may
            have been removed or the link is incorrect.
          </p>
          <Link to="/" className="btn btn-primary">
            &#8592; Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  const descriptionParagraphs = job.description
    .split(/\n{2,}/)
    .filter((p) => p.trim());

  const handleApply = () => {
    if (!user) {
      setApplyError(true);
      setShowApplySuccess(false);
      return;
    }
    setApplyError(false);
    toggleJobInList(STORAGE_KEYS.applied, job.id);
    setApplied(true);
    setShowApplySuccess(true);
  };

  const handleSaveToggle = () => {
    const nowSaved = toggleJobInList(STORAGE_KEYS.saved, job.id);
    setSaved(nowSaved);
  };

  return (
    <div className="container section-pad">
      {/* Breadcrumb / back link */}
      <Link to="/" className="back-link">
        &#8592; Back to all jobs
      </Link>

      {/* Hero card */}
      <section className="detail-hero">
        <div className="detail-hero-main">
          <div className="job-logo job-logo-lg">{getInitials(job.company)}</div>
          <div>
            <h1 className="detail-title">{job.title}</h1>
            <p className="detail-company">
              <Link to="/" className="detail-company-link">@ {job.company}</Link>
              <span className="dot-sep">•</span>
              Posted {formatDate(job.postedDate) || job.postedDate}
            </p>
          </div>
          <button
            type="button"
            className={`bookmark-btn bookmark-lg ${saved ? 'saved' : ''}`}
            onClick={handleSaveToggle}
            aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
          >
            {saved ? '\u2605 Saved' : '\u2606 Save job'}
          </button>
        </div>

        <div className="detail-facts">
          <div className="fact">
            <span className="fact-label">&#128205; Location</span>
            <span className="fact-value">{job.location}</span>
          </div>
          <div className="fact">
            <span className="fact-label">&#9201; Job type</span>
            <span className={`badge ${typeBadgeClass(job.type)}`}>{job.type}</span>
          </div>
          <div className="fact">
            <span className="fact-label">&#128200; Experience</span>
            <span className="fact-value">{job.experience}</span>
          </div>
          <div className="fact">
            <span className="fact-label">&#128176; Salary</span>
            <span className="fact-value salary">{job.salary}</span>
          </div>
        </div>

        {showApplySuccess && (
          <div className="alert alert-success" role="status">
            &#10004; Your application for <strong>{job.title}</strong> at{' '}
            {job.company} has been submitted successfully. You can track it on
            your dashboard.
          </div>
        )}
        {applyError && (
          <div className="alert alert-error" role="alert">
            Please{' '}
            <Link to="/login" state={{ from: `/jobs/${job.id}` }}>
              log in
            </Link>{' '}
            or{' '}
            <Link to="/register" state={{ from: `/jobs/${job.id}` }}>
              create an account
            </Link>{' '}
            before applying.
          </div>
        )}

        {!applied ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={handleApply}>
            Apply now
          </button>
        ) : (
          <button type="button" className="btn btn-success btn-lg" disabled>
            &#10004; Applied
          </button>
        )}
      </section>

      <div className="detail-grid">
        <div className="detail-body">
          {/* About */}
          <section className="detail-section">
            <h2 className="detail-section-title">About this role</h2>
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={index} className="detail-paragraph">
                {paragraph}
              </p>
            ))}
          </section>

          {/* Responsibilities */}
          <section className="detail-section">
            <h2 className="detail-section-title">Responsibilities</h2>
            <ul className="check-list">
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Skills */}
          <section className="detail-section">
            <h2 className="detail-section-title">Required skills</h2>
            <div className="skills-list">
              {job.skills.map((skill) => (
                <span key={skill} className="skill-chip">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Keywords */}
          <section className="detail-section">
            <h2 className="detail-section-title">Tags</h2>
            <div className="tags">
              {job.keywords.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="detail-side">
          <section className="company-box">
            <h3 className="company-box-title">About {job.company}</h3>
            <p className="company-box-text">{job.companyInfo}</p>
            <div className="company-box-row">
              <span className="company-box-label">Company</span>
              <span className="company-box-value">{job.company}</span>
            </div>
            <div className="company-box-row">
              <span className="company-box-label">Location</span>
              <span className="company-box-value">{job.location}</span>
            </div>
            <div className="company-box-row">
              <span className="company-box-label">Posted</span>
              <span className="company-box-value">
                {formatDate(job.postedDate) || job.postedDate}
              </span>
            </div>
            <button type="button" className="btn btn-outline btn-block" onClick={handleApply}>
              Apply for this job
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
