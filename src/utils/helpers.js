/**
 * helpers.js
 * ----------
 * Small formatting helpers shared across components.
 */

/** Extract initials from a company / user name, e.g. "TechCorp" -> "T". */
export function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/** Human-friendly date, e.g. "Aug 28, 2026". */
export function formatDate(dateStr = '') {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Map a job type to a badge colour class.
 * Full-time -> green, Part-time -> amber, Contract -> violet, Remote -> blue, etc.
 */
export function typeBadgeClass(type = '') {
  const typeMap = {
    'full-time': 'badge-green',
    'part-time': 'badge-amber',
    contract: 'badge-violet',
    remote: 'badge-blue',
    freelance: 'badge-teal',
    internship: 'badge-rose',
  };
  return typeMap[type.toLowerCase()] || 'badge-slate';
}

/**
 * Turns the API's two numeric salary fields into the single readable string
 * the cards and the details page show.
 *
 * The API stores salaryMin / salaryMax as Numbers, while the old mock data had
 * one pre-formatted "$60,000 - $80,000" string. Doing the conversion here keeps
 * every component presentation-only.
 *
 *   60000, 80000 → "$60,000 - $80,000"
 *   60000, null  → "From $60,000"
 *   null, 80000  → "Up to $80,000"
 *   null, null   → "Salary not disclosed"
 *
 * @param {number|string|null|undefined} min
 * @param {number|string|null|undefined} max
 * @returns {string}
 */
export function formatSalaryRange(min, max) {
  const asCurrency = (value) => {
    const number = Number(value);
    // Number(null) is 0 and Number('') is 0, so guard against those first.
    if (value === null || value === undefined || value === '' || !Number.isFinite(number)) {
      return null;
    }
    return `$${number.toLocaleString('en-US')}`;
  };

  const low = asCurrency(min);
  const high = asCurrency(max);

  if (low && high) return `${low} - ${high}`;
  if (low) return `From ${low}`;
  if (high) return `Up to ${high}`;
  return 'Salary not disclosed';
}

/**
 * Shortens long text on a word boundary and adds an ellipsis.
 * Used for the card summary, because job descriptions can be 2000+ characters.
 *
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text = '', maxLength = 140) {
  const clean = String(text).replace(/\s+/g, ' ').trim();

  if (clean.length <= maxLength) return clean;

  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');

  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * "Apply before Nov 9, 2026" helper — returns null when there is no deadline,
 * so the caller can simply skip rendering the row.
 *
 * @param {string|null} deadline ISO date from the API
 * @returns {string|null}
 */
export function formatDeadline(deadline) {
  if (!deadline) return null;

  const formatted = formatDate(deadline);
  return formatted || null;
}
