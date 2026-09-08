import { useState } from 'react';
import jobs from '../mockData.js';
import JobCard from '../components/JobCard.jsx';

/**
 * Home.jsx
 * --------
 * Landing page showing a prominent search bar and the list of available
 * jobs as JobCard components. Searching filters live by title, company,
 * keywords, skills, and description (case-insensitive).
 */
export default function Home() {
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();
  const filteredJobs = term
    ? jobs.filter((job) => {
        const haystack = [
          job.title,
          job.company,
          job.location,
          job.type,
          job.experience,
          job.salary,
          job.shortDescription,
          job.description,
          job.keywords.join(' '),
          job.skills.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      })
    : jobs;

  const handleSubmit = (event) => event.preventDefault();

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
            Browse {jobs.length}+ roles across frontend, backend, DevOps, data,
            and more — from leading companies.
          </p>

          <form className="search-bar" onSubmit={handleSubmit} role="search">
            <span className="search-icon" aria-hidden="true">&#128269;</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, skill or keyword — e.g. React, Node.js, DevOps"
              aria-label="Search jobs"
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => setSearch('')}
              >
                &#10005;
              </button>
            )}
          </form>

          <p className="search-hint">
            Tip: try <button type="button" className="hint-link" onClick={() => setSearch('React')}>React</button>,{' '}
            <button type="button" className="hint-link" onClick={() => setSearch('Node.js')}>Node.js</button> or{' '}
            <button type="button" className="hint-link" onClick={() => setSearch('Remote')}>Remote</button>
          </p>
        </div>
      </section>

      {/* Job list */}
      <section className="container section-pad">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              {term ? 'Search results' : 'Latest job openings'}
            </h2>
            <p className="section-sub">
              {term
                ? `${filteredJobs.length} job${filteredJobs.length === 1 ? '' : 's'} matching "${search.trim()}"`
                : 'Browse all available positions below'}
            </p>
          </div>
          <span className="result-count">{filteredJobs.length} jobs</span>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="job-grid">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">&#128269;</div>
            <h3>No jobs found</h3>
            <p>
              We couldn&rsquo;t find any jobs matching &ldquo;{search.trim()}&rdquo;.
              Try a different keyword like <strong>React</strong>,{' '}
              <strong>Node.js</strong>, or <strong>DevOps</strong>.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setSearch('')}
            >
              Clear search
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
