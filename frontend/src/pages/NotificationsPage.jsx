
// NotificationsPage.jsx — fix temps réel + i18n

import { useEffect, useRef, useState } from 'react'
import { notificationsAPI } from '../services/api'
import echo from '../services/echo'
import { PageHeader, EmptyState, Spinner } from '../components/Ui'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const TYPE_COLORS = {
  maintenance:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  responsabilite: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  finances:       'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  charges:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const BORDER_COLORS = {
  maintenance:    'border-orange-400',
  responsabilite: 'border-blue-500',
  finances:       'border-green-500',
  charges:        'border-purple-500',
}

function timeAgo(dateStr, t) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (diff < 1)  return t('notifications.time.just_now')
  if (diff < 60) return t('notifications.time.minutes_ago', { count: diff })
  const h = Math.floor(diff / 60)
  if (h < 24)    return t('notifications.time.hours_ago', { count: h })
  const d = Math.floor(h / 24)
  if (d < 7)     return t('notifications.time.days_ago', { count: d })
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function NotifCard({ notif, onToggleRead, onDelete, t }) {
  const typeColor   = TYPE_COLORS[notif.type]   || TYPE_COLORS.charges
  const borderColor = BORDER_COLORS[notif.type] || 'border-gray-300'

  return (
    <div className={clsx(
      'flex items-start gap-3 rounded-xl border bg-white dark:bg-slate-900 p-4 transition-all duration-200',
      notif.is_read
        ? 'border-gray-100 dark:border-white/10'
        : clsx('border-l-4', borderColor, 'border-t border-r border-b border-gray-100 dark:border-white/10')
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={clsx('text-[11px] font-medium px-2 py-0.5 rounded-full', typeColor)}>
            {t(`notifications.types.${notif.type}`)}
          </span>
          {notif.is_required && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {t('notifications.important')}
            </span>
          )}
          {!notif.is_read && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">{timeAgo(notif.created_at, t)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-2">{notif.message}</p>
        <div className="flex items-center gap-4">
          <button onClick={() => onToggleRead(notif.id)} className="text-xs text-blue-500 hover:underline">
            {notif.is_read ? t('notifications.mark_unread') : t('notifications.mark_read')}
          </button>
          <button onClick={() => onDelete(notif.id)} className="text-xs text-red-400 hover:underline">
            {t('notifications.remove')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { user, unreadNotifications, setUnreadNotifications, loadUnreadNotifications } = useAuth()
  const { t } = useTranslation()
  const [notifs,  setNotifs]  = useState([])
  const [tab,     setTab]     = useState('all')
  const [loading, setLoading] = useState(true)

  // ✅ Garde une référence stable pour éviter les doublons dans le listener
  const notifsRef = useRef(notifs)
  useEffect(() => { notifsRef.current = notifs }, [notifs])

  // ── Chargement initial ──────────────────────────────────────────────────────
  const load = (params = {}) => {
    setLoading(true)
    notificationsAPI.list(params)
      .then(r => {
        setNotifs(r.data.data)
        setUnreadNotifications(r.data.unread_count)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(tab === 'unread' ? { non_lues: true } : {})

    const handleRefresh = (e) => {
      if (e.detail?.source === 'page') return;
      load(tab === 'unread' ? { non_lues: true } : {})
    }
    window.addEventListener('notifications:refresh', handleRefresh)
    return () => {
      window.removeEventListener('notifications:refresh', handleRefresh)
    }
  }, [tab, user])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const dispatchRefresh = () => {
    window.dispatchEvent(new CustomEvent('notifications:refresh', { detail: { source: 'page' } }))
  }

  const toggleRead = async (id) => {
    const target = notifs.find(n => n.id === id)
    if (!target) return
    const wasRead = target.is_read
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: !wasRead } : n))
    try {
      await notificationsAPI.markRead(id)
      dispatchRefresh()
      loadUnreadNotifications()
    } catch {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: wasRead } : n))
      toast.error(t('notifications.error'))
    }
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      dispatchRefresh()
      loadUnreadNotifications()
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch { toast.error(t('notifications.error')) }
  }

  const deleteNotif = async (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id))
    try {
      await notificationsAPI.delete(id)
      dispatchRefresh()
      loadUnreadNotifications()
    } catch { toast.error(t('notifications.error')); load() }
  }

  const clearRead = async () => {
    try {
      await notificationsAPI.deleteAll()
      dispatchRefresh()
      loadUnreadNotifications()
      setNotifs(prev => prev.filter(n => !n.is_read))
    } catch { toast.error(t('notifications.error')) }
  }

  const visible = tab === 'unread' ? notifs.filter(n => !n.is_read) : notifs

  return (
    <div className="fade-in flex flex-col gap-5">
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        action={
          <div className="flex gap-2">
            <button onClick={markAllRead} className="btn-secondary text-sm">
              <CheckCheck size={14} /> {t('notifications.mark_all_read')}
            </button>
            <button onClick={clearRead} className="btn-ghost text-sm text-red-400">
              <Trash2 size={14} /> {t('notifications.clear_read')}
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1.5">
        {[
          { key: 'all',    label: t('notifications.all') },
          { key: 'unread', label: `${t('notifications.unread')}${unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              tab === key
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Bell size={40} />}
          title={t('notifications.no_notifications')}
          description={tab === 'unread' ? t('notifications.all_read') : t('notifications.no_notifs_yet')}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map(n => (
            <NotifCard key={n.id} notif={n} onToggleRead={toggleRead} onDelete={deleteNotif} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}