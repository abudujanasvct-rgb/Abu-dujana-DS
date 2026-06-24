const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}

export const api = {
  // public
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  sendMessage: (payload) => request('/messages', { method: 'POST', body: payload }),

  // auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me', { auth: true }),

  webauthnLoginOptions: (email) =>
    request('/auth/webauthn/login/options', { method: 'POST', body: { email } }),
  webauthnLoginVerify: (payload) =>
    request('/auth/webauthn/login/verify', { method: 'POST', body: payload }),
  webauthnRegisterOptions: () =>
    request('/auth/webauthn/register/options', { method: 'POST', auth: true }),
  webauthnRegisterVerify: (payload) =>
    request('/auth/webauthn/register/verify', { method: 'POST', body: payload, auth: true }),

  // protected project management
  createProject: (payload) => request('/projects', { method: 'POST', body: payload, auth: true }),
  updateProject: (id, payload) =>
    request(`/projects/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE', auth: true }),

  // protected messages
  getMessages: () => request('/messages', { auth: true }),
  markRead: (id) => request(`/messages/${id}/read`, { method: 'PATCH', auth: true })
};

export { getToken };
