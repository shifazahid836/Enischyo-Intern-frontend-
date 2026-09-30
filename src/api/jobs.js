/**
 * api/jobs.js — job + company endpoints.
 *
 * Query parameters supported by GET /jobs (backend/controllers/jobController.js):
 *   keyword   → case-insensitive regex over title OR description
 *   location  → partial, case-insensitive match
 *   type      → full-time | part-time | remote
 *   company   → a company ObjectId
 *   isActive  → "true" | "false"
 *
 * Empty values are dropped by `buildQuery`, which is what makes a cleared
 * search box return the full list instead of an error.
 */

import { api } from './client.js';

/**
 * Fetches jobs, optionally filtered by the backend.
 *
 * @param {{ keyword?: string, location?: string, type?: string, company?: string, isActive?: boolean|string }} [filters]
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ jobs: object[], count: number, filters: object }>}
 */
export async function listJobs(filters = {}, { signal } = {}) {
  const data = await api.get('/jobs', { params: filters, signal });

  return {
    jobs: data?.jobs ?? [],
    count: data?.count ?? 0,
    filters: data?.filters ?? {},
  };
}

/**
 * Fetches a single job (with its company populated).
 *
 * @param {string} id 24-character ObjectId
 * @returns {Promise<object>}
 */
export async function getJob(id) {
  const data = await api.get(`/jobs/${encodeURIComponent(id)}`);
  return data.job;
}

/**
 * Publishes a new job. Employer-only: the backend reads the owner from the
 * JWT, so `employer` must NOT be sent in the body.
 *
 * @param {object} payload title, description, requirements[], salaryMin, salaryMax,
 *                         type, location, company (ObjectId), deadline?
 * @returns {Promise<object>} the created job
 */
export async function createJob(payload) {
  const data = await api.post('/jobs', payload);
  return data.job;
}

/**
 * Updates a job the caller owns. `PUT` revalidates the whole document, so
 * every required field must be present in `payload`.
 *
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateJob(id, payload) {
  const data = await api.put(`/jobs/${encodeURIComponent(id)}`, payload);
  return data.job;
}

/**
 * Deletes a job — allowed for its owner, or for an admin.
 *
 * @param {string} id
 * @returns {Promise<{ message?: string }>}
 */
export async function deleteJob(id) {
  return api.delete(`/jobs/${encodeURIComponent(id)}`);
}

/**
 * Lists every company (used to fill the "company" select on the Post a Job
 * form, because POST /jobs expects a company ObjectId).
 *
 * @returns {Promise<object[]>}
 */
export async function listCompanies() {
  const data = await api.get('/companies');
  return data?.companies ?? [];
}

export default { listJobs, getJob, createJob, updateJob, deleteJob, listCompanies };
