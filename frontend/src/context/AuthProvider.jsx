import { useState, useCallback } from 'react'
import { AuthContext } from './AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('sakan_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await authAPI.login(credentials)
      localStorage.setItem('sakan_token', data.token)
      localStorage.setItem('sakan_user',  JSON.stringify(data.user))
      setUser(data.user)
      toast.success('Bienvenue ' + data.user.name + ' !')
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Identifiants incorrects.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      const { data: res } = await authAPI.register(data)
      localStorage.setItem('sakan_token', res.token)
      localStorage.setItem('sakan_user',  JSON.stringify(res.user))
      setUser(res.user)
      toast.success('Compte créé avec succès !')
      return { success: true }
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach(e => toast.error(e))
      } else {
        toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.')
      }
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('sakan_token')
    localStorage.removeItem('sakan_user')
    setUser(null)
    toast.success('Déconnecté.')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

