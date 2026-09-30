import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { listJobs } from '../api/jobs.js';
import { listApplications } from '../api/applications.js';
import { adaptJobs } from '../utils/jobAdapter.js';
import { STORAGE_KEYS, getJobIds } from '../utils/jobStorage.js';
import { formatDate } from '../utils/helpers.js';
import { describeError, isOfflineError } from '../utils/formErrors.js';
import JobCard from '../components/JobCard.jsx';

/**
 * Dashboard.jsx
 * -------------
 * A role-aware summary of the logged-in account, built from real API data:
 *
 *   • the open jobs come from GET /jobs (needed to turn the locally saved ids
 *     back into full cards);
 *   • "My applications" comes from GET /applications, filtered by the account
 *     e-mail — the API has no /applications/me route yet (see README);
 *   • "My job postings" filters the same job list by `employer`, which is the
 *     id the backend stored from the JWT when the job was created;
 *   • the change-password form calls PATCH /auth/change-password and swaps in
 *     the fresh token the API returns.
 */

/** Colour a status the same way the API names it. */
const STATUS_BADGE = {
  pending: 'badge-amber',
  reviewed: 'badge-blue',
  accepted: 'badge-green',
  rejected: 'badge-rose',
};

const EMPTY_PASSWORD_FORM = { oldPassword: '', newPassword: '', confirmPassword: '' };

