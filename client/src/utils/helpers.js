/**
 * Format a date nicely
 */
export const formatDate = (date, opts = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    ...opts,
  });
};

export const formatDateTime = (date) =>
  formatDate(date, { hour: '2-digit', minute: '2-digit' });

export const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return formatDate(date);
};

/**
 * Truncate long strings
 */
export const truncate = (str, len = 80) =>
  str && str.length > len ? str.slice(0, len) + '…' : str || '';

/**
 * Format issue type for display
 */
export const formatIssueType = (type) =>
  type ? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '—';

/**
 * Severity → sort order (lower = more urgent)
 */
export const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/**
 * Get badge class for severity
 */
export const severityBadge = (sev) => ({
  critical: 'badge-red',
  high:     'badge-orange',
  medium:   'badge-yellow',
  low:      'badge-green',
}[sev] || 'badge-gray');

/**
 * Get badge class for status
 */
export const statusBadge = (status) => ({
  submitted:    'badge-blue',
  under_review: 'badge-yellow',
  in_progress:  'badge-orange',
  resolved:     'badge-green',
  closed:       'badge-gray',
}[status] || 'badge-gray');

/**
 * Copy text to clipboard with feedback
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Validate coordinates
 */
export const isValidCoords = (lat, lng) =>
  !isNaN(lat) && !isNaN(lng) &&
  lat >= -90 && lat <= 90 &&
  lng >= -180 && lng <= 180;
