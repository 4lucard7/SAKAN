import { useEffect, useState } from 'react'
import { notificationsAPI } from '../services/api'
import { PageHeader, EmptyState, Spinner } from '../components/ui/index'
import { Bell, CheckCheck, Trash2, Wrench, CreditCard, Car, Receipt, MoreVertical, Circle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const typeConfig = {
  maintenance:   { icon: Wrench,    color: 'bg-orange-100 text-orange-600', label: 'maintenance' },
  responsabilite:{ icon: Car,       color: 'bg-blue-100 text-blue-600',     label: 'responsabilite' },
  finances:      { icon: CreditCard,color: 'bg-green-100 text-green-600',   label: 'debt' },
  charges:       { icon: Receipt,   color: 'bg-purple-100 text-purple-600', label: 'charge' },
}

function NotifCard({ notif, onRead, onDelete }) {
  const cfg  = typeConfig[notif.type] || typeConfig.charges
  const Icon = cfg.icon
  const date = new Date(notif.created_at)
  const dateStr = date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className={clsx(
      'card flex items-start gap-4 transition-all duration-200',
      !notif.is_read && 'border-l-4 border-sakan-blue bg-primary-50/30'
    )}>
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
        <Icon size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge text-[10px] ${cfg.color}`}>{notif.type}</span>
          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-sakan-blue flex-shrink-0" />}
          <span className="text-xs text-gray-400 ml-auto">{dateStr}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{notif.message}</p>
        <div className="flex items-center gap-3 mt-2">
          {!notif.is_read ? (
            <button onClick={() => onRead(notif.id)}
              className="text-xs text-sakan-blue hover:underline flex items-center gap-1">
              <CheckCircle size={12} /> Mark as read
            </button>
          ) : (
            <button onClick={() => onRead(notif.id)}
              className="text-xs text-gray-400 hover:underline flex items-center gap-1">
              <Circle size={12} /> Mark as unread
            </button>
          )}
          <button onClick={() => onDelete(notif.id)}
            className="text-xs text-red-400 hover:underline flex items-center gap-1">
            <Trash2 size={12} /> Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifs,   setNotifs]   = useState([])
  const [total,    setTotal]    = useState(0)
  const [unread,   setUnread]   = useState(0)
  const [hasMore,  setHasMore]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('all') // 'all' | 'unread'
  const [clearing, setClearing] = useState(false)

  const load = (params = {}) => {
    setLoading(true)
    notificationsAPI.list(params)
      .then(r => {
        setNotifs(r.data.data)
        setTotal(r.data.total)
        setUnread(r.data.unread_count)
        setHasMore(r.data.has_more)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(tab === 'unread' ? { non_lues: true } : {})
  }, [tab])

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: !n.is_read } : n))
      setUnread(prev => prev - 1)
    } catch { toast.error('Erreur.') }
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
      toast.success('Toutes les notifications sont lues.')
    } catch { toast.error('Erreur.') }
  }

  const deleteNotif = async (id) => {
    try {
      await notificationsAPI.delete(id)
      setNotifs(prev => prev.filter(n => n.id !== id))
      toast.success('Notification supprimée.')
    } catch { toast.error('Erreur.') }
  }

  const clearRead = async () => {
    setClearing(true)
    try {
      await notificationsAPI.deleteAll()
      setNotifs(prev => prev.filter(n => !n.is_read))
      toast.success('Notifications lues supprimées.')
    } catch { toast.error('Erreur.') }
    finally { setClearing(false) }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        subtitle="Manage alerts for your debts, vehicle maintenance, and recurring charges."
        action={
          <button onClick={markAllRead} className="btn-primary">
            <CheckCheck size={15} /> Mark all as read
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('all')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            All Notifications <span className="text-xs ml-1 text-gray-400">{total}</span>
          </button>
          <button
            onClick={() => setTab('unread')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === 'unread' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            Unread <span className="text-xs ml-1 text-sakan-blue font-bold">{unread}</span>
          </button>
        </div>

        <button onClick={clearRead} disabled={clearing}
          className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors disabled:opacity-50">
          <Trash2 size={12} /> Supprimer les lues
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : notifs.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Aucune notification"
          description={tab === 'unread' ? 'Toutes les notifications sont lues.' : 'Aucune notification pour le moment.'}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {notifs.map(n => (
            <NotifCard key={n.id} notif={n} onRead={markRead} onDelete={deleteNotif} />
          ))}
          {hasMore && (
            <button className="btn-secondary self-center text-sm" onClick={() => load({ page: 2 })}>
              Charger plus
            </button>
          )}
        </div>
      )}
    </div>
  )
}
