import axios from 'axios'

/**
 * Instance Axios pré-configurée pour l'API SAKAN.
 *
 * — baseURL : pointe sur VITE_API_URL (défini dans frontend/.env)
 * — withCredentials : true  →  envoie les cookies (requis pour Sanctum stateful)
 * — Interceptor request : attache automatiquement le token Bearer si présent
 * — Interceptor response : redirige vers /login si le token est expiré (401)
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   // http://localhost:8000/api
  withCredentials: true,                    // cookies Sanctum
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sakan_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou absent → nettoyer et rediriger vers /login
      localStorage.removeItem('sakan_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─────────────────────────────────────────────────────────────────────────────
// Helpers calqués sur vos routes api.php
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  logout:   ()      => api.post('/auth/logout'),
  me:       ()      => api.get('/auth/me'),
}

export const dashboardApi = {
  index: () => api.get('/dashboard'),
}

export const tiersApi = {
  list:    ()         => api.get('/tiers'),
  show:    (id)       => api.get(`/tiers/${id}`),
  create:  (data)     => api.post('/tiers', data),
  update:  (id, data) => api.put(`/tiers/${id}`, data),
  destroy: (id)       => api.delete(`/tiers/${id}`),
}

export const debtsApi = {
  list:       ()         => api.get('/debts'),
  show:       (id)       => api.get(`/debts/${id}`),
  create:     (data)     => api.post('/debts', data),
  update:     (id, data) => api.put(`/debts/${id}`, data),
  destroy:    (id)       => api.delete(`/debts/${id}`),
  rembourser: (id)       => api.patch(`/debts/${id}/rembourser`),
}

export const voitureApi = {
  show:    ()      => api.get('/voiture'),
  store:   (data)  => api.post('/voiture', data),
  update:  (data)  => api.put('/voiture', data),
  destroy: ()      => api.delete('/voiture'),
}

export const maintenanceApi = {
  list:    ()         => api.get('/voiture/maintenances'),
  show:    (id)       => api.get(`/voiture/maintenances/${id}`),
  create:  (data)     => api.post('/voiture/maintenances', data),
  update:  (id, data) => api.put(`/voiture/maintenances/${id}`, data),
  destroy: (id)       => api.delete(`/voiture/maintenances/${id}`),
}

export const chargesApi = {
  list:         ()         => api.get('/charges'),
  show:         (id)       => api.get(`/charges/${id}`),
  create:       (data)     => api.post('/charges', data),
  update:       (id, data) => api.put(`/charges/${id}`, data),
  destroy:      (id)       => api.delete(`/charges/${id}`),
  historique:   ()         => api.get('/charges/historique'),
  updateStatut: (id, data) => api.patch(`/charges/${id}/statut`, data),
}

export const notificationsApi = {
  list:        ()   => api.get('/notifications'),
  markAsRead:  (id) => api.patch(`/notifications/${id}/lire`),
  markAllRead: ()   => api.post('/notifications/lire-tout'),
  destroyAll:  ()   => api.delete('/notifications'),
  destroy:     (id) => api.delete(`/notifications/${id}`),
}