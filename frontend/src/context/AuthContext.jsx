import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, notificationsAPI } from '../services/api'
import { updateEchoToken } from '../services/echo'
import echo from '../services/echo'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!user?.id) return

    const channel = echo.private(`private-user.${user.id}`)
      .listen('.NewNotificationEvent', (e) => {
        const notif = e.notification ?? e
        setUnreadNotifications(prev => prev + 1)
        // Global refresh event for other components to reload their lists
        window.dispatchEvent(new CustomEvent('notifications:refresh'))

        // Show OS-level Notification if tab is in background
        if ('Notification' in window && Notification.permission === 'granted') {
          if (document.hidden) {
            new Notification('Sakan - Nouvelle alerte', {
              body: notif.message,
              icon: '/favicon.ico'
            });
          }
        }

        // Show Toast
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-slate-800`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <Bell className="h-5 w-5 text-sakan-blue dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Nouvelle notification
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-100 dark:border-slate-800">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-bold text-sakan-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        ), { duration: 5000 })
      })

    return () => {
      channel.stopListening('.NewNotificationEvent')
    }
  }, [user])

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
    <AuthContext.Provider value={{ user, loading, login, register, logout, unreadNotifications, setUnreadNotifications, loadUnreadNotifications }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
