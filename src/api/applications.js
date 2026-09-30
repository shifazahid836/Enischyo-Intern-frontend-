/**
 * api/applications.js — application endpoints.
 *
 * POST /applications is jobseeker-only and requires ALL of these fields
 * (see backend/models/Application.js):
 *   job (ObjectId), applicantName, email, phone, coverLetter (30+ chars),
 *   resumeURL (must start with http:// or https://)
 *
 * The API has no "my applications" route, so the dashboard fetches the list
 * and filters it by the logged-in user's e-mail — see pages/Dashboard.jsx.
 */

import { api } from './client.js';

/**
 * Submits an application for a job.
 *
 * @param {{ job: string, applicantName: string, email: string, phone: string,
 *           coverLetter: string, resumeURL: string }} payload
 * @returns {Promise<object>} the created application
 */
export async function createApplication(payload) {
  const data = await api.post('/applications', payload);
  return data.application;
}

/**
 * Lists applications. Optional filters: `job` (ObjectId) and `status`.
 *
 * NOTE: this endpoint is public on the backend, so a jobseeker can see other
 * people's applications. The dashboard therefore filters by e-mail — fine for
 * a learning project; a production API would expose GET /applications/me
 * behind `protect` instead.
 *
 * @param {{ job?: string, status?: string }} [filters]
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<object[]>}
 */
export async function listApplications(filters = {}, { signal } = {}) {
  const data = await api.get('/applications', { params: filters, signal });
  return data?.applications ?? [];
}

export default { createApplication, listApplications };
