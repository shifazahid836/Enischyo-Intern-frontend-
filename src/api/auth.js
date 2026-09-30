/**
 * api/auth.js — the four /auth endpoints the UI needs.
 *
 * These functions are intentionally thin: they call the endpoint, unwrap the
 * JSON envelope and return only what the caller cares about. All the error
 * handling already happened in `client.js` (an ApiError with a status and the
 * backend's validation messages).
 *
 * Backend contract (see backend/routes/auth.js):
 *   POST  /auth/register          → 201 { token, user }
 *   POST  /auth/login             → 200 { token, user }
 *   GET   /auth/me                → 200 { user }
 *   PATCH /auth/change-password   → 200 { token, user }
 *
 * `auth: false` on register/login is important: those two requests must NOT
 * carry an old (possibly expired) token, otherwise a 401 from an unrelated
 * session would wipe the storage while the user is trying to log in.
 */

import { api } from './client.js';

/**
 * Gives every user object the same shape.
 *
 * The backend is not consistent here, and this is where it shows:
 *   • POST /auth/register and POST /auth/login answer with
 *     `user.toAuthJSON()` → { id, name, email, role, createdAt }
 *   • GET /auth/me answers with the raw document from `req.user` →
 *     { _id, name, email, role, createdAt, … }   ← no `id`!
 *
 * Without this normalisation a page refresh would replace the cached profile
 * (which has `id`) with one that only has `_id`, and every place that compares
 * `job.employerId === user.id` — the dashboard, for instance — would silently
 * stop matching.
 *
 * @param {object|null|undefined} user
 * @returns {object|null}
 */
function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    id: String(user.id ?? user._id ?? ''),
  };
}

/**
 * Creates an account and returns a ready-to-use session.
 *
 * @param {{ name: string, email: string, password: string, role?: 'jobseeker'|'employer' }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function register({ name, email, password, role }) {
  const data = await api.post(
    '/auth/register',
    { name, email, password, role },
    { auth: false }
  );

  return { token: data.token, user: normalizeUser(data.user) };
}

/**
 * Exchanges credentials for a JWT (7-day expiry).
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password }, { auth: false });

  return { token: data.token, user: normalizeUser(data.user) };
}

/**
 * Re-reads the profile of the token owner. Used on page load to prove the
 * stored token is still valid (and to pick up a role change made by an admin).
 *
 * @returns {Promise<object>} the user profile, always with `id`
 */
export async function me() {
  const data = await api.get('/auth/me');
  return normalizeUser(data.user);
}

/**
 * Changes the password. The backend answers with a FRESH token because old
 * tokens stay technically valid until they expire.
 *
 * @param {{ oldPassword: string, newPassword: string }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function changePassword({ oldPassword, newPassword }) {
  const data = await api.patch('/auth/change-password', { oldPassword, newPassword });

  return { token: data.token, user: normalizeUser(data.user) };
}

export default { register, login, me, changePassword };
