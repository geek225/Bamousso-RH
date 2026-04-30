import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');
// On enlève le /api à la fin s'il existe pour éviter le doublon car on le rajoute après
export const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

export const getFileUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) return `${API_URL}${path}`;
    return path;
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    if (status === 423 && code === 'COMPANY_LOCKED') {
      // Redirection simple (sans hook) vers l'écran "verrouillé"
      if (window.location.pathname !== '/locked') {
        window.location.assign('/locked');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
