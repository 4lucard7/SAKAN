import { useEffect, useState } from 'react'
import { tiersAPI } from '../services/api'
import { Modal, ConfirmDialog, Avatar, PageHeader, EmptyState, Spinner, Field, Select } from '../components/ui/index'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPES = ['ami', 'famille', 'collègue', 'autre']

function TierForm({ initial = {}, onSave, loading }) {
  const [form, setForm] = useState({ name: '', type: 'ami', contact: '', ...initial })
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <Field label="Nom" required>
        <input name="name" required value={form.name} onChange={h} className="input" placeholder="Jean Dupont" />
      </Field>
      <Field label="Type" required>
        <Select name="type" value={form.type} onChange={h}>
          {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </Select>
      </Field>
      <Field label="Contact">
        <input name="contact" value={form.contact} onChange={h} className="input" placeholder="+212 6XX XXX XXX" />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

export default function TiersPage() {
  const [tiers,   setTiers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(null) // null | 'create' | { tier }
  const [deleting,setDeleting]= useState(null)
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    tiersAPI.list().then(r => setTiers(r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = tiers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  )

  const save = async (form) => {
    setSaving(true)
    try {
      if (modal === 'create') {
        await tiersAPI.create(form); toast.success('Tiers créé !')
      } else {
        await tiersAPI.update(modal.tier.id, form); toast.success('Tiers modifié !')
      }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try {
      await tiersAPI.delete(deleting.id); toast.success('Tiers supprimé.')
      setDeleting(null); load()
    } catch { toast.error('Impossible de supprimer.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title="Gestion des tiers"
        action={
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={16} /> Ajouter des tiers
          </button>
        }
      />

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..." className="input pl-9" />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title="Aucun tiers" description="Ajoutez vos premiers tiers pour commencer le suivi." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="py-3 px-6 text-left font-medium">Name</th>
                <th className="py-3 px-4 text-left font-medium">Type</th>
                <th className="py-3 px-4 text-left font-medium">Contact</th>
                <th className="py-3 px-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-primary-50/40 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} size="sm" />
                      <span className="font-medium text-gray-800">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge bg-primary-100 text-primary-700">
                      {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{t.contact || '—'}</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setModal({ tier: t })}
                        className="p-1.5 rounded-lg hover:bg-primary-100 text-gray-400 hover:text-sakan-blue transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(t)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Ajouter un tiers' : 'Modifier le tiers'}>
        <TierForm initial={modal?.tier} onSave={save} loading={saving} />
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={del} loading={saving}
        title="Supprimer le tiers"
        message={`Supprimer "${deleting?.name}" ? Ses transactions seront aussi supprimées.`} />
    </div>
  )
}
