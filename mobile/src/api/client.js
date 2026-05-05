/**
 * API client for the mobile app.
 * Mirrors the web's src/api/client.js but uses AsyncStorage instead of
 * localStorage for JWT token persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/server';

const TOKEN_KEY = 'auth_token';

// ── Token helpers ─────────────────────────────────────────────────────────────
export async function getToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function authHeaders() {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Low-level fetch helper ────────────────────────────────────────────────────
async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = await authHeaders();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  async register({ email, full_name, password }) {
    const data = await apiFetch('/auth/register', { method: 'POST', body: { email, full_name, password } });
    await setToken(data.token);
    return data.user;
  },

  async login({ email, password }) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    await setToken(data.token);
    return data.user;
  },

  async logout() {
    await clearToken();
  },

  async me() {
    try {
      return await apiFetch('/auth/me');
    } catch {
      return null;
    }
  },

  async isAuthenticated() {
    const token = await getToken();
    return !!token;
  },
};

// ── entities ─────────────────────────────────────────────────────────────────
function entityClient(modelName) {
  const base = `/entities/${modelName}`;
  return {
    list: () => apiFetch(base),
    filter: (query) => apiFetch(`${base}/filter`, { method: 'POST', body: query }),
    create: (data) => apiFetch(base, { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`${base}/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`${base}/${id}`, { method: 'DELETE' }),
    findOne: async (query) => {
      const results = await apiFetch(`${base}/filter`, { method: 'POST', body: query });
      return results[0] || null;
    },
  };
}

// ── functions ─────────────────────────────────────────────────────────────────
export const functions = {
  invoke: (name, body = {}) =>
    apiFetch(`/functions/${name}`, { method: 'POST', body }),
};

// ── integrations.Core ────────────────────────────────────────────────────────
export const integrations = {
  Core: {
    InvokeLLM: ({ prompt, response_json_schema }) =>
      apiFetch('/functions/invokeLLM', { method: 'POST', body: { prompt, response_json_schema } }),

    SendEmail: ({ to, subject, body: emailBody, from_name }) =>
      apiFetch('/functions/sendEmail', { method: 'POST', body: { to, subject, body: emailBody, from_name } }),

    GenerateImage: ({ prompt }) =>
      apiFetch('/functions/generateImage', { method: 'POST', body: { prompt } }),
  },
};

// ── analytics (no-op) ────────────────────────────────────────────────────────
export const analytics = {
  track: () => Promise.resolve(),
  identify: () => Promise.resolve(),
};

// ── Main API client ────────────────────────────────────────────────────────────
export const api = {
  auth,
  functions,
  integrations,
  analytics,
  entities: new Proxy({}, {
    get(_, modelName) {
      return entityClient(modelName);
    },
  }),
};
