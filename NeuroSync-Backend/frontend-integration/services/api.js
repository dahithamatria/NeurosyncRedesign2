// Drop this in react-app/src/services/api.js
//
// Thin fetch wrapper: attaches the JWT from localStorage, unwraps the
// backend's { success, data } / { success, message } envelope, and throws
// a real Error on failure so callers can just try/catch.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'neurosync_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  return json.data;
}

export const api = {
  // Auth
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password }, auth: false }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: { token, password }, auth: false }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (settings) => request('/settings', { method: 'PUT', body: settings }),

  // Personalization
  getPersonalization: () => request('/personalization'),
  updatePersonalization: (profile) => request('/personalization', { method: 'PUT', body: profile }),

  // Assessments
  createAssessment: (payload) => request('/assessments', { method: 'POST', body: payload }),
  listAssessments: () => request('/assessments'),
  getAssessment: (id) => request(`/assessments/${id}`),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Recommendations
  getRecommendation: (percent) => request(`/recommendations?percent=${percent}`),
  listExtensions: () => request('/recommendations/extensions'),
};

export default api;
