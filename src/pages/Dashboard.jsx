import { useState } from 'react';
import { Link } from 'react-router-dom';
import jobs from '../mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  STORAGE_KEYS,
  jobsFromIds,
} from '../utils/jobStorage.js';
import { formatDate } from '../utils/helpers.js';
import JobCard from '../components/JobCard.jsx';

/**
 * Dashboard.jsx
 * -------------
 * Basic user dashboard showing a welcome message, profile summary,
 * saved & applied jobs, and account info. Uses mock/local data only.
 */
export default function Dashboard() {
  const { user, logout } = useAuth();

  // Re-read on each mount so actions taken elsewhere show up here.
  const [savedJobs] = useState(() => jobsFromIds(jobs, STORAGE_KEYS.saved));
  const [appliedJobs] = useState(() => jobsFromIds(jobs, STORAGE_KEYS.applied));

  if (!user) return null; // Protected route redirects if not logged in.

  const firstName = user.fullName?.split(' ')[0] || 'there';
  const role = user.guest ? 'Guest account (demo)' : 'Job seeker';

  return (
    <div className="container section-pad dashboard-page">
      {/* Welcome banner */}
      <section className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">
            Welcome back, {firstName} <span aria-hidden="true">&#128075;</span>
          </h1>
          <p className="dash-welcome-sub">
            Here&rsquo;s what&rsquo;s happening with your job search today.
          </p>
        </div>
        <Link to="/" className="btn btn-light">
          Browse more jobs
        </Link>
      </section>

      {/* Stats */}
      <section className="stat-grid" aria-label="Account statistics">
        <div className="stat-card">
          <span className="stat-value">{jobs.length}</span>
          <span className="stat-label">Total jobs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{savedJobs.length}</span>
          <span className="stat-label">Saved jobs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{appliedJobs.length}</span>
          <span className="stat-label">Applications</span>
        </div>
      </section>

      <div className="dash-layout">
        {/* Main content */}
        <div className="dash-main">
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
                <p>
                  Tap the bookmark icon on any job to save it here for later.
                </p>
                <Link to="/" className="btn btn-outline btn-sm">
                  Browse jobs
                </Link>
              </div>
            )}
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <h2 className="dash-section-title">&#10004; Applications</h2>
              <span className="result-count">{appliedJobs.length} applied</span>
            </div>
            {appliedJobs.length > 0 ? (
              <div className="job-grid">
                {appliedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="empty-state compact">
                <div className="empty-icon" aria-hidden="true">&#9993;</div>
                <h3>No applications yet</h3>
                <p>
                  Apply to a job from its details page and track it right here.
                </p>
                <Link to="/" className="btn btn-outline btn-sm">
                  Find jobs
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: profile summary + account info */}
        <aside className="dash-side">
          <section className="profile-card">
            <div className="profile-avatar">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="profile-name">{user.fullName}</h3>
            <p className="profile-email">{user.email}</p>
            <span className="badge badge-green">{role}</span>
            {user.guest && (
              <p className="profile-note">
                You are using a guest demo session. Register to save your
                account.
              </p>
            )}
          </section>

          <section className="account-card">
            <h3 className="account-card-title">Account information</h3>
            <div className="account-row">
              <span className="account-label">Name</span>
              <span className="account-value">{user.fullName}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Email</span>
              <span className="account-value">{user.email}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Member since</span>
              <span className="account-value">
                {formatDate(user.joinedAt) || 'Today'}
              </span>
            </div>
            <div className="account-row">
              <span className="account-label">Account type</span>
              <span className="account-value">{role}</span>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-block btn-danger"
              onClick={logout}
            >
              Log out
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
