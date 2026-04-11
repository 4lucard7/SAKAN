import { useEffect, useState } from 'react'
import { maintenanceAPI, voitureAPI } from '../services/api'
import { Modal, ConfirmDialog, PageHeader, EmptyState, Spinner, Field, StatutBadge } from '../components/Ui'
import { Plus, Pencil, Trash2, Wrench, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

function MaintenanceForm({ initial = {}, onSave, loading }) {
  const [form, setForm] = useState({
    part_name: '', kilometrage_actuel: '', limit_km: '',
    last_change_date: '', duration: '', cost: '', notes: '',
    ...initial
  })
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <Field label="Pièce / Type d'entretien" required>
        <input name="part_name" required value={form.part_name} onChange={h}
          className="input" placeholder="Vidange, Pneus, Freins..." />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Km actuel" required>
          <input name="kilometrage_actuel" type="number" min="0" required
            value={form.kilometrage_actuel} onChange={h} className="input" placeholder="45200" />
        </Field>
        <Field label="Km limite (intervalle)">
          <input name="limit_km" type="number" min="0"
            value={form.limit_km} onChange={h} className="input" placeholder="10000" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date du dernier changement" required>
          <input name="last_change_date" type="date" required
            value={form.last_change_date} onChange={h} className="input" />
        </Field>
        <Field label="Durée (mois)">
          <input name="duration" type="number" min="1" max="120"
            value={form.duration} onChange={h} className="input" placeholder="6" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Coût (MAD)">
          <input name="cost" type="number" min="0" step="0.01"
            value={form.cost} onChange={h} className="input" placeholder="0.00" />
        </Field>
        <Field label="Notes">
          <input name="notes" value={form.notes} onChange={h}
            className="input" placeholder="Optionnel..." />
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

function AlerteBadge({ statut }) {
  if (!statut || statut === 'ok') return null
  const map = {
    alerte_date:  { label: 'J-14',        color: 'bg-yellow-100 text-yellow-700' },
    alerte_km:    { label: '≤ 500 km',    color: 'bg-orange-100 text-orange-700' },
    depasse:      { label: 'Dépassé !',   color: 'bg-red-100 text-red-600'       },
  }
  const { label, color } = map[statut] || { label: statut, color: 'bg-gray-100 text-gray-500' }
  return <span className={`badge ${color} flex items-center gap-1`}><AlertTriangle size={10} />{label}</span>
}

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState([])
  const [voiture,      setVoiture]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState(null)
  const [deleting,     setDeleting]     = useState(null)
  const [saving,       setSaving]       = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([maintenanceAPI.list(), voitureAPI.get()])
      .then(([m, v]) => { setMaintenances(m.data); setVoiture(v.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const save = async (form) => {
    setSaving(true)
    try {
      if (modal === 'create') {
        await maintenanceAPI.create(form); toast.success('Maintenance ajoutée !')
      } else {
        await maintenanceAPI.update(modal.m.id, form); toast.success('Maintenance modifiée !')
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
      await maintenanceAPI.delete(deleting.id); toast.success('Maintenance supprimée.')
      setDeleting(null); load()
    } catch { toast.error('Erreur de suppression.') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size={32} /></div>

  if (!voiture) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Wrench size={40} className="text-gray-200" />
      <p className="text-gray-400 font-medium">Enregistrez d'abord un véhicule.</p>
    </div>
  )

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title="Voiture Maintenance"
        subtitle="Monitor and log service history for all your registered vehicles."
        action={
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={16} /> Ajouter maintenance
          </button>
        }
      />

      {/* Vehicle info */}
      <div className="card flex items-center gap-4 py-4">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Wrench size={18} className="text-sakan-blue" />
        </div>
        <div>
          <p className="font-display font-semibold text-gray-800">{voiture.car_name}</p>
          <p className="text-xs text-gray-400">{Number(voiture.current_km).toLocaleString()} km actuels</p>
        </div>
        <div className="ml-auto flex gap-6 text-center">
          <div>
            <p className="font-display font-bold text-xl text-sakan-blue">{maintenances.length}</p>
            <p className="text-xs text-gray-400">Entretiens</p>
          </div>
          <div>
            <p className="font-display font-bold text-xl text-orange-500">
              {maintenances.filter(m => m.statut_alerte && m.statut_alerte !== 'ok').length}
            </p>
            <p className="text-xs text-gray-400">Alertes</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Wrench size={15} className="text-gray-400" />
          <h2 className="font-display font-semibold text-gray-800">Maintenance History</h2>
        </div>
        {maintenances.length === 0 ? (
          <EmptyState icon="🔧" title="Aucun entretien" description="Ajoutez votre premier entretien pour commencer le suivi." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Part Name', 'Current KM', 'Limit KM', 'Last Change', 'Duration', 'Alerte', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maintenances.map(m => (
                <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-primary-50/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{m.part_name}</td>
                  <td className="py-3 px-4">{Number(m.kilometrage_actuel).toLocaleString()} km</td>
                  <td className={`py-3 px-4 ${m.statut_alerte === 'alerte_km' || m.statut_alerte === 'depasse' ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
                    {m.limit_km ? `${Number(m.limit_km).toLocaleString()} km` : '—'}
                  </td>
                  <td className="py-3 px-4">{new Date(m.last_change_date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {m.duration ? `${m.duration} mois` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <AlerteBadge statut={m.statut_alerte} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ m })}
                        className="p-1.5 rounded-lg hover:bg-primary-100 text-gray-400 hover:text-sakan-blue transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleting(m)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} size="lg"
        title={modal === 'create' ? 'Ajouter un entretien' : 'Modifier l\'entretien'}>
        <MaintenanceForm initial={modal?.m} onSave={save} loading={saving} />
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={del} loading={saving}
        title="Supprimer l'entretien"
        message={`Supprimer l'entretien "${deleting?.part_name}" ?`} />
    </div>
  )
}
