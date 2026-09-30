import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createJob, listCompanies } from '../api/jobs.js';
import { useAuth } from '../context/AuthContext.jsx';
import { describeError, isOfflineError } from '../utils/formErrors.js';

/**
 * PostJob.jsx
 * -----------
 * The employer-only "Post a Job" form.
 *
 * This page is the clearest example of dynamic UI in the app: it is reached
 * from a Navbar link that employers alone can see, it sits behind a role guard
 * in App.jsx, and it renders a friendly "not allowed" panel if an employer is
 * not the one who opened it. The API enforces the same rule with
 * `protect, authorize('employer')`, so even a hand-typed URL cannot publish a
 * job as a jobseeker.
 *
 * Two backend details shape this form:
 *   • `company` must be the ObjectId of an existing company, so the field is a
 *     <select> filled from GET /companies rather than a free-text input;
 *   • `requirements` is an array of strings, entered here as one per line.
 */

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'remote', label: 'Remote' },
];

const EMPTY_FORM = {
  title: '',
  company: '',
  location: '',
  type: 'full-time',
  salaryMin: '',
  salaryMax: '',
  deadline: '',
  description: '',
  requirements: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const { isEmployer } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [companiesError, setCompaniesError] = useState('');
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- the company list -----------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    listCompanies()
      .then((rows) => {
        if (cancelled) return;
        setCompanies(rows);
        // Preselect the first company so the <select> is never empty.
        if (rows.length > 0) {
          setForm((prev) => ({ ...prev, company: prev.company || String(rows[0]._id) }));
        }
        setLoadingCompanies(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setCompaniesError(
          isOfflineError(error)
            ? 'Could not reach the API. Start the backend with "npm run dev" first.'
            : describeError(error, 'Could not load the company list.')
        );
        setLoadingCompanies(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // --- form plumbing --------------------------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  };

  /**
   * The same rules the Mongoose schema will apply — checked here first so the
   * user gets instant feedback instead of a round trip.
   */
  const validate = () => {
    const nextErrors = {};

    const requirementsList = form.requirements
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (form.title.trim().length < 3) {
      nextErrors.title = 'Title must be at least 3 characters.';
    }

    if (!form.company) {
      nextErrors.company = 'Pick a company.';
    }

    if (form.location.trim().length < 2) {
      nextErrors.location = 'Location is required.';
    }

    if (form.description.trim().length < 20) {
      nextErrors.description = 'Description must be at least 20 characters.';
    }

    if (requirementsList.length === 0) {
      nextErrors.requirements = 'Add at least one requirement (one per line).';
    }

    const min = Number(form.salaryMin);
    const max = Number(form.salaryMax);

    if (form.salaryMin === '' || Number.isNaN(min) || min < 0) {
      nextErrors.salaryMin = 'Enter a minimum salary (0 or more).';
    }

    if (form.salaryMax === '' || Number.isNaN(max) || max < 0) {
      nextErrors.salaryMax = 'Enter a maximum salary (0 or more).';
    } else if (!Number.isNaN(min) && max < min) {
      nextErrors.salaryMax = 'Maximum salary cannot be lower than the minimum.';
    }

    if (form.deadline) {
      const picked = new Date(form.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(picked.getTime())) {
        nextErrors.deadline = 'That is not a valid date.';
      } else if (picked <= today) {
        // The API requires deadline > postedDate.
        nextErrors.deadline = 'Pick a date in the future.';
      }
    }

    return { errors: nextErrors, requirementsList };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { errors: validationErrors, requirementsList } = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');

    try {
      const created = await createJob({
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: requirementsList,
        salaryMin: Number(form.salaryMin),
        salaryMax: Number(form.salaryMax),
        type: form.type,
        location: form.location.trim(),
        company: form.company,
        // Omit the key entirely when it was left blank (the field is optional).
        ...(form.deadline ? { deadline: new Date(form.deadline).toISOString() } : {}),
      });

      // Straight to the live listing — a nice confirmation that it worked.
      navigate(`/jobs/${created._id}`, { replace: true });
    } catch (error) {
      setFormError(describeError(error, 'Could not publish the job.'));
    } finally {
      setSubmitting(false);
    }
  };

  // --- guard (belt and braces: App.jsx already blocks this route) -----------
  if (!isEmployer) {
    return (
      <div className="container section-pad">
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">&#128274;</div>
          <h3>Employers only</h3>
          <p>
            Only accounts with the <strong>employer</strong> role can publish
            job openings. Log in with an employer account to use this form.
          </p>
          <Link to="/" className="btn btn-primary">
            &#8592; Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-pad">
      <Link to="/dashboard" className="back-link">
        &#8592; Back to dashboard
      </Link>

      <div className="form-card">
        <header className="form-card-head">
          <h1 className="form-title">Post a new job</h1>
          <p className="form-subtitle">
            Your posting is saved in MongoDB and appears on the home page
            immediately. You own it — only you (or an admin) can delete it later.
          </p>
        </header>

        {companiesError && (
          <div className="alert alert-error" role="alert">
            {companiesError}
          </div>
        )}

        {!companiesError && companies.length === 0 && !loadingCompanies && (
          <div className="alert alert-info" role="status">
            No companies exist yet. Create one first (POST /companies) so the job
            can be linked to it.
          </div>
        )}

        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Job title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Senior React Developer"
                value={form.title}
                onChange={handleChange}
                className={errors.title ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="company">Company</label>
              <select
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                className={errors.company ? 'input-error' : ''}
                disabled={submitting || loadingCompanies || companies.length === 0}
              >
                {loadingCompanies && <option value="">Loading…</option>}
                {!loadingCompanies && companies.length === 0 && (
                  <option value="">No companies available</option>
                )}
                {companies.map((company) => (
                  <option key={company._id} value={String(company._id)}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.company && <span className="field-error">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Karachi, Pakistan or Remote (Worldwide)"
                value={form.location}
                onChange={handleChange}
                className={errors.location ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.location && <span className="field-error">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Job type</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={submitting}
              >
                {JOB_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="salaryMin">Minimum salary (USD / year)</label>
              <input
                id="salaryMin"
                name="salaryMin"
                type="number"
                min="0"
                step="500"
                placeholder="60000"
                value={form.salaryMin}
                onChange={handleChange}
                className={errors.salaryMin ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.salaryMin && <span className="field-error">{errors.salaryMin}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="salaryMax">Maximum salary (USD / year)</label>
              <input
                id="salaryMax"
                name="salaryMax"
                type="number"
                min="0"
                step="500"
                placeholder="80000"
                value={form.salaryMax}
                onChange={handleChange}
                className={errors.salaryMax ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.salaryMax && <span className="field-error">{errors.salaryMax}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Application deadline (optional)</label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                className={errors.deadline ? 'input-error' : ''}
                disabled={submitting}
              />
              {errors.deadline && <span className="field-error">{errors.deadline}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job description</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              placeholder="Describe the role, the team and the day-to-day work (at least 20 characters)."
              value={form.description}
              onChange={handleChange}
              className={errors.description ? 'input-error' : ''}
              disabled={submitting}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements (one per line)</label>
            <textarea
              id="requirements"
              name="requirements"
              rows={6}
              placeholder={'3+ years with React\nStrong JavaScript fundamentals\nExperience with REST APIs'}
              value={form.requirements}
              onChange={handleChange}
              className={errors.requirements ? 'input-error' : ''}
              disabled={submitting}
            />
            {errors.requirements && (
              <span className="field-error">{errors.requirements}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish job'}
          </button>
        </form>
      </div>
    </div>
  );
}
