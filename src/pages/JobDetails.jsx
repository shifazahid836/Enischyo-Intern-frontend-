import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { deleteJob, getJob } from '../api/jobs.js';
import { createApplication } from '../api/applications.js';
import { adaptJob } from '../utils/jobAdapter.js';
import {
  STORAGE_KEYS,
  isJobInList,
  toggleJobInList,
} from '../utils/jobStorage.js';
import {
  formatDate,
  formatDeadline,
  getInitials,
  typeBadgeClass,
} from '../utils/helpers.js';
import { describeError, isOfflineError } from '../utils/formErrors.js';

/**
 * JobDetails.jsx
 * --------------
 * Full details for a single job, loaded from GET /jobs/:id.
 *
 * The interesting part is the "who may do what" rendering, which mirrors the
 * rules enforced by the API:
 *
 *   • the APPLY button is rendered for jobseekers only. An employer or an
 *     admin never sees it (the backend would answer 403 anyway — the UI just
 *     does not offer an action that is guaranteed to fail);
 *   • applying opens a small form, because POST /applications requires a
 *     phone, a cover letter (30+ characters) and a resume URL — the API has no
 *     "one-click apply";
 *   • the DELETE button appears only for the employer who owns the posting, or
 *     for an admin (exactly the rule in routes/jobs.js).
 */

