/**
 * api/client.js — the single HTTP layer of the app.
 *
 * Why one file for this? Everything that talks to the Job Board API goes
 * through `request()`, so the following rules can never be forgotten in a
 * component:
 *
 *   1. the base URL is read once (Vite proxy in dev, env var in production);
 *   2. the JWT is stored in localStorage and attached as
 *      `Authorization: Bearer <token>` on every protected request;
 *   3. a non-2xx answer becomes a typed `ApiError` (status + the API's
 *      `errors[]` array), so forms can show the exact validation messages
 *      the backend produced instead of a generic "something went wrong";
 *   4. a 401 with a token attached means the token is dead (expired or the
 *      account was deleted) → the session is wiped and an event is fired so
 *      AuthContext can log the user out everywhere at once.
 *
 * The token lives in localStorage because the task asks for it. That is
 * readable by any script on the page, so it is only safe as long as the app
 * never renders untrusted HTML. The hardened alternative is an httpOnly
 * cookie, which JavaScript cannot read at all — see README.
 */

/**
 * localStorage keys. Exported so tests/other modules never hard-code them.
 */
export const TOKEN_KEY = 'techjobs_token';
export const USER_KEY = 'techjobs_user';

/** Fired whenever the stored session changes (login / logout). */
export const AUTH_CHANGED_EVENT = 'techjobs:auth-changed';

/** Fired when a request is rejected with 401 while a token was attached. */
export const UNAUTHORIZED_EVENT = 'techjobs:unauthorized';

/**
 * The API base URL.
 *
 * In development `vite.config.js` proxies `/api` to http://localhost:5000, so
 * the default value works without any CORS setup and without hard-coding the
 * backend port in the source. In production set VITE_API_BASE_URL (see
 * `.env.example`) to the deployed API, e.g. https://my-api.onrender.com/api
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

/* ------------------------------------------------------------------ storage */

/** @returns {string|null} the stored JWT, or null when logged out */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // private mode / storage disabled
  }
}

/**
 * @param {string|null} token
 */
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore — the app still works for the current page view */
  }
}

/** @returns {object|null} the cached user profile */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * @param {object|null} user
 */
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Persists a login/register response and notifies the rest of the app.
 *
 * @param {{ token: string, user: object }} session
 */
export function saveSession({ token, user }) {
  setToken(token);
  setStoredUser(user);
  notifyAuthChanged();
}

/** Removes the session (logout, dead token, failed /auth/me). */
export function clearSession() {
  setToken(null);
  setStoredUser(null);
  notifyAuthChanged();
}

/** Lets AuthContext re-read localStorage after any session change. */
function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/* -------------------------------------------------------------- error type */

/**
 * A failed API call.
 *
 * `status` is the HTTP status code (0 when the server could not be reached),
 * `errors` is the backend's `errors[]` array when it sent one.
 */
export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = Array.isArray(errors) ? errors : [];
  }

  /** True when the server was never reached (backend down / offline). */
  get isNetworkError() {
    return this.status === 0;
  }
}

/* ---------------------------------------------------------------- requests */

/**
 * Serialises a plain object into a query string, dropping empty values so
 * `{ keyword: '', type: undefined }` produces "" instead of "?keyword=&type=".
 *
 * @param {Record<string, unknown>} [params]
 * @returns {string}
 */
export function buildQuery(params) {
  if (!params) return '';

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * Performs one HTTP request against the API.
 *
 * @param {string} path e.g. "/jobs?keyword=react"
 * @param {object} [options]
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [options.method]
 * @param {object} [options.body] JSON-serialised automatically
 * @param {boolean} [options.auth] attach the Bearer token (default true)
 * @param {AbortSignal} [options.signal] to cancel the request
 * @returns {Promise<object>} the parsed JSON body
 * @throws {ApiError}
 */
export async function request(path, options = {}) {
  const { method = 'GET', body, auth = true, signal } = options;

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // A cancelled request is not an error the UI should report.
    if (error.name === 'AbortError') throw error;

    throw new ApiError(
      'Cannot reach the API server. Start it with "npm run dev" in the backend folder (http://localhost:5000).',
      0
    );
  }

  // 204 No Content (used by the CORS pre-flight) has no body at all.
  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null; // an HTML error page, for example
    }
  }

  if (!response.ok) {
    // A dead token: drop the session so the app stops sending it.
    if (response.status === 401 && token) {
      clearSession();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}.`,
      response.status,
      payload?.errors
    );
  }

  return payload;
}

/**
 * Shorthand verbs — the small surface components actually use.
 *
 *   api.get('/jobs', { params: { keyword: 'react' } })
 *   api.post('/auth/login', { email, password }, { auth: false })
 */
export const api = {
  get: (path, { params, ...options } = {}) =>
    request(`${path}${buildQuery(params)}`, { ...options, method: 'GET' }),

  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),

  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),

  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),

  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};

export default api;
