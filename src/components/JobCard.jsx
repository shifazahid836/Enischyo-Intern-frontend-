import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  STORAGE_KEYS,
  isJobInList,
  toggleJobInList,
} from '../utils/jobStorage.js';
import { getInitials, typeBadgeClass } from '../utils/helpers.js';

/**
 * JobCard.jsx
 * -----------
 * Reusable card that summarises a single job and links to its details page.
 * Includes a small "Save / Unsave" bookmark toggle persisted in localStorage.
 */
export default function JobCard({ job }) {
  const [saved, setSaved] = useState(() =>
    isJobInList(STORAGE_KEYS.saved, job.id)
  );

  const handleSaveToggle = (event) => {
    event.preventDefault();
    const nowSaved = toggleJobInList(STORAGE_KEYS.saved, job.id);
    setSaved(nowSaved);
  };

  const badges = job.keywords.slice(0, 3);

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div className="job-logo">{getInitials(job.company)}</div>
        <div className="job-card-heading">
          <h3 className="job-card-title">{job.title}</h3>
          <p className="job-card-company">{job.company}</p>
        </div>
        <button
          type="button"
          className={`bookmark-btn ${saved ? 'saved' : ''}`}
          aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
          title={saved ? 'Saved' : 'Save job'}
          onClick={handleSaveToggle}
        >
          {saved ? '\u2605' : '\u2606'}
        </button>
      </div>

      <div className="job-card-meta">
        <span className="meta-item">&#128205; {job.location}</span>
        <span className={`badge ${typeBadgeClass(job.type)}`}>{job.type}</span>
        <span className="badge badge-slate">{job.experience}</span>
      </div>

      <p className="job-card-salary">{job.salary}</p>
      <p className="job-card-desc">{job.shortDescription}</p>

      {badges.length > 0 && (
        <div className="tags">
          {badges.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="job-card-footer">
        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
        <span className="posted-date">Posted {job.postedDate}</span>
      </div>
    </article>
  );
}
