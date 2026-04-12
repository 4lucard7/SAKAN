import { useEffect, useState } from 'react'
import { debtsAPI, tiersAPI } from '../services/api'
import { Modal, ConfirmDialog, Avatar, PageHeader, EmptyState, Spinner, StatutBadge, Field, Select } from '../components/Ui'
import { Plus, Pencil, Trash2, Search, TrendingUp, TrendingDown, MoreVertical, Coins } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

function DebtForm({ initial = {}, tiers, onSave, loading }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    tier_id: '', type: 'outflow', total_prete: '', due_date: '', notes: '', ...initial,
    tier_id: initial?.tier_id || initial?.tier?.id || '',
  })
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <Field label={t('common.tiers')} required>
        <Select name="tier_id" value={form.tier_id} onChange={h} required>
          <option value="">{t('debts.form_tier')}</option>
          {tiers.map(t_item => <option key={t_item.id} value={t_item.id}>{t_item.name}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label={t('common.type')} required>
          <Select name="type" value={form.type} onChange={h}>
            <option value="outflow">{t('status.dette')}</option>
            <option value="inflow">{t('status.creance')}</option>
          </Select>
        </Field>
        <Field label={`${t('common.amount')} (MAD)`} required>
          <input name="total_prete" type="number" step="0.01" min="0.01" required
            value={form.total_prete} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="0.00" />
        </Field>
      </div>
      <Field label={t('debts.due_date')}>
        <input name="due_date" type="date" value={form.due_date || ''} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
      </Field>
      <Field label={t('common.notes')}>
        <textarea name="notes" value={form.notes || ''} onChange={h}
          className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none h-20" placeholder={t('debts.form_notes')} />
      </Field>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

function RemboursementForm({ debt, onSave, loading }) {
  const { t } = useTranslation()
  const [montant, setMontant] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(montant) }} className="flex flex-col gap-4">
      <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-4 text-sm border border-primary-100 dark:border-primary-900/20">
        <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">{t('debts.summary_prete')}</span><span className="font-semibold dark:text-white">{Number(debt.total_prete).toLocaleString()} MAD</span></div>
        <div className="flex justify-between mt-1"><span className="text-gray-500 dark:text-slate-400">{t('debts.summary_rembourse')}</span><span className="font-semibold text-green-600 dark:text-green-400">{Number(debt.total_rembourse).toLocaleString()} MAD</span></div>
        <div className="flex justify-between mt-1 border-t border-primary-200 dark:border-slate-700 pt-1"><span className="text-gray-700 dark:text-slate-200 font-medium">{t('debts.summary_reste')}</span><span className="font-bold text-sakan-blue dark:text-sakan">{Number(debt.reste).toLocaleString()} MAD</span></div>
      </div>
      <Field label={`${t('debts.summary_reste')} (MAD)`} required>
        <input type="number" step="0.01" min="0.01" max={debt.reste} required
          value={montant} onChange={e => setMontant(e.target.value)}
          className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="0.00" />
      </Field>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t('common.loading') : t('common.confirm')}
        </button>
      </div>
    </form>
  )
}

