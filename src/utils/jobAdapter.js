/**
 * utils/jobAdapter.js
 * -------------------
 * Translates the API's job document into the shape the UI components expect.
 *
 * Why is this needed? The MongoDB document and the old mock data do not agree:
 *
 *   mock data                     API (models/Job.js)
 *   ----------------------------  -------------------------------------------
 *   id: 1 (number)                _id: "6543…" (ObjectId string)
 *   company: "TechCorp" (string)  company: { _id, name, description, … }
 *   salary: "$60,000 - $80,000"   salaryMin: 60000, salaryMax: 80000
 *   keywords: ["React", …]        requirements: ["React", "Node.js", …]
 *   experience: "2-4 years"       (no such field)
 *
 * Doing the mapping in ONE place means components never have to know about
 * `_id` vs `id` or about the nested company document — and if the API shape
 * changes, only this file has to change.
 */

import { formatSalaryRange, truncateText } from './helpers.js';

/**
 * Turns "full-time" into "Full-time" for display. The raw value stays in
 * `typeValue` because that is what the API filter expects.
 *
 * Only the first letter is upper-cased, so "part-time" becomes "Part-time"
 * rather than "Part-Time".
 *
 * @param {string} type
 * @returns {string}
 */
function formatType(type = '') {
  const clean = String(type).trim().replace(/\s+/g, '-');
  if (!clean) return '';

  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

/**
 * Safely reads a value from a Mongoose ObjectId reference, which arrives
 * either as a populated object ({ _id, name, … }) or as a plain id string.
 *
 * @param {object|string|null|undefined} ref
 * @param {string} key
 * @param {*} fallback
 */
function readRef(ref, key, fallback = null) {
  if (ref && typeof ref === 'object') return ref[key] ?? fallback;
  return fallback;
}

/**
 * @param {object} job a raw job document from GET /jobs
 * @returns {object} the view model consumed by JobCard / JobDetails
 */
export function adaptJob(job) {
  if (!job) return null;

  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const companyName = readRef(job.company, 'name', 'Unknown company');
  const description = job.description || '';

  return {
    // --- identity ---
    id: String(job._id ?? job.id ?? ''),
    employerId: job.employer ? String(job.employer) : null,

    // --- headline ---
    title: job.title || 'Untitled role',
    company: companyName,
    companyId: readRef(job.company, '_id'),
    companyInfo:
      readRef(job.company, 'description') ||
      `${companyName} has not added a company description yet.`,
    companyLogo: readRef(job.company, 'logo'),
    companyWebsite: readRef(job.company, 'website'),

    // --- facts ---
    location: job.location || 'Not specified',
    type: formatType(job.type) || 'Not specified',
    typeValue: job.type || '',
    salary: formatSalaryRange(job.salaryMin, job.salaryMax),
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,

    // The API has no experience field, so the UI shows a neutral fallback
    // instead of inventing data.
    experience: 'Not specified',

    // --- body ---
    description,
    shortDescription: truncateText(description, 140),
    requirements,
    // The card shows up to three small tags — the first requirements read well
    // as skills/tags.
    keywords: requirements.slice(0, 3),

    // --- dates / state ---
    postedDate: job.postedDate || job.createdAt || null,
    deadline: job.deadline || null,
    isActive: job.isActive !== false,
  };
}

/**
 * Maps a list of documents.
 *
 * @param {object[]} jobs
 * @returns {object[]}
 */
export function adaptJobs(jobs) {
  return Array.isArray(jobs) ? jobs.map(adaptJob).filter(Boolean) : [];
}

export default adaptJob;
