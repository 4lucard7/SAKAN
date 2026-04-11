import { useEffect, useState } from 'react'
import { chargesAPI } from '../services/api'
import { Modal, ConfirmDialog, PageHeader, EmptyState, Spinner, StatutBadge, Field, Select } from '../components/Ui'
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const now = new Date()

function ChargeForm({ initial = {}, onSave, loading }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    libelle: '', categorie: '', montant: '', jour_echeance: '', ...initial
  })
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <Field label={t('charges.label')} required>
        <input name="libelle" required value={form.libelle} onChange={h}
          className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder={t('charges.placeholder_libelle')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('charges.category')}>
          <Select name="categorie" value={form.categorie} onChange={h}>
            <option value="">{t('common.loading')}</option>
            {['logement', 'internet', 'transport', 'alimentation', 'santé', 'éducation', 'loisirs', 'autre'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </Select>
        </Field>
        <Field label={`${t('common.amount')} (MAD)`} required>
          <input name="montant" type="number" min="0.01" step="0.01" required
            value={form.montant} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="0.00" />
        </Field>
      </div>
      <Field label={t('charges.due_day')} required>
        <input name="jour_echeance" type="number" min="1" max="28" required
          value={form.jour_echeance} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="1" />
      </Field>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

function MonthSection({ mois, annee, charges, onStatut, onEdit, onDelete }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(true)
  const total = charges.reduce((s, c) => s + Number(c.montant), 0)
  
  const monthName = new Date(annee, mois - 1).toLocaleString(i18n.language, { month: 'long', year: 'numeric' })

  return (
    <div className="card p-0 overflow-hidden dark:bg-slate-900 dark:border-white/10 transition-colors">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-sakan-blue">
              <rect x="1" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 1v4M11 1v4M1 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="font-display font-semibold text-gray-800 dark:text-white capitalize">{monthName}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">{t('charges.month_summary', { count: charges.length })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{t('history').toUpperCase()}</span>
          <span className="font-display font-bold text-gray-800 dark:text-white">{total.toLocaleString()} MAD</span>
          {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
                  <th className="py-2 px-6 text-left font-medium">{t('charges.label')}</th>
                  <th className="py-2 px-6 text-left font-medium">{t('charges.category')}</th>
                  <th className="py-2 px-6 text-left font-medium">{t('common.amount')}</th>
                  <th className="py-2 px-6 text-left font-medium">{t('charges.due_day')}</th>
                  <th className="py-2 px-6 text-left font-medium">{t('common.status')}</th>
                  <th className="py-2 px-6 text-left font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {charges.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-slate-800 last:border-0 hover:bg-primary-50/30 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6 font-medium text-gray-800 dark:text-slate-200">{c.libelle}</td>
                    <td className="py-3 px-6">
                      {c.categorie ? (
                        <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex items-center gap-1 w-fit">
                          {c.categorie}
                        </span>
                      ) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="py-3 px-6 font-semibold dark:text-white">{Number(c.montant).toLocaleString()} MAD</td>
                    <td className="py-3 px-6 text-gray-500 dark:text-slate-400">{t('common.date')} {c.jour_echeance}</td>
                    <td className="py-3 px-6">
                      <select
                        value={c.statut}
                        onChange={e => onStatut(c.id, e.target.value)}
                        className="text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sakan-blue
                          bg-transparent dark:text-slate-200"
                      >
                        <option value="en_attente" className="dark:bg-slate-900">{t('status.en_attente')}</option>
                        <option value="payee" className="dark:bg-slate-900">{t('status.payee')}</option>
                        <option value="en_retard" className="dark:bg-slate-900">{t('status.en_retard')}</option>
                      </select>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-slate-800 text-gray-400 hover:text-sakan-blue dark:hover:text-sakan transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onDelete(c)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChargesPage() {
  const { t } = useTranslation()
  const [charges,    setCharges]    = useState([])
  const [historique, setHistorique] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [modal,      setModal]      = useState(null)
  const [deleting,   setDeleting]   = useState(null)
  const [saving,     setSaving]     = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [h] = await Promise.all([chargesAPI.historique()])
      setHistorique(h.data)
      const allCharges = await Promise.all(
        h.data.slice(0, 6).map(m => chargesAPI.list({ mois: m.mois, annee: m.annee }))
      )
      const merged = allCharges.flatMap(r => r.data.charges || [])
      setCharges(merged)
    } catch { setCharges([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const currentMonth = charges.filter(c => c.mois === now.getMonth() + 1 && c.annee === now.getFullYear())
  const totalAttente = currentMonth.filter(c => c.statut === 'en_attente').reduce((s, c) => s + Number(c.montant), 0)
  const totalPaye    = currentMonth.filter(c => c.statut === 'payee').reduce((s, c) => s + Number(c.montant), 0)

  const filtered = charges.filter(c =>
    c.libelle.toLowerCase().includes(search.toLowerCase()) ||
    (c.categorie || '').toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc, c) => {
    const key = `${c.annee}-${String(c.mois).padStart(2, '0')}`
    if (!acc[key]) acc[key] = { mois: c.mois, annee: c.annee, charges: [] }
    acc[key].charges.push(c)
    return acc
  }, {})
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))

  const updateStatut = async (id, statut) => {
    try {
      await chargesAPI.updateStatut(id, statut)
      setCharges(prev => prev.map(c => c.id === id ? { ...c, statut } : c))
      toast.success(t('common.save'))
    } catch { toast.error('Error') }
  }

  const save = async (form) => {
    setSaving(true)
    try {
      if (modal === 'create') {
        await chargesAPI.create(form); toast.success(t('common.save'))
      } else {
        await chargesAPI.update(modal.charge.id, form); toast.success(t('common.save'))
      }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try {
      await chargesAPI.delete(deleting.id); toast.success(t('common.delete'))
      setDeleting(null); load()
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title={t('charges.title')}
        subtitle={t('charges.subtitle')}
        action={
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={16} /> {t('charges.add_charge')}
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card flex items-center gap-4 dark:bg-slate-900 dark:border-white/10 transition-colors">
          <div className="w-11 h-11 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{t('charges.total_pending')}</p>
            <p className="font-display font-bold text-2xl text-gray-800 dark:text-white transition-colors">{totalAttente.toLocaleString()} MAD</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 dark:bg-slate-900 dark:border-white/10 transition-colors">
          <div className="w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">{t('charges.total_paid')}</p>
            <p className="font-display font-bold text-2xl text-gray-800 dark:text-white transition-colors">{totalPaye.toLocaleString()} MAD</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('common.search')} className="input pl-9 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
      </div>

      {/* Grouped by month */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : sortedGroups.length === 0 ? (
        <EmptyState icon="🗂️" title={t('common.no_data')} description={t('charges.subtitle')} />
      ) : (
        <div className="flex flex-col gap-4">
          {sortedGroups.map(([key, { mois, annee, charges: ch }]) => (
            <MonthSection
              key={key}
              mois={mois} annee={annee} charges={ch}
              onStatut={updateStatut}
              onEdit={c => setModal({ charge: c })}
              onDelete={c => setDeleting(c)}
            />
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? t('charges.add_charge') : t('common.edit')}>
        <ChargeForm initial={modal?.charge} onSave={save} loading={saving} />
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={del} loading={saving}
        title={t('common.delete')}
        message={`${t('common.delete')} "${deleting?.libelle}" ?`} />
    </div>
  )
}