export default function DebtsPage() {
  const { t, i18n } = useTranslation()
  const [debts,   setDebts]   = useState([])
  const [tiers,   setTiers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(null)
  const [deleting,setDeleting]= useState(null)
  const [remb,    setRemb]    = useState(null)
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([debtsAPI.list(), tiersAPI.list()])
      .then(([d, t_res]) => { setDebts(d.data); setTiers(t_res.data) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const totals = {
    prete:      debts.reduce((s, d) => s + Number(d.total_prete),      0),
    rembourse:  debts.reduce((s, d) => s + Number(d.total_rembourse),  0),
    reste:      debts.reduce((s, d) => s + Number(d.reste),            0),
  }

  const filtered = debts.filter(d =>
    (d.tier?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const save = async (form) => {
    setSaving(true)
    try {
      if (modal === 'create') {
        await debtsAPI.create(form); toast.success(t('common.save'))
      } else {
        await debtsAPI.update(modal.debt.id, form); toast.success(t('common.save'))
      }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(e => toast.error(e))
      else toast.error(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try {
      await debtsAPI.delete(deleting.id); toast.success(t('common.delete'))
      setDeleting(null); load()
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  const rembourser = async (montant) => {
    setSaving(true)
    try {
      await debtsAPI.rembourser(remb.id, Number(montant))
      toast.success(t('common.save'))
      setRemb(null); load()
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title={t('debts.title')}
        action={
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={16} /> {t('debts.add_debt')}
          </button>
        }
      />

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('debts.total_prete'),      value: totals.prete,     color: 'border-l-4 border-sakan-blue dark:border-sakan', icon: TrendingUp   },
          { label: t('debts.total_rembourse'),  value: totals.rembourse, color: 'border-l-4 border-red-400',    icon: TrendingDown },
          { label: t('debts.reste'),            value: totals.reste,     color: 'border-l-4 border-green-500',  icon: Coins        },
        ].map(c => (
          <div key={c.label} className={`card dark:bg-slate-900 dark:border-white/10 dark:border-y dark:border-r ${c.color} transition-colors`}>
            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-widest font-medium">{c.label}</p>
            <p className="font-display font-bold text-2xl text-gray-800 dark:text-white mt-1 transition-colors">{c.value.toLocaleString()} MAD</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('debts.placeholder_search')} className="input pl-9 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden dark:bg-slate-900 dark:border-white/10 transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="font-display font-semibold text-gray-800 dark:text-white">{t('debts.all_transactions')}</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="💳" title={t('common.no_data')} description={t('debts.all_transactions')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
                  <th className="py-3 px-6 text-left font-medium">{t('debts.tier_name')}</th>
                  <th className="py-3 px-6 text-left font-medium">{t('common.type')}</th>
                  <th className="py-3 px-6 text-left font-medium">{t('debts.total_prete')}</th>
                  <th className="py-3 px-6 text-left font-medium">{t('debts.total_rembourse')}</th>
                  <th className="py-3 px-6 text-left font-medium">{t('debts.reste')}</th>
                  <th className="py-3 px-6 text-left font-medium">{t('debts.due_date')}</th>
                  <th className="py-3 px-6 text-left font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 dark:border-slate-800 last:border-0 hover:bg-primary-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <Avatar name={d.tier?.name} size="sm" />
                        <span className="font-medium dark:text-slate-200">{d.tier?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`badge ${d.type === 'outflow' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {d.type === 'outflow' ? t('status.dette') : t('status.creance')}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-semibold dark:text-white">{Number(d.total_prete).toLocaleString()} MAD</td>
                    <td className="py-3 px-6 text-green-600 dark:text-green-400 font-medium">{Number(d.total_rembourse).toLocaleString()} MAD</td>
                    <td className="py-3 px-6 font-bold text-sakan-blue dark:text-sakan">{Number(d.reste).toLocaleString()} MAD</td>
                    <td className="py-3 px-6 text-gray-400 dark:text-slate-500 text-xs">
                      {d.due_date ? new Date(d.due_date).toLocaleDateString(i18n.language) : '—'}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ debt: d })}
                          className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-slate-800 text-gray-400 hover:text-sakan-blue dark:hover:text-sakan transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleting(d)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                        {Number(d.reste) > 0 && (
                          <button onClick={() => setRemb(d)}
                            className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600 transition-colors" title={t('common.rembourser')}>
                            <MoreVertical size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} size="lg"
        title={modal === 'create' ? t('debts.add_debt') : t('common.edit')}>
        <DebtForm initial={modal?.debt} tiers={tiers} onSave={save} loading={saving} />
      </Modal>

      <Modal open={!!remb} onClose={() => setRemb(null)}
        title={t('debts.enregistrer_rembourse')}>
        {remb && <RemboursementForm debt={remb} onSave={rembourser} loading={saving} />}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={del} loading={saving}
        title={t('common.delete')}
        message={`${t('common.delete')} "${deleting?.tier?.name}" ?`} />
    </div>
  )
}
