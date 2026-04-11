import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI, tiersAPI } from '../services/api'
import { Spinner, Badge } from '../components/Ui'
import { TrendingUp, TrendingDown, Car, AlertTriangle, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTranslation } from 'react-i18next'

const COLORS = ['#25D1F4', '#00b4d8', '#0096c7', '#0077b6', '#023e8a', '#90e0ef']

function StatCard({ label, value, color, icon: Icon, sub }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col gap-2 shadow-sm border border-transparent dark:border-white/5 transition-all hover:scale-[1.02] ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
      <p className="font-display font-bold text-3xl">{value}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const [data,       setData]       = useState(null)
  const [recentTiers,setRecentTiers]= useState([])
  const [loading,    setLoading]    = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([dashboardAPI.get(), tiersAPI.list()])
      .then(([d, t]) => {
        setData(d.data)
        setRecentTiers(t.data.slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  )

  const { finances, charges, voiture, charts } = data

  // Charges statut summary
  const chargesStatut = [
    { label: t('status.paid'),       value: charges.total_paye,  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { label: t('status.pending'), value: charges.restant,     color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { label: t('status.overdue'),  value: charges.en_retard,   color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  ]

  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div className="fade-in flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-800 dark:text-white transition-colors">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{t('dashboard.subtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label={t('dashboard.total_debts')}
          value={`${finances.total_dettes.toLocaleString()} MAD`}
          color="bg-primary-100 text-primary-800 dark:bg-blue-900/20 dark:text-blue-300"
          sub={`${finances.en_retard} ${t('dashboard.late')}`}
        />
        <StatCard
          label={t('dashboard.total_creances')}
          value={`${finances.total_creances.toLocaleString()} MAD`}
          color="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
          sub={`${finances.echeances_j7} ${t('dashboard.due_j7')}`}
        />
        <StatCard
          label={t('dashboard.vehicle_alerts')}
          value={voiture.nb_alertes}
          color="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
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
              {t('dashboard.manage_tiers')} <ChevronRight size={12} />
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

      {/* Charts */}
      {charts?.charges_par_categorie?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card dark:bg-slate-900 dark:border-white/10 transition-colors">
            <h2 className="font-display font-semibold text-gray-800 dark:text-white mb-4">{t('dashboard.charges_by_cat')}</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={charts.charges_par_categorie} dataKey="total" nameKey="categorie" cx="50%" cy="50%" outerRadius={80} label>
                  {charts.charges_par_categorie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#ffffff' : '#000000' }}
                  formatter={(v) => `${v.toLocaleString()} MAD`} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card dark:bg-slate-900 dark:border-white/10 transition-colors">
            <h2 className="font-display font-semibold text-gray-800 dark:text-white mb-4">{t('dashboard.debt_evolution')}</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.evolution_dettes}>
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }}
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#ffffff' : '#000000' }}
                  formatter={(v) => `${v.toLocaleString()} MAD`} 
                />
                <Bar dataKey="total" fill="#25D1F4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Vehicle alerts */}
      {voiture.alertes?.length > 0 && (
        <div className="card border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-orange-500" />
            <h2 className="font-display font-semibold text-orange-700 dark:text-orange-400">{t('dashboard.vehicle_alerts')}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {voiture.alertes.map((a, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-orange-100 dark:border-slate-700 shadow-sm">
                <Car size={14} className="text-orange-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  {a.type === 'maintenance'
                    ? `${a.part_name} — ${a.statut}`
                    : `${a.document} — ${a.statut}${a.jours_restants != null ? ` (J-${a.jours_restants})` : ''}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
