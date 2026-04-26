
// NotificationsPage.jsx — fix temps réel

import { useEffect, useRef, useState } from 'react'
import { notificationsAPI } from '../services/api'
import echo from '../services/echo'
import { PageHeader, EmptyState, Spinner } from '../components/Ui'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TYPE_LABELS = {
  maintenance:    'Entretien',
  responsabilite: 'Véhicule',
  finances:       'Finance',
  charges:        'Charge',
}

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

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (diff < 1)  return "À l'instant"
  if (diff < 60) return `il y a ${diff}m`
  const h = Math.floor(diff / 60)
  if (h < 24)    return `il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)     return `il y a ${d}j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function NotifCard({ notif, onToggleRead, onDelete }) {
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
            {TYPE_LABELS[notif.type] || notif.type}
          </span>
          {notif.is_required && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Important
            </span>
          )}
          {!notif.is_read && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">{timeAgo(notif.created_at)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-2">{notif.message}</p>
        <div className="flex items-center gap-4">
          <button onClick={() => onToggleRead(notif.id)} className="text-xs text-blue-500 hover:underline">
            {notif.is_read ? 'Marquer non lu' : 'Marquer comme lu'}
          </button>
          <button onClick={() => onDelete(notif.id)} className="text-xs text-red-400 hover:underline">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState([])
  const [unread,  setUnread]  = useState(0)
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
        setUnread(r.data.unread_count)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(tab === 'unread' ? { non_lues: true } : {})
  }, [tab])

  // ── Temps réel : abonnement unique, monté une seule fois ───────────────────
  useEffect(() => {
    const raw = localStorage.getItem('sakan_user')
    if (!raw) return

    let userId
    try { userId = JSON.parse(raw)?.id } catch { return }
    if (!userId) return

    // ✅ On attend que Echo soit connecté avant d'écouter
    const subscribe = () => {
      const channel = echo.private(`private-user.${userId}`)

      channel.listen('.NewNotificationEvent', (e) => {
        const incoming = e.notification ?? e  // ✅ certains setups envoient l'objet directement

        // ✅ Pas de doublon : on vérifie via la ref (pas le state)
        if (notifsRef.current.find(n => n.id === incoming.id)) return

        setNotifs(prev => [incoming, ...prev])
        setUnread(prev => prev + 1)
        toast.success('Nouvelle notification reçue', { icon: '🔔' })
      })

      // ✅ Optionnel : log erreur de souscription Pusher
      channel.error((err) => {
        console.error('[Echo] Erreur channel:', err)
      })

      return channel
    }

    let channel

    // ✅ Si Echo est déjà connecté → s'abonner immédiatement
    // Sinon → attendre l'événement "connected"
    if (echo.connector?.pusher?.connection?.state === 'connected') {
      channel = subscribe()
    } else {
      const onConnected = () => { channel = subscribe() }
      echo.connector.pusher.connection.bind('connected', onConnected)

      // cleanup si pas encore connecté au démontage
      return () => {
        echo.connector.pusher.connection.unbind('connected', onConnected)
        channel?.stopListening('.NewNotificationEvent')
      }
    }

    return () => {
      channel?.stopListening('.NewNotificationEvent')
    }
  }, []) // ✅ [] = une seule fois, pas de re-abonnement à chaque render

  // ── Actions ─────────────────────────────────────────────────────────────────
  const toggleRead = async (id) => {
    const target = notifs.find(n => n.id === id)
    if (!target) return
    const wasRead = target.is_read
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: !wasRead } : n))
    setUnread(prev => wasRead ? prev + 1 : Math.max(0, prev - 1))
    try {
      await notificationsAPI.markRead(id)
    } catch {
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: wasRead } : n))
      setUnread(prev => wasRead ? Math.max(0, prev - 1) : prev + 1)
      toast.error('Erreur')
    }
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
    } catch { toast.error('Erreur') }
  }

  const deleteNotif = async (id) => {
    const removed = notifs.find(n => n.id === id)
    setNotifs(prev => prev.filter(n => n.id !== id))
    if (removed && !removed.is_read) setUnread(prev => Math.max(0, prev - 1))
    try {
      await notificationsAPI.delete(id)
    } catch { toast.error('Erreur'); load() }
  }

  const clearRead = async () => {
    try {
      await notificationsAPI.deleteAll()
      setNotifs(prev => prev.filter(n => !n.is_read))
    } catch { toast.error('Erreur') }
  }

  const visible = tab === 'unread' ? notifs.filter(n => !n.is_read) : notifs

  return (
    <div className="fade-in flex flex-col gap-5">
      <PageHeader
        title="Notifications"
        subtitle="Alertes pour vos dettes, entretien et charges."
        action={
          <div className="flex gap-2">
            <button onClick={markAllRead} className="btn-secondary text-sm">
              <CheckCheck size={14} /> Tout lire
            </button>
            <button onClick={clearRead} className="btn-ghost text-sm text-red-400">
              <Trash2 size={14} /> Supprimer les lues
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1.5">
        {[
          { key: 'all',    label: 'Toutes' },
          { key: 'unread', label: `Non lues${unread > 0 ? ` (${unread})` : ''}` },
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
          title="Aucune notification"
          description={tab === 'unread' ? 'Tout est lu.' : 'Rien pour le moment.'}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map(n => (
            <NotifCard key={n.id} notif={n} onToggleRead={toggleRead} onDelete={deleteNotif} />
          ))}
        </div>
      )}
    </div>
  )
}