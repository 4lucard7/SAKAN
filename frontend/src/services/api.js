import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sakan_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sakan_token')
      localStorage.removeItem('sakan_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/register', data),
  login:    (data) => api.post('/login', data),
  logout:   ()     => api.post('/logout'),
  me:       ()     => api.get('/me'),
}

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
}

// ── Tiers ─────────────────────────────────────────────────────────────
export const tiersAPI = {
  list:    ()          => api.get('/tiers'),
  get:     (id)        => api.get(`/tiers/${id}`),
  create:  (data)      => api.post('/tiers', data),
  update:  (id, data)  => api.put(`/tiers/${id}`, data),
  delete:  (id)        => api.delete(`/tiers/${id}`),
}

// ── Debts ─────────────────────────────────────────────────────────────
export const debtsAPI = {
  list:        (params) => api.get('/debts', { params }),
  get:         (id)     => api.get(`/debts/${id}`),
  create:      (data)   => api.post('/debts', data),
  update:      (id, data) => api.put(`/debts/${id}`, data),
  delete:      (id)     => api.delete(`/debts/${id}`),
  rembourser:  (id, montant) => api.patch(`/debts/${id}/rembourser`, { montant }),
}

// ── Voiture ───────────────────────────────────────────────────────────
export const voitureAPI = {
  get:     () => api.get('/voiture'),
  create:  (data) => api.post('/voiture', data),
  update:  (data) => api.put('/voiture', data),
  delete:  () => api.delete('/voiture'),
}

export const voituresAPI = {
  list:    () => api.get('/voitures'),
  get:     (id) => api.get(`/voitures/${id}`),
  create:  (data) => api.post('/voitures', data),
  update:  (id, data) => api.put(`/voitures/${id}`, data),
  delete:  (id) => api.delete(`/voitures/${id}`),
}

// ── Maintenances ──────────────────────────────────────────────────────
export const maintenanceAPI = {
  list:    ()          => api.get('/voiture/maintenances'),
  get:     (id)        => api.get(`/voiture/maintenances/${id}`),
  create:  (data)      => api.post('/voiture/maintenances', data),
  update:  (id, data)  => api.put(`/voiture/maintenances/${id}`, data),
  delete:  (id)        => api.delete(`/voiture/maintenances/${id}`),
}

// ── Charges ───────────────────────────────────────────────────────────
export const chargesAPI = {
  list:        (params) => api.get('/charges', { params }),
  historique:  ()       => api.get('/charges/historique'),
  get:         (id)     => api.get(`/charges/${id}`),
  create:      (data)   => api.post('/charges', data),
  update:      (id, data) => api.put(`/charges/${id}`, data),
  updateStatut:(id, statut) => api.patch(`/charges/${id}/statut`, { statut }),
  delete:      (id)     => api.delete(`/charges/${id}`),
}

// ── Notifications ─────────────────────────────────────────────────────
export const notificationsAPI = {
  list:        (params) => api.get('/notifications', { params }),
  markRead:    (id)     => api.patch(`/notifications/${id}/lire`),
  markAllRead: ()       => api.post('/notifications/lire-tout'),
  delete:      (id)     => api.delete(`/notifications/${id}`),
  deleteAll:   ()       => api.delete('/notifications'),
}

export default api
