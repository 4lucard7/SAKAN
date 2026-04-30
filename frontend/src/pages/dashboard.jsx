import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI, tiersAPI, voituresAPI } from '../services/api'
import { Spinner, Badge } from '../components/Ui'
import * as Lucide from 'lucide-react'
import { useTranslation } from 'react-i18next'

const COLORS = ['#25D1F4', '#00b4d8', '#0096c7', '#0077b6', '#023e8a', '#90e0ef']

function StatCard({ label, value, color, icon: Icon, sub, trend }) {
  return (
    <div className={`group rounded-3xl p-6 flex flex-col gap-3 shadow-card border border-transparent dark:border-white/5 transition-all duration-300 hover:shadow-hover hover:-translate-y-1 ${color}`}>
      <div className="flex justify-between items-start">
        <div className="p-2 bg-white/20 rounded-xl">
          <Icon size={20} className="text-current opacity-90" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/20">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
        <p className="font-display font-black text-3xl">{value}</p>
        {sub && <p className="text-[11px] font-medium mt-1 opacity-60">{sub}</p>}
      </div>
    </div>
  )
}

const DEFAULT_DASHBOARD = {
  finances: {
    total_dettes: 0,
    total_creances: 0,
    solde_net: 0,
    en_retard: 0,
    echeances_j7: 0,
  },
  charges: {
    total_du: 0,
    total_paye: 0,
    restant: 0,
    en_retard: 0,
    taux_paiement: 0,
  },
  voiture: {
    enregistree: false,
    alertes: [],
    nb_alertes: 0,
  },
  charts: {
    charges_par_categorie: [],
    evolution_dettes: [],
  },
  notifications_non_lues: 0,
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [data,         setData]         = useState(DEFAULT_DASHBOARD)
  const [recentTiers,  setRecentTiers]  = useState([])
  const [voitures,     setVoitures]     = useState([])
  const [selectedCarId,setSelectedCarId]= useState('all')
  const [loading,      setLoading]      = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([dashboardAPI.get(), tiersAPI.list(), voituresAPI.list()])
      .then(([d, t, v]) => {
        setData(d.data)
        setRecentTiers(t.data.slice(0, 3))
        setVoitures(v.data)
      })
      .catch(() => {
        setData(DEFAULT_DASHBOARD)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  )

  const { finances, charges, voiture } = data

  // Filter alerts by selected car
  const filteredAlertes = selectedCarId === 'all'
    ? (voiture.alertes || [])
    : (voiture.alertes || []).filter(a => String(a.voiture_id) === String(selectedCarId))

  const filteredAlertCount = filteredAlertes.length

  // Charges statut summary
  const chargesStatut = [
    { label: t('status.paid'),       value: charges.total_paye,  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { label: t('status.pending'), value: charges.restant,     color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: t('status.overdue'),  value: charges.en_retard,   color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  ]

  return (
    <div className="fade-in flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white transition-colors">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/debts')} className="flex items-center gap-2 px-4 py-2.5 bg-sakan-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-sakan-blue/20 hover:scale-105 transition-all active:scale-95">
            <Lucide.Plus size={18} />
            {t('common.debts')}
          </button>
          <button onClick={() => navigate('/charges')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all active:scale-95">
            <Lucide.PlusCircle size={18} />
            {t('common.charges')}
          </button>
        </div>
      </div>

      {/* Urgent Alert Banner */}
      {(finances.en_retard > 0 || voiture.nb_alertes > 0) && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2rem] p-5 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
            <Lucide.AlertTriangle size={24} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-red-900 dark:text-red-200 uppercase tracking-wider">{t('dashboard.urgent_action_required')}</p>
            <p className="text-sm text-red-700/80 dark:text-red-400/80 mt-0.5">
              {finances.en_retard > 0 && `${finances.en_retard} ${t('dashboard.late_payments')}. `}
              {voiture.nb_alertes > 0 && `${voiture.nb_alertes} ${t('dashboard.vehicle_alerts').toLowerCase()}.`}
            </p>
          </div>
          <button onClick={() => navigate(voiture.nb_alertes > 0 ? '/voiture' : '/debts')} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-red-600/20">
            {t('common.view')}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label={t('dashboard.total_debts')}
          value={`${finances.total_dettes.toLocaleString()} MAD`}
          color="bg-sakan-blue text-white"
          icon={Lucide.Wallet}
          sub={`${finances.en_retard} ${t('dashboard.late')}`}
        />
        <StatCard
          label={t('dashboard.total_creances')}
          value={`${finances.total_creances.toLocaleString()} MAD`}
          color="bg-slate-900 dark:bg-slate-800 text-white"
          icon={Lucide.ArrowUpRight}
          sub={`${finances.echeances_j7} ${t('dashboard.due_j7')}`}
        />
        <StatCard
          label={t('dashboard.vehicle_alerts')}
          value={voiture.nb_alertes}
          color="bg-orange-500 text-white"
          icon={Lucide.Bell}
          sub={voiture.enregistree ? t('dashboard.vehicle_registered') : t('dashboard.no_vehicle')}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tiers */}
        <div className="card dark:bg-slate-900 dark:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-gray-800 dark:text-white">{t('dashboard.recent_tiers')}</h2>
            <button onClick={() => navigate('/tiers')}
              className="text-xs text-sakan-blue dark:text-sakan font-medium hover:underline flex items-center gap-0.5">
              {t('dashboard.manage_tiers')} <Lucide.ChevronRight size={12} />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide border-b border-gray-100 dark:border-slate-800">
                <th className="pb-2 text-left font-medium">{t('common.name')}</th>
                <th className="pb-2 text-left font-medium">{t('common.type')}</th>
                <th className="pb-2 text-left font-medium">{t('common.contact')}</th>
              </tr>
            </thead>
            <tbody>
              {recentTiers.map(t_item => (
                <tr key={t_item.id} className="border-b border-gray-50 dark:border-slate-800 last:border-0">
                  <td className="py-3 font-medium text-gray-800 dark:text-slate-200">{t_item.name}</td>
                  <td className="py-3"><Badge color="blue">{t_item.type}</Badge></td>
                  <td className="py-3 text-gray-400 dark:text-slate-500 text-xs">{t_item.contact || '—'}</td>
                </tr>
              ))}
              {recentTiers.length === 0 && (
                <tr><td colSpan={3} className="py-6 text-center text-gray-400 dark:text-slate-500 text-sm">{t('dashboard.no_tiers')}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Charges statut */}
        <div className="card dark:bg-slate-900 dark:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-sakan-blue"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5"/></svg>
              </div>
              <span className="font-display font-semibold text-gray-800 dark:text-white uppercase tracking-wide text-sm">{t('dashboard.charges_status')}</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-bold">{charges.total_du.toLocaleString()} MAD Total</span>
          </div>
          <div className="flex flex-col gap-3">
            {chargesStatut.map(s => (
              <div key={s.label} className={`rounded-xl p-3 flex items-center justify-between shadow-sm transition-transform hover:scale-[1.01] ${s.color}`}>
                <span className="text-xs font-bold tracking-wide">{s.label}</span>
                <span className="font-display font-bold">{typeof s.value === 'number' && s.label !== t('status.overdue') ? `${s.value.toLocaleString()} MAD` : s.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-sm">
            <span className="text-gray-400 dark:text-slate-500 font-medium">{t('dashboard.payment_rate')}</span>
            <span className="font-bold text-green-600 dark:text-green-400">{charges.taux_paiement}%</span>
          </div>
        </div>
      </div>

      {/* Vehicles */}
      {voitures.length > 0 && (
        <div className="card dark:bg-slate-900 dark:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-gray-800 dark:text-white">{t('vehicle.title')}</h2>
            <button onClick={() => navigate('/voiture')}
              className="text-xs text-sakan-blue dark:text-sakan font-medium hover:underline flex items-center gap-0.5">
              {t('common.actions')} <Lucide.ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voitures.map(car => (
              <div key={car.id} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Lucide.Car size={20} className="text-sakan-blue dark:text-sakan" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{car.car_name}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{car.current_km?.toLocaleString()} km</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/voiture')}
                  className="w-full bg-sakan-blue text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-sakan-blue/90 transition-colors"
                >
                  {t('common.actions')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle alerts with car selector */}
      {voitures.length > 0 && (
        <div className="card dark:bg-slate-900 dark:border-white/10 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center relative">
                {filteredAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                )}
                <Lucide.AlertTriangle size={20} className="text-orange-500" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-gray-800 dark:text-white">{t('dashboard.vehicle_alerts')}</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500">{filteredAlertCount} alert(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Car selector */}
              <div className="relative">
                <select
                  id="dashboard-car-select"
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="appearance-none bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-xl pl-3 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-sakan-blue/30 focus:border-sakan-blue dark:focus:ring-sakan/30 dark:focus:border-sakan cursor-pointer transition-all hover:border-gray-300 dark:hover:border-slate-600 min-w-[180px]"
                >
                  <option value="all">{t('dashboard.all_vehicles')}</option>
                  {voitures.map(car => (
                    <option key={car.id} value={car.id}>{car.car_name}</option>
                  ))}
                </select>
                <Lucide.ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
              </div>
              <button onClick={() => navigate('/voiture')}
                className="text-xs text-sakan-blue dark:text-sakan font-medium hover:underline flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
                {t('common.actions')} <Lucide.ChevronRight size={12} />
              </button>
            </div>
          </div>

          {filteredAlertes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredAlertes.map((a, i) => {
                const isRed = ['depasse', 'expire', 'alerte_j7'].includes(a.statut)
                const bgColor = isRed 
                  ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
                  : 'bg-orange-50/30 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'
                const iconBoxColor = isRed ? 'bg-white dark:bg-red-900/40 text-red-600 dark:text-red-400 shadow-sm' : 'bg-white dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 shadow-sm'
                const badgeColor = isRed ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                
                const title = a.type === 'maintenance' ? a.part_name : t(`vehicle.doc_${a.document}`)
                const desc = t(`alert_status.${a.statut}`) + (a.jours_restants != null ? ` (J-${a.jours_restants})` : '')

                return (
                  <div key={i} className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 border transition-all hover:shadow-md hover:-translate-y-0.5 ${bgColor}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${iconBoxColor}`}>
                        {a.type === 'maintenance' ? <Lucide.Wrench size={22} /> : <Lucide.Shield size={22} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {a.car_name}
                          {isRed && (
                             <span className="relative flex h-2 w-2" title="Urgent">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                             </span>
                          )}
                        </p>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-0.5">
                          {title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center self-start sm:self-auto ml-16 sm:ml-0">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border border-transparent dark:border-white/5 shadow-sm ${badgeColor}`}>
                        {desc}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-3">
                <Lucide.Car size={24} className="text-green-500 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                {t('dashboard.no_alerts_for_car')}
              </p>
            </div>
          )}
        </div>
      )}

      
    </div>
  )
}
