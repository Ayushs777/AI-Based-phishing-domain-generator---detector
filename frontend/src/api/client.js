import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const checkURL = (url) => api.post('/api/check', { url });
export const generateDomains = (domain) => api.post('/api/generate', { domain });
export const downloadReport = (domain, variants) =>
  api.post('/api/report/download', { domain, variants }, { responseType: 'blob' });
export const login = (username, password) => {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  return api.post('/api/auth/login', form);
};
export const register = (email, username, password) =>
  api.post('/api/auth/register', { email, username, password });
export const getHistory = () => api.get('/api/history');

export default api;
