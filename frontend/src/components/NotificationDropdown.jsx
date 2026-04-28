import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { notificationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import echo from '../services/echo'
import { Bell, CheckCheck, Wrench, CreditCard, Car, Receipt, CheckCircle, Circle, Trash2, ArrowRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const typeConfig = {
  maintenance: { icon: Wrench, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', gradient: 'from-orange-500 to-amber-500' },
  responsabilite: { icon: Car, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
  finances: { icon: CreditCard, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', gradient: 'from-green-500 to-emerald-500' },
  charges: { icon: Receipt, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', gradient: 'from-purple-500 to-violet-500' },
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function DropdownNotifItem({ notif, onRead, onDelete }) {
  const cfg = typeConfig[notif.type] || typeConfig.charges
  const Icon = cfg.icon

  return (
    <div
      className={clsx(
        'group relative flex items-start gap-3 px-4 py-3 transition-all duration-200 cursor-pointer',
        !notif.is_read
          ? 'bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
      )}
    >
      {/* Unread indicator */}
      {!notif.is_read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sakan-blue animate-pulse" />
      )}

      {/* Type icon */}
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', cfg.color)}>
        <Icon size={14} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={clsx(
            'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
            cfg.color
          )}>
            {notif.type}
          </span>
          {notif.is_required && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              !
            </span>
          )}
        </div>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
          {notif.message}
        </p>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
          {timeAgo(notif.created_at)}
        </span>
      </div>

      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 flex-shrink-0 mt-1">
        <button
          onClick={(e) => { e.stopPropagation(); onRead(notif.id) }}
          className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-sakan-blue transition-colors"
          title={notif.is_read ? 'Mark unread' : 'Mark read'}
        >
          {notif.is_read ? <Circle size={12} /> : <CheckCircle size={12} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notif.id) }}
          className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

export default function NotificationDropdown() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const dropdownRef = useRef(null)
  const bellRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  // Fetch unread count on mount and request OS Notification permission
  useEffect(() => {
    fetchUnreadCount()

    // Listen for manual refresh events from other components
    window.addEventListener('notifications:refresh', fetchUnreadCount)

    // Demander la permission pour les notifications du navigateur (OS-level)
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => {
      window.removeEventListener('notifications:refresh', fetchUnreadCount)
      clearInterval(interval)
    }
  }, [user])

  // Fetch full list when opening
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  // Real-time listener
  useEffect(() => {
    const userStr = localStorage.getItem('sakan_user')
    if (!userStr) return
    const user = JSON.parse(userStr)

    if (!user.id) return

    const channel = echo.private(`private-user.${user.id}`)
      .listen('.NewNotificationEvent', (e) => {
        console.log('Real-time notification received:', e)

        // Add to list
        setNotifs(prev => {
          const exists = prev.find(n => n.id === e.notification.id)
          if (exists) return prev
          return [e.notification, ...prev].slice(0, 8)
        })

        // Increment count
        setUnreadCount(prev => prev + 1)

        // Show OS-level Notification if tab is in background
        if ('Notification' in window && Notification.permission === 'granted') {
          // Utiliser document.hidden pour ne pas spammer l'OS si l'utilisateur est actif sur l'onglet
          if (document.hidden) {
            new Notification('Sakan - Nouvelle alerte', {
              body: e.notification.message,
              icon: '/favicon.ico' // Assurez-vous d'avoir un favicon.ico dans public/
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
                    {e.notification.message}
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

  const fetchUnreadCount = () => {
    notificationsAPI.list({ per_page: 1 })
      .then(r => {
        setUnreadCount(r.data.unread_count || 0)
      })
      .catch(() => setUnreadCount(0))
      .finally(() => setInitialLoad(false))
  }

  const fetchNotifications = () => {
    setLoading(true)
    notificationsAPI.list({ per_page: 8 })
      .then(r => {
        setNotifs(r.data.data || [])
        setUnreadCount(r.data.unread_count || 0)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  const toggleDropdown = () => {
    setOpen(prev => !prev)
  }

  const dispatchRefresh = () => {
    window.dispatchEvent(new CustomEvent('notifications:refresh'))
  }

  const markRead = async (id) => {
    const target = notifs.find(n => n.id === id)
    if (!target) return
    const wasRead = target.is_read

    // Optimistic update
    setNotifs(prev => prev.map(n =>
      n.id === id ? { ...n, is_read: !wasRead } : n
    ))
    setUnreadCount(prev => wasRead ? prev + 1 : Math.max(0, prev - 1))

    try {
      await notificationsAPI.markRead(id)
      dispatchRefresh()
    } catch {
      // Rollback on error
      setNotifs(prev => prev.map(n =>
        n.id === id ? { ...n, is_read: wasRead } : n
      ))
      setUnreadCount(prev => wasRead ? Math.max(0, prev - 1) : prev + 1)
      toast.error('Error updating notification.')
    }
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      dispatchRefresh()
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read!')
    } catch {
      toast.error('Error updating notifications.')
    }
  }

  const deleteNotif = async (id) => {
    try {
      await notificationsAPI.delete(id)
      dispatchRefresh()
      const removed = notifs.find(n => n.id === id)
      setNotifs(prev => prev.filter(n => n.id !== id))
      if (removed && !removed.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch {
      toast.error('Error deleting notification.')
    }
  }

  return (
    <div className="relative" id="notification-dropdown-container">
      {/* Bell Toggle Button */}
      <button
        ref={bellRef}
        onClick={toggleDropdown}
        id="notification-bell-toggle"
        className={clsx(
          'relative p-2.5 rounded-xl transition-all duration-200',
          open
            ? 'bg-sakan-blue/10 text-sakan-blue dark:bg-blue-900/30 dark:text-blue-400 shadow-inner'
            : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:text-sakan-blue dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        )}
        aria-label="Toggle notifications"
        aria-expanded={open}
      >
        <Bell size={20} className={clsx(
          'transition-transform duration-300',
          open && 'scale-110'
        )} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-lg ring-2 ring-white dark:ring-slate-900 animate-bounce-subtle">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse ring for new notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-400 rounded-full animate-ping opacity-30 pointer-events-none" />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={dropdownRef}
          className={clsx(
            'absolute top-full mt-2 right-0 w-[380px] max-h-[520px] overflow-hidden',
            'bg-white dark:bg-slate-900 rounded-2xl',
            'shadow-2xl shadow-gray-200/80 dark:shadow-black/40',
            'border border-gray-100 dark:border-slate-800',
            'z-50',
            'animate-dropdown-in'
          )}
          role="dialog"
          aria-label="Notifications panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-900">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sakan-blue/10 text-sakan-blue dark:bg-blue-900/30 dark:text-blue-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-sakan-blue hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  Read all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-50 dark:divide-slate-800/50 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-slate-700 border-t-sakan-blue animate-spin" />
                <span className="text-xs text-gray-400">Loading...</span>
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                  <Bell size={24} className="text-gray-300 dark:text-gray-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notifications</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">You're all caught up! 🎉</p>
                </div>
              </div>
            ) : (
              notifs.map(n => (
                <DropdownNotifItem
                  key={n.id}
                  notif={n}
                  onRead={markRead}
                  onDelete={deleteNotif}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="border-t border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-900">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-sakan-blue hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
              >
                View all notifications
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
