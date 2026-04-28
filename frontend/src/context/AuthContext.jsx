import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, notificationsAPI } from '../services/api'
import { updateEchoToken } from '../services/echo'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  const loadUnreadNotifications = async () => {
    try {
      const { data } = await notificationsAPI.list()
      setUnreadNotifications(data.unread_count || 0)
    } catch (err) {
      setUnreadNotifications(0)
    }
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('sakan_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const { data } = await authAPI.me()
      updateEchoToken(token)
      setUser(data)
      await loadUnreadNotifications()
    } catch (err) {
      console.error('Auth check failed:', err)
      localStorage.removeItem('sakan_token')
      localStorage.removeItem('sakan_user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await authAPI.login(credentials)
      const { user, token } = data
      localStorage.setItem('sakan_token', token)
      localStorage.setItem('sakan_user', JSON.stringify(user))
      updateEchoToken(token)
      setUser(user)
      await loadUnreadNotifications()
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Identifiants incorrects' 
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const { data } = await authAPI.register(userData)
      const { user, token } = data
      localStorage.setItem('sakan_token', token)
      localStorage.setItem('sakan_user', JSON.stringify(user))
      setUser(user)
      return { success: true }
    } catch (err) {
      const errors = err.response?.data?.errors
      const message = errors
        ? Object.values(errors).flat().join(' ')
        : err.response?.data?.message || 'Erreur lors de l\'inscription'
      return {
        success: false,
        message,
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      localStorage.removeItem('sakan_token')
      localStorage.removeItem('sakan_user')
      setUser(null)
      setUnreadNotifications(0)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, unreadNotifications, loadUnreadNotifications }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