const EMPTY_APPLY_FORM = { phone: '', resumeURL: '', coverLetter: '' };

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isJobseeker, isAdmin } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [saved, setSaved] = useState(() => isJobInList(STORAGE_KEYS.saved, id));

  /**
   * The "already applied" flag is scoped to the ACCOUNT
   * (`techjobs_applied_ids:<userId>`), not to the browser, so two accounts
   * tested in the same browser cannot inherit each other's state.
   *
   * It is only a convenience: the applications collection in MongoDB remains
   * the source of truth, which is what the dashboard lists.
   */
  const appliedKey = user ? `${STORAGE_KEYS.applied}:${user.id}` : null;
  const [applied, setApplied] = useState(
    () => Boolean(appliedKey) && isJobInList(appliedKey, id)
  );

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyForm, setApplyForm] = useState(EMPTY_APPLY_FORM);
  const [applyErrors, setApplyErrors] = useState({});
  const [applyError, setApplyError] = useState('');
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- load the job ---------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setNotFound(false);

    getJob(id)
      .then((raw) => {
        if (cancelled) return;
        setJob(adaptJob(raw));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        // 400 = malformed id, 404 = no such job → both mean "nothing to show".
        if (err.status === 400 || err.status === 404) setNotFound(true);
        else setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // --- re-check the local flag when the account becomes known ---------------
  useEffect(() => {
    setApplied(Boolean(appliedKey) && isJobInList(appliedKey, id));
  }, [appliedKey, id]);

  // --- actions --------------------------------------------------------------
  const handleSaveToggle = () => {
    setSaved(toggleJobInList(STORAGE_KEYS.saved, job.id));
  };

  const validateApplyForm = () => {
    const errors = {};

    if (!applyForm.phone.trim()) {
      errors.phone = 'Phone number is required.';
    }

    if (!applyForm.resumeURL.trim()) {
      errors.resumeURL = 'Resume URL is required.';
    } else if (!/^https?:\/\//i.test(applyForm.resumeURL.trim())) {
      errors.resumeURL = 'The link must start with http:// or https://';
    }

    if (!applyForm.coverLetter.trim()) {
      errors.coverLetter = 'Please add a short cover letter.';
    } else if (applyForm.coverLetter.trim().length < 30) {
      errors.coverLetter = 'Please write at least 30 characters.';
    }

    return errors;
  };

  const handleApplySubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateApplyForm();
    setApplyErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setApplying(true);
    setApplyError('');

    try {
      await createApplication({
        job: job.id,
        // Name and e-mail come from the verified account, not from free text.
        applicantName: user.name,
        email: user.email,
        phone: applyForm.phone.trim(),
        resumeURL: applyForm.resumeURL.trim(),
        coverLetter: applyForm.coverLetter.trim(),
      });

      // Remember it locally (per account) so the Apply button is not offered
      // a second time on this browser.
      if (appliedKey && !isJobInList(appliedKey, job.id)) {
        toggleJobInList(appliedKey, job.id);
      }

      setApplied(true);
      setShowApplyForm(false);
      setApplyForm(EMPTY_APPLY_FORM);
    } catch (err) {
      // 403 (wrong role), 400 (validation) or a network problem.
      setApplyError(describeError(err, 'Could not submit your application.'));
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete this job posting? This cannot be undone.'
    );
    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteJob(job.id);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err);
      setDeleting(false);
    }
  };

  // --- early states ---------------------------------------------------------
  if (loading) {
    return (
      <div className="container section-pad">
        <div className="loader" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <p>Loading job…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
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

  if (error || !job) {
    return (
      <div className="container section-pad">
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">&#128225;</div>
          <h3>Could not load this job</h3>
          <p>
            {isOfflineError(error)
              ? 'The API server is not answering. Start it with "npm run dev" inside the backend folder.'
              : error?.message}
          </p>
          <Link to="/" className="btn btn-outline">
            &#8592; Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(user && job.employerId === user.id);
  const canManage = isOwner || isAdmin;

  const descriptionParagraphs = job.description
    .split(/\n{2,}/)
    .filter((p) => p.trim());

  const deadline = formatDeadline(job.deadline);

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
              <span className="detail-company-link">@ {job.company}</span>
              <span className="dot-sep">•</span>
              Posted {formatDate(job.postedDate)}
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
            <span className={`badge ${typeBadgeClass(job.typeValue || job.type)}`}>
              {job.type}
            </span>
          </div>
          <div className="fact">
            <span className="fact-label">&#128176; Salary</span>
            <span className="fact-value salary">{job.salary}</span>
          </div>
          {deadline && (
            <div className="fact">
              <span className="fact-label">&#128197; Apply before</span>
              <span className="fact-value">{deadline}</span>
            </div>
          )}
        </div>

        {/* --- Application area: what you see depends on WHO you are ---------- */}
        {/* Job seekers only: an employer must never be told that "your
            application has been submitted". */}
        {isJobseeker && applied && (
          <div className="alert alert-success" role="status">
            &#10004; Your application for <strong>{job.title}</strong> at{' '}
            {job.company} has been submitted. You can track it on your dashboard.
          </div>
        )}

        {applyError && (
          <div className="alert alert-error" role="alert">
            {applyError}
          </div>
        )}

        {/* Jobseeker: the only role that may apply */}
        {isJobseeker && !applied && (
          <>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => setShowApplyForm((prev) => !prev)}
            >
              {showApplyForm ? 'Cancel' : 'Apply now'}
            </button>

            {showApplyForm && (
              <form className="apply-panel" onSubmit={handleApplySubmit} noValidate>
                <h3 className="apply-title">Apply for {job.title}</h3>
                <p className="apply-note">
                  Applying as <strong>{user.name}</strong> ({user.email})
                </p>

                <div className="form-group">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={applyForm.phone}
                    onChange={(event) =>
                      setApplyForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className={applyErrors.phone ? 'input-error' : ''}
                    disabled={applying}
                  />
                  {applyErrors.phone && (
                    <span className="field-error">{applyErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="resumeURL">Resume link</label>
                  <input
                    id="resumeURL"
                    name="resumeURL"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={applyForm.resumeURL}
                    onChange={(event) =>
                      setApplyForm((prev) => ({ ...prev, resumeURL: event.target.value }))
                    }
                    className={applyErrors.resumeURL ? 'input-error' : ''}
                    disabled={applying}
                  />
                  {applyErrors.resumeURL && (
                    <span className="field-error">{applyErrors.resumeURL}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="coverLetter">Cover letter</label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    rows={5}
                    placeholder="Why are you a great fit for this role? (at least 30 characters)"
                    value={applyForm.coverLetter}
                    onChange={(event) =>
                      setApplyForm((prev) => ({
                        ...prev,
                        coverLetter: event.target.value,
                      }))
                    }
                    className={applyErrors.coverLetter ? 'input-error' : ''}
                    disabled={applying}
                  />
                  {applyErrors.coverLetter && (
                    <span className="field-error">{applyErrors.coverLetter}</span>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={applying}>
                  {applying ? 'Submitting…' : 'Submit application'}
                </button>
              </form>
            )}
          </>
        )}

        {applied && isJobseeker && (
          <button type="button" className="btn btn-success btn-lg" disabled>
            &#10004; Applied
          </button>
        )}

        {/* Signed out */}
        {!user && (
          <div className="alert alert-info" role="status">
            Please{' '}
            <Link to="/login" state={{ from: `/jobs/${job.id}` }}>
              log in
            </Link>{' '}
            or{' '}
            <Link to="/register" state={{ from: `/jobs/${job.id}` }}>
              create an account
            </Link>{' '}
            as a job seeker to apply for this role.
          </div>
        )}

        {/* Employer / admin */}
        {user && !isJobseeker && (
          <div className="alert alert-info" role="status">
            You are signed in as <strong>{user.role}</strong>. Only job seeker
            accounts can apply for jobs.
          </div>
        )}

        {/* Owner or admin may delete the posting (same rule as the API) */}
        {canManage && (
          <div className="manage-row">
            {isOwner && <span className="badge badge-green">Your posting</span>}
            <button
              type="button"
              className="btn btn-outline btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete job'}
            </button>
          </div>
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

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <section className="detail-section">
              <h2 className="detail-section-title">What we are looking for</h2>
              <ul className="check-list">
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="detail-side">
          <section className="company-box">
            <h3 className="company-box-title">About {job.company}</h3>
            <p className="company-box-text">{job.companyInfo}</p>

            {job.companyWebsite && (
              <div className="company-box-row">
                <span className="company-box-label">Website</span>
                <span className="company-box-value">
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {job.companyWebsite.replace(/^https?:\/\//, '')}
                  </a>
                </span>
              </div>
            )}

            <div className="company-box-row">
              <span className="company-box-label">Location</span>
              <span className="company-box-value">{job.location}</span>
            </div>
            <div className="company-box-row">
              <span className="company-box-label">Posted</span>
              <span className="company-box-value">{formatDate(job.postedDate)}</span>
            </div>

            {isJobseeker && !applied && (
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => {
                  setShowApplyForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Apply for this job
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
