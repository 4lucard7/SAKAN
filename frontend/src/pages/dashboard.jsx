import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI, tiersAPI } from '../services/api'
import { Spinner, Badge } from '../components/ui/index'
import { TrendingUp, TrendingDown, Car, AlertTriangle, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#00b4d8', '#0096c7', '#0077b6', '#023e8a', '#48cae4', '#90e0ef']

function StatCard({ label, value, color, icon: Icon, sub }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col gap-2 ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
      <p className="font-display font-bold text-3xl">{value}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
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
    { label: 'PAYÉ',       value: charges.total_paye,  color: 'bg-green-100 text-green-700' },
    { label: 'EN ATTENTE', value: charges.restant,     color: 'bg-yellow-100 text-yellow-700' },
    { label: 'EN RETARD',  value: charges.en_retard,   color: 'bg-red-100 text-red-600' },
  ]

  return (
    <div className="fade-in flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-sakan-dark">Tableau de Bord</h1>
        <p className="text-sm text-gray-400 mt-0.5">Résumé de votre situation financière.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Dettes"
          value={`${finances.total_dettes.toLocaleString()} MAD`}
          color="bg-primary-100 text-primary-800"
          sub={`${finances.en_retard} en retard`}
        />
        <StatCard
          label="Total Créances"
          value={`${finances.total_creances.toLocaleString()} MAD`}
          color="bg-green-100 text-green-800"
          sub={`${finances.echeances_j7} échéances J-7`}
        />
        <StatCard
          label="Alertes Véhicule"
          value={voiture.nb_alertes}
          color="bg-orange-100 text-orange-800"
          sub={voiture.enregistree ? 'Véhicule enregistré' : 'Aucun véhicule'}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Tiers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-gray-800">Recent Tiers</h2>
            <button onClick={() => navigate('/tiers')}
              className="text-xs text-sakan-blue font-medium hover:underline flex items-center gap-0.5">
              Manager vos Tiers <ChevronRight size={12} />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-2 text-left font-medium">Entity Name</th>
                <th className="pb-2 text-left font-medium">Type</th>
                <th className="pb-2 text-left font-medium">Contact</th>
              </tr>
            </thead>
            <tbody>
              {recentTiers.map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-medium text-gray-800">{t.name}</td>
                  <td className="py-3"><Badge color="blue">{t.type}</Badge></td>
                  <td className="py-3 text-gray-400 text-xs">{t.contact || '—'}</td>
                </tr>
              ))}
              {recentTiers.length === 0 && (
                <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-sm">Aucun tiers</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Charges statut */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-primary-100 rounded-md flex items-center justify-center">
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-sakan-blue"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5"/></svg>
              </div>
              <span className="font-display font-semibold text-gray-800">charges.statut</span>
            </div>
            <span className="text-xs text-gray-400">{charges.total_du.toLocaleString()} MAD Total</span>
          </div>
          <div className="flex flex-col gap-3">
            {chargesStatut.map(s => (
              <div key={s.label} className={`rounded-xl p-3 flex items-center justify-between ${s.color}`}>
                <span className="text-xs font-semibold tracking-wide">{s.label}</span>
                <span className="font-display font-bold">{typeof s.value === 'number' && s.label !== 'EN RETARD' ? `${s.value.toLocaleString()} MAD` : s.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-400">Taux paiement</span>
            <span className="font-semibold text-green-600">{charges.taux_paiement}%</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      {charts?.charges_par_categorie?.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <h2 className="font-display font-semibold text-gray-800 mb-4">Charges par Catégorie</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts.charges_par_categorie} dataKey="total" nameKey="categorie" cx="50%" cy="50%" outerRadius={70} label>
                  {charts.charges_par_categorie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v.toLocaleString()} MAD`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h2 className="font-display font-semibold text-gray-800 mb-4">Évolution Dettes (6 mois)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.evolution_dettes}>
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v.toLocaleString()} MAD`} />
                <Bar dataKey="total" fill="#00b4d8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Vehicle alerts */}
      {voiture.alertes?.length > 0 && (
        <div className="card border border-orange-100 bg-orange-50/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-orange-500" />
            <h2 className="font-display font-semibold text-orange-700">Alertes Véhicule</h2>
          </div>
          <div className="flex flex-col gap-2">
            {voiture.alertes.map((a, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-orange-100">
                <Car size={14} className="text-orange-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">
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