export default function Dashboard() {
  const { user, changePassword, logout } = useAuth();

  const [savedJobs, setSavedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myPostings, setMyPostings] = useState([]);
  const [openJobCount, setOpenJobCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // change-password form
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const userId = user?.id;
  const userEmail = user?.email?.toLowerCase();

  // --- load everything the page needs, in parallel --------------------------
  useEffect(() => {
    if (!userId) return undefined;

    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([listJobs({ isActive: 'true' }), listApplications()])
      .then(([jobsResult, applications]) => {
        if (cancelled) return;

        const allJobs = adaptJobs(jobsResult.jobs);
        const savedIds = getJobIds(STORAGE_KEYS.saved);

        setOpenJobCount(allJobs.length);
        setSavedJobs(allJobs.filter((job) => savedIds.includes(job.id)));
        setMyPostings(allJobs.filter((job) => job.employerId === String(userId)));

        // GET /applications is public, so narrow it down to this account.
        setMyApplications(
          (applications || []).filter(
            (application) => application.email?.toLowerCase() === userEmail
          )
        );

        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, userEmail]);

  // --- change password ------------------------------------------------------
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    setPasswordError('');
    setPasswordMessage('');
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const errors = {};

    if (!passwordForm.oldPassword) {
      errors.oldPassword = 'Enter your current password.';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Enter a new password.';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters.';
    } else if (passwordForm.newPassword === passwordForm.oldPassword) {
      errors.newPassword = 'The new password must be different.';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setChangingPassword(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setPasswordMessage('Password changed. Your new token has been saved.');
    } catch (err) {
      setPasswordError(describeError(err, 'Could not change the password.'));
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null; // the protected route redirects if not logged in

  const firstName = user.name?.split(' ')[0] || 'there';
  const roleLabel =
    user.role === 'employer'
      ? 'Employer'
      : user.role === 'admin'
        ? 'Administrator'
        : 'Job seeker';

  return (
    <div className="container section-pad dashboard-page">
      {/* Welcome banner */}
      <section className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">
            Welcome back, {firstName} <span aria-hidden="true">&#128075;</span>
          </h1>
          <p className="dash-welcome-sub">
            You are signed in as <strong>{roleLabel}</strong>.
            {user.role === 'employer'
              ? ' Manage the roles you have published below.'
              : ' Here is what is happening with your job search today.'}
          </p>
        </div>
        {user.role === 'employer' ? (
          <Link to="/post-job" className="btn btn-light">
            Post a new job
          </Link>
        ) : (
          <Link to="/" className="btn btn-light">
            Browse more jobs
          </Link>
        )}
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          {isOfflineError(error)
            ? 'Could not reach the API. Start the backend with "npm run dev" and reload this page.'
            : describeError(error, 'Could not load your dashboard.')}
        </div>
      )}

      {loading ? (
        <div className="loader" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <p>Loading your dashboard…</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <section className="stat-grid" aria-label="Account statistics">
            <div className="stat-card">
              <span className="stat-value">{openJobCount}</span>
              <span className="stat-label">Open jobs</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {user.role === 'employer' ? myPostings.length : savedJobs.length}
              </span>
              <span className="stat-label">
                {user.role === 'employer' ? 'Your postings' : 'Saved jobs'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{myApplications.length}</span>
              <span className="stat-label">Applications</span>
            </div>
          </section>

          <div className="dash-layout">
            {/* Main content */}
            <div className="dash-main">
              {/* --- Employer: own postings ------------------------------- */}
              {user.role === 'employer' && (
                <section className="dash-section">
                  <div className="dash-section-head">
                    <h2 className="dash-section-title">&#128188; Your job postings</h2>
                    <span className="result-count">{myPostings.length} posted</span>
                  </div>
                  {myPostings.length > 0 ? (
                    <div className="job-grid">
                      {myPostings.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state compact">
                      <div className="empty-icon" aria-hidden="true">&#128188;</div>
                      <h3>You have not posted a job yet</h3>
                      <p>Publish your first opening and it will appear on the home page.</p>
                      <Link to="/post-job" className="btn btn-primary btn-sm">
                        Post a job
                      </Link>
                    </div>
                  )}
                </section>
              )}

              {/* --- Applications (any role) ------------------------------ */}
              <section className="dash-section">
                <div className="dash-section-head">
                  <h2 className="dash-section-title">&#10004; My applications</h2>
                  <span className="result-count">{myApplications.length} total</span>
                </div>

                {myApplications.length > 0 ? (
                  <div className="list-card">
                    {myApplications.map((application) => (
                      <div className="list-row" key={application._id}>
                        <div className="list-row-main">
                          <Link
                            to={`/jobs/${application.job?._id}`}
                            className="list-row-title"
                          >
                            {application.job?.title || 'Job removed'}
                          </Link>
                          <span className="list-row-meta">
                            {application.job?.company?.name || 'Unknown company'}
                            <span className="dot-sep">•</span>
                            Applied {formatDate(application.appliedAt)}
                          </span>
                        </div>
                        <span
                          className={`badge ${STATUS_BADGE[application.status] || 'badge-slate'}`}
                        >
                          {application.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state compact">
                    <div className="empty-icon" aria-hidden="true">&#9993;</div>
                    <h3>No applications yet</h3>
                    <p>
                      Apply to a job from its details page and it will show up
                      here automatically.
                    </p>
                    <Link to="/" className="btn btn-outline btn-sm">
                      Find jobs
                    </Link>
                  </div>
                )}
              </section>

              {/* --- Saved jobs (not for employers) ----------------------- */}
              {user.role !== 'employer' && (
                <section className="dash-section">
                  <div className="dash-section-head">
                    <h2 className="dash-section-title">&#128190; Saved jobs</h2>
                    <span className="result-count">{savedJobs.length} saved</span>
                  </div>
                  {savedJobs.length > 0 ? (
                    <div className="job-grid">
                      {savedJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state compact">
                      <div className="empty-icon" aria-hidden="true">&#9734;</div>
                      <h3>No saved jobs yet</h3>
                      <p>Tap the bookmark icon on any job to save it here for later.</p>
                      <Link to="/" className="btn btn-outline btn-sm">
                        Browse jobs
                      </Link>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Sidebar: profile summary + account info + password */}
            <aside className="dash-side">
              <section className="profile-card">
                <div className="profile-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 className="profile-name">{user.name}</h3>
                <p className="profile-email">{user.email}</p>
                <span
                  className={
                    user.role === 'employer' ? 'badge badge-violet' : 'badge badge-green'
                  }
                >
                  {roleLabel}
                </span>
              </section>

              <section className="account-card">
                <h3 className="account-card-title">Account information</h3>
                <div className="account-row">
                  <span className="account-label">Name</span>
                  <span className="account-value">{user.name}</span>
                </div>
                <div className="account-row">
                  <span className="account-label">Email</span>
                  <span className="account-value">{user.email}</span>
                </div>
                <div className="account-row">
                  <span className="account-label">Member since</span>
                  <span className="account-value">
                    {formatDate(user.createdAt) || 'Today'}
                  </span>
                </div>
                <div className="account-row">
                  <span className="account-label">Account type</span>
                  <span className="account-value">{roleLabel}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-block btn-danger"
                  onClick={logout}
                >
                  Log out
                </button>
              </section>

              {/* Change password — PATCH /auth/change-password */}
              <section className="account-card">
                <h3 className="account-card-title">Change password</h3>

                {passwordMessage && (
                  <div className="alert alert-success" role="status">
                    {passwordMessage}
                  </div>
                )}
                {passwordError && (
                  <div className="alert alert-error" role="alert">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div className="form-group">
                    <label htmlFor="oldPassword">Current password</label>
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      className={passwordErrors.oldPassword ? 'input-error' : ''}
                      disabled={changingPassword}
                    />
                    {passwordErrors.oldPassword && (
                      <span className="field-error">{passwordErrors.oldPassword}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className={passwordErrors.newPassword ? 'input-error' : ''}
                      disabled={changingPassword}
                    />
                    {passwordErrors.newPassword && (
                      <span className="field-error">{passwordErrors.newPassword}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm new password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={passwordErrors.confirmPassword ? 'input-error' : ''}
                      disabled={changingPassword}
                    />
                    {passwordErrors.confirmPassword && (
                      <span className="field-error">
                        {passwordErrors.confirmPassword}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
