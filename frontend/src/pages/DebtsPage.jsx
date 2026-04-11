import { useEffect, useState } from 'react'
import { debtsAPI, tiersAPI } from '../services/api'
import { Modal, ConfirmDialog, Avatar, PageHeader, EmptyState, Spinner, StatutBadge, Field, Select } from '../components/Ui'
import { Plus, Pencil, Trash2, Search, TrendingUp, TrendingDown, MoreVertical, Coins } from 'lucide-react'
import toast from 'react-hot-toast'

function DebtForm({ initial = {}, tiers, onSave, loading }) {
  const [form, setForm] = useState({
    tier_id: '', type: 'outflow', total_prete: '', due_date: '', notes: '', ...initial,
    tier_id: initial?.tier_id || initial?.tier?.id || '',
  })
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <Field label="Tiers" required>
        <Select name="tier_id" value={form.tier_id} onChange={h} required>
          <option value="">Sélectionner un tiers</option>
          {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" required>
          <Select name="type" value={form.type} onChange={h}>
            <option value="outflow">Dette (outflow)</option>
            <option value="inflow">Créance (inflow)</option>
          </Select>
        </Field>
        <Field label="Montant (MAD)" required>
          <input name="total_prete" type="number" step="0.01" min="0.01" required
            value={form.total_prete} onChange={h} className="input" placeholder="0.00" />
        </Field>
      </div>
      <Field label="Date d'échéance">
        <input name="due_date" type="date" value={form.due_date || ''} onChange={h} className="input" />
      </Field>
      <Field label="Notes">
        <textarea name="notes" value={form.notes || ''} onChange={h}
          className="input resize-none h-20" placeholder="Notes optionnelles..." />
      </Field>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

function RemboursementForm({ debt, onSave, loading }) {
  const [montant, setMontant] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(montant) }} className="flex flex-col gap-4">
      <div className="bg-primary-50 rounded-xl p-4 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Total prêté</span><span className="font-semibold">{Number(debt.total_prete).toLocaleString()} MAD</span></div>
        <div className="flex justify-between mt-1"><span className="text-gray-500">Déjà remboursé</span><span className="font-semibold text-green-600">{Number(debt.total_rembourse).toLocaleString()} MAD</span></div>
        <div className="flex justify-between mt-1 border-t border-primary-200 pt-1"><span className="text-gray-700 font-medium">Reste</span><span className="font-bold text-sakan-blue">{Number(debt.reste).toLocaleString()} MAD</span></div>
      </div>
      <Field label="Montant du remboursement (MAD)" required>
        <input type="number" step="0.01" min="0.01" max={debt.reste} required
          value={montant} onChange={e => setMontant(e.target.value)}
          className="input" placeholder="0.00" />
      </Field>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Enregistrement...' : 'Confirmer'}
        </button>
      </div>
    </form>
  )
}

export default function DebtsPage() {
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
      .then(([d, t]) => { setDebts(d.data); setTiers(t.data) })
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
        await debtsAPI.create(form); toast.success('Transaction créée !')
      } else {
        await debtsAPI.update(modal.debt.id, form); toast.success('Transaction modifiée !')
      }
      setModal(null); load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(e => toast.error(e))
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try {
      await debtsAPI.delete(deleting.id); toast.success('Transaction supprimée.')
      setDeleting(null); load()
    } catch { toast.error('Erreur de suppression.') }
    finally { setSaving(false) }
  }

  const rembourser = async (montant) => {
    setSaving(true)
    try {
      await debtsAPI.rembourser(remb.id, Number(montant))
      toast.success('Remboursement enregistré !')
      setRemb(null); load()
    } catch { toast.error('Erreur.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title="Suivi des dettes"
        action={
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={16} /> Ajouter dettes
          </button>
        }
      />

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'TOTAL PRÊTÉ',      value: totals.prete,     color: 'border-l-4 border-sakan-blue', icon: TrendingUp   },
          { label: 'TOTAL REMBOURSÉ',  value: totals.rembourse, color: 'border-l-4 border-red-400',    icon: TrendingDown },
          { label: 'RESTE',            value: totals.reste,     color: 'border-l-4 border-green-500',  icon: Coins        },
        ].map(c => (
          <div key={c.label} className={`card ${c.color}`}>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{c.label}</p>
            <p className="font-display font-bold text-2xl text-gray-800 mt-1">{c.value.toLocaleString()} MAD</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..." className="input pl-9" />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-800">All Transactions</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="💳" title="Aucune transaction" description="Enregistrez votre première dette ou créance." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Tier Name', 'Type', 'Total Prêté', 'Total Remboursé', 'Reste', 'Due Date', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-primary-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={d.tier?.name} size="sm" />
                      <span className="font-medium">{d.tier?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${d.type === 'outflow' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {d.type === 'outflow' ? 'Dette' : 'Créance'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{Number(d.total_prete).toLocaleString()} MAD</td>
                  <td className="py-3 px-4 text-green-600 font-medium">{Number(d.total_rembourse).toLocaleString()} MAD</td>
                  <td className="py-3 px-4 font-bold text-sakan-blue">{Number(d.reste).toLocaleString()} MAD</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">
                    {d.due_date ? new Date(d.due_date).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ debt: d })}
                        className="p-1.5 rounded-lg hover:bg-primary-100 text-gray-400 hover:text-sakan-blue transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleting(d)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                      {Number(d.reste) > 0 && (
                        <button onClick={() => setRemb(d)}
                          className="p-1.5 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors" title="Rembourser">
                          <MoreVertical size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} size="lg"
        title={modal === 'create' ? 'Ajouter une transaction' : 'Modifier la transaction'}>
        <DebtForm initial={modal?.debt} tiers={tiers} onSave={save} loading={saving} />
      </Modal>

      <Modal open={!!remb} onClose={() => setRemb(null)}
        title="Enregistrer un remboursement">
        {remb && <RemboursementForm debt={remb} onSave={rembourser} loading={saving} />}
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={del} loading={saving}
        title="Supprimer la transaction"
        message={`Supprimer cette transaction avec ${deleting?.tier?.name} ?`} />
    </div>
  )
}
