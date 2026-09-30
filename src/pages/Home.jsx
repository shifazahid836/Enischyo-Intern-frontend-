import { useEffect, useState } from 'react';
import JobCard from '../components/JobCard.jsx';
import { listJobs } from '../api/jobs.js';
import { adaptJobs } from '../utils/jobAdapter.js';
import { isOfflineError } from '../utils/formErrors.js';

/**
 * Home.jsx
 * --------
 * The job list is now REAL data from MongoDB, fetched with
 * GET /jobs?keyword=…&type=…&isActive=true.
 *
 * Search is server-side now: instead of filtering an imported array in the
 * browser, the typed keyword is sent to the backend, which runs a
 * case-insensitive regex over title and description. Two consequences worth
 * knowing:
 *
 *   • the request is DEBOUNCED (350 ms). Without it, typing "React" would fire
 *     five requests, one per keystroke.
 *   • every request is attached to an AbortController, so when a newer request
 *     starts the older one is cancelled. Without that, a slow "Re" response
 *     could arrive AFTER the "React" response and overwrite it with stale rows.
 *
 * `isActive=true` is passed so the page only lists jobs that are still open.
 */

const TYPE_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'remote', label: 'Remote' },
];

const KEYWORD_DEBOUNCE_MS = 350;

export default function Home() {
  const [keyword, setKeyword] = useState(''); // what is in the box right now
  const [type, setType] = useState('');
  const [activeKeyword, setActiveKeyword] = useState(''); // the debounced value

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- debounce the keyword -------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveKeyword(keyword.trim());
    }, KEYWORD_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [keyword]);

  // --- ask the backend whenever the filters change --------------------------
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    listJobs(
      { keyword: activeKeyword, type, isActive: 'true' },
      { signal: controller.signal }
    )
      .then(({ jobs: rows }) => {
        setJobs(adaptJobs(rows));
        setLoading(false);
      })
      .catch((err) => {
        // A cancelled request is expected (a newer one replaced it) → ignore.
        if (err.name === 'AbortError') return;

        setError(err);
        setJobs([]);
        setLoading(false);
      });

    return () => controller.abort(); // cancel on unmount / next filter change
  }, [activeKeyword, type]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Enter applies the search immediately instead of waiting for the debounce.
    setActiveKeyword(keyword.trim());
  };

  const clearFilters = () => {
    setKeyword('');
    setActiveKeyword('');
    setType('');
  };

  const hasFilters = Boolean(activeKeyword || type);
  const resultLabel = `${jobs.length} job${jobs.length === 1 ? '' : 's'}`;

  return (
    <div className="home-page">
      {/* Hero + search */}
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow">&#128640; Your tech career starts here</span>
          <h1 className="hero-title">
            Find the perfect <span className="hero-highlight">tech job</span>
          </h1>
          <p className="hero-subtitle">
            Live openings pulled straight from our database — frontend, backend,
            DevOps, data and more, from companies hiring right now.
          </p>

          <form className="search-bar" onSubmit={handleSubmit} role="search">
            <span className="search-icon" aria-hidden="true">&#128269;</span>
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search by title or keyword — e.g. React, Node.js, PostgreSQL"
              aria-label="Search jobs"
            />
            {keyword && (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => setKeyword('')}
              >
                &#10005;
              </button>
            )}
          </form>

          <p className="search-hint">
            Tip: try{' '}
            <button type="button" className="hint-link" onClick={() => setKeyword('React')}>React</button>,{' '}
            <button type="button" className="hint-link" onClick={() => setKeyword('Node.js')}>Node.js</button> or{' '}
            <button type="button" className="hint-link" onClick={() => setType('remote')}>Remote</button>
          </p>
        </div>
      </section>

      {/* Job list */}
      <section className="container section-pad">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              {hasFilters ? 'Search results' : 'Latest job openings'}
            </h2>
            <p className="section-sub">
              {hasFilters
                ? `${resultLabel} matching your filters`
                : 'Browse all open positions below'}
            </p>
          </div>

          <div className="filter-row">
            <label className="filter-label" htmlFor="type-filter">
              Job type
            </label>
            <select
              id="type-filter"
              className="filter-select"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              {TYPE_FILTERS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="result-count">{loading ? '…' : resultLabel}</span>
          </div>
        </div>

        {loading ? (
          <div className="loader" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <p>Loading jobs…</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">&#128225;</div>
            <h3>Could not load jobs</h3>
            <p>
              {isOfflineError(error)
                ? 'The API server is not answering. Start it with "npm run dev" inside the backend folder (http://localhost:5000) and try again.'
                : error.message}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveKeyword((prev) => `${prev} `.trim())}
            >
              Try again
            </button>
          </div>
        ) : jobs.length > 0 ? (
          <div className="job-grid">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">&#128269;</div>
            <h3>No jobs found</h3>
            <p>
              {hasFilters
                ? 'No open position matches these filters. Try a different keyword or job type.'
                : 'There are no open positions right now. Please check back soon.'}
            </p>
            {hasFilters && (
              <button type="button" className="btn btn-outline" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
