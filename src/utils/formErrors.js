/**
 * utils/formErrors.js
 * -------------------
 * Turns whatever a request threw into ONE readable sentence for an alert box.
 *
 * The backend answers a failed request like this:
 *
 *   { success: false,
 *     message: "Registration failed. Please check the highlighted fields.",
 *     errors:  ["password must be at least 8 characters long.",
 *               "name is required."] }
 *
 * `message` is the headline and `errors[]` has one line per invalid field, so
 * both are useful for the user — and both are already written as full
 * sentences by the API, which is why the frontend does not try to re-word them.
 */

/**
 * @param {unknown} error an ApiError, or anything else that was thrown
 * @param {string} [fallback] shown when the error carries no message
 * @returns {string}
 */
export function describeError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  const message =
    typeof error.message === 'string' && error.message.trim()
      ? error.message.trim()
      : fallback;

  const details = Array.isArray(error.errors)
    ? error.errors.filter((line) => typeof line === 'string' && line.trim())
    : [];

  if (details.length === 0) return message;

  return `${message} ${details.join(' ')}`;
}

/**
 * True when the API could not be reached at all (backend not running), so a
 * page can show a "start the server" hint instead of a validation complaint.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
export function isOfflineError(error) {
  return Boolean(error) && (error.status === 0 || error.isNetworkError === true);
}

export default describeError;
