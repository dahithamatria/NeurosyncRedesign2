const HISTORY_KEY_PREFIX = 'neurosync_history_';

export function getAssessmentHistory(email) {
  if (!email) return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY_PREFIX + email) || '[]');
  } catch {
    return [];
  }
}

export function saveAssessmentToHistory(email, entry) {
  if (!email) return;
  const history = getAssessmentHistory(email);
  history.push({ ...entry, date: new Date().toISOString() });
  localStorage.setItem(HISTORY_KEY_PREFIX + email, JSON.stringify(history));
}
