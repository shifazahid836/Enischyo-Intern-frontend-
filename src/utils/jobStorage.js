/**
 * jobStorage.js
 * -------------
 * Tiny localStorage helpers for the "Saved" and "Applied" job lists.
 *
 * The jobs themselves now live in MongoDB, but these two lists are still kept
 * in the browser on purpose:
 *
 *   • "saved"   is a personal bookmark list the API has no endpoint for;
 *   • "applied" is only a local mirror used to stop the Apply button from
 *     being offered twice. The source of truth is the applications collection,
 *     which is what the dashboard lists.
 *
 * Job ids are the MongoDB ObjectId strings from the API, so they are always
 * stored and compared as strings.
 */

const SAVED_KEY = 'techjobs_saved_ids';
const APPLIED_KEY = 'techjobs_applied_ids';

export const STORAGE_KEYS = {
  saved: SAVED_KEY,
  applied: APPLIED_KEY,
};

/** Read the list of job ids stored under a given key. */
export function getJobIds(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Check whether a job id is already inside the stored list. */
export function isJobInList(key, id) {
  return getJobIds(key).includes(String(id));
}

/**
 * Toggle a job id inside a stored list.
 * Returns the new state: true if the job is now in the list.
 */
export function toggleJobInList(key, id) {
  const ids = getJobIds(key);
  const idStr = String(id);
  const exists = ids.includes(idStr);
  const next = exists ? ids.filter((x) => x !== idStr) : [...ids, idStr];
  localStorage.setItem(key, JSON.stringify(next));
  return !exists;
}
