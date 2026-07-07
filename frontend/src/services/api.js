import axios from 'axios'

// Axios instance — Vite proxy forwards /api → http://localhost:3001
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401/403 → auto-logout (token expired)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── API helpers ───────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then(r => r.data),
}

export const tanksAPI = {
  getAll:    ()                => api.get('/tanks').then(r => r.data),
  getCurrent: (id)             => api.get(`/tanks/${id}/current`).then(r => r.data),
  getHistory: (id, from, to)   => {
    const params = {}
    if (from) params.from = from
    if (to)   params.to   = to
    return api.get(`/tanks/${id}/history`, { params }).then(r => r.data)
  },
}

export const alertsAPI = {
  getAll: () => api.get('/alerts').then(r => r.data),
}

export default api
