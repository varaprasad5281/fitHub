/**
 * API client — all calls go to the Express/MongoDB backend at /api/*
 */

const API_BASE = '/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('auth_token');
}

function setToken(token) {
  localStorage.setItem('auth_token', token);
}

function clearToken() {
  localStorage.removeItem('auth_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Low-level fetch helper ────────────────────────────────────────────────────
async function apiFetch(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
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
const auth = {
  async register({ email, full_name, password }) {
    const data = await apiFetch('/auth/register', { method: 'POST', body: { email, full_name, password } });
    setToken(data.token);
    return data.user;
  },

  async login({ email, password }) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    setToken(data.token);
    return data.user;
  },

  logout() {
    clearToken();
  },

  async me() {
    try {
      return await apiFetch('/auth/me');
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!getToken();
  },

  redirectToLogin(_returnUrl) {
    window.location.href = '/login';
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
    subscribe: () => () => {},
  };
}

// ── functions ─────────────────────────────────────────────────────────────────
const functions = {
  invoke: (name, body = {}) =>
    apiFetch(`/functions/${name}`, { method: 'POST', body }),
};

// ── integrations.Core ────────────────────────────────────────────────────────
const integrations = {
  Core: {
    InvokeLLM: ({ prompt, response_json_schema }) =>
      apiFetch('/functions/invokeLLM', { method: 'POST', body: { prompt, response_json_schema } }),

    SendEmail: ({ to, subject, body: emailBody, from_name }) =>
      apiFetch('/functions/sendEmail', { method: 'POST', body: { to, subject, body: emailBody, from_name } }),

    UploadFile: async ({ file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data; // { file_url: '...' }
    },

    GenerateImage: ({ prompt }) =>
      apiFetch('/functions/generateImage', { method: 'POST', body: { prompt } }),
  },
};

// ── analytics (no-op shim) ────────────────────────────────────────────────────
const analytics = {
  track: () => Promise.resolve(),
  identify: () => Promise.resolve(),
  page: () => Promise.resolve(),
};

// ── appLogs (no-op shim) ──────────────────────────────────────────────────────
const appLogs = {
  logUserInApp: () => Promise.resolve(),
  log: () => Promise.resolve(),
};

// ── Main API client ────────────────────────────────────────────────────────────
export const api = {
  auth,
  functions,
  integrations,
  appLogs,
  analytics,
  entities: new Proxy({}, {
    get(_, modelName) {
      return entityClient(modelName);
    },
  }),
  get asServiceRole() {
    return this;
  },
};

export { auth, functions, getToken, setToken, clearToken };
