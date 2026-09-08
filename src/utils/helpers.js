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
