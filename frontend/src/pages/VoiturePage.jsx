import { useEffect, useState } from 'react'
import { voitureAPI } from '../services/api'
import { Modal, PageHeader, Spinner, Field } from '../components/ui/index'
import { Plus, Pencil, Car, Gauge, Shield, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

function VoitureForm({ initial = {}, onSave, loading }) {
  const [form, setForm] = useState({
    car_name: '', current_km: '',
    assurance_expiry: '', vignette_expiry: '',
    controle_technique_expiry: '', carte_grise_expiry: '',
    ...initial
  })
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom du véhicule" required>
          <input name="car_name" required value={form.car_name} onChange={h} className="input" placeholder="Peugeot 3008 GT" />
        </Field>
        <Field label="Kilométrage actuel" required>
          <input name="current_km" type="number" min="0" required value={form.current_km} onChange={h} className="input" placeholder="42500" />
        </Field>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Documents & Responsabilités</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'assurance_expiry',          label: 'Expiry Assurance' },
            { name: 'vignette_expiry',            label: 'Expiry Vignette' },
            { name: 'controle_technique_expiry',  label: 'Expiry Contrôle Technique' },
            { name: 'carte_grise_expiry',         label: 'Expiry Carte Grise' },
          ].map(f => (
            <Field key={f.name} label={f.label}>
              <input name={f.name} type="date" value={form[f.name] || ''} onChange={h} className="input" />
            </Field>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

function DocBadge({ label, expiry, statut }) {
  if (!expiry) return (
    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="badge bg-gray-100 text-gray-400">Non renseigné</span>
    </div>
  )
  const color = statut?.includes('expire') ? 'bg-red-100 text-red-600'
    : statut?.includes('j7') ? 'bg-red-100 text-red-600'
    : statut?.includes('j30') ? 'bg-yellow-100 text-yellow-700'
    : 'bg-green-100 text-green-700'
  return (
    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{new Date(expiry).toLocaleDateString('fr-FR')}</p>
      </div>
      <span className={`badge ${color}`}>{statut || 'OK'}</span>
    </div>
  )
}

export default function VoiturePage() {
  const [voiture, setVoiture] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    voitureAPI.get()
      .then(r => setVoiture(r.data))
      .catch(() => setVoiture(null))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const save = async (form) => {
    setSaving(true)
    try {
      if (voiture) {
        await voitureAPI.update(form); toast.success('Véhicule mis à jour !')
      } else {
        await voitureAPI.create(form); toast.success('Véhicule enregistré !')
      }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size={32} /></div>

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title="Voiture"
        subtitle="Gérez votre véhicule et suivez le kilométrage pour les alertes d'entretien."
        action={
          <button className="btn-primary" onClick={() => setModal(true)}>
            {voiture ? <><Pencil size={15} /> Modifier</> : <><Plus size={15} /> Ajouter une Voiture</>}
          </button>
        }
      />

      {!voiture ? (
        <div className="card flex flex-col items-center py-16 gap-4">
          <Car size={48} className="text-gray-200" />
          <p className="font-display font-semibold text-gray-400">Aucun véhicule enregistré</p>
          <button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={15} /> Ajouter un véhicule
          </button>
        </div>
      ) : (
        <>
          {/* Vehicle card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Car size={28} className="text-sakan-blue" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Vehicle Profile</p>
                <p className="font-display font-bold text-xl text-sakan-dark">{voiture.car_name}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Gauge size={28} className="text-sakan-blue" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Kilométrage actuel</p>
                <p className="font-display font-bold text-xl text-sakan-dark">
                  {Number(voiture.current_km).toLocaleString()} km
                </p>
              </div>
            </div>
          </div>

          {/* Responsabilités */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-sakan-blue" />
              <h2 className="font-display font-semibold text-gray-800">Documents & Responsabilités</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Assurance',          key: 'assurance_expiry',         statusKey: 'assurance' },
                { label: 'Vignette',           key: 'vignette_expiry',          statusKey: 'vignette' },
                { label: 'Contrôle Technique', key: 'controle_technique_expiry',statusKey: 'controle_technique' },
                { label: 'Carte Grise',        key: 'carte_grise_expiry',       statusKey: 'carte_grise' },
              ].map(d => (
                <DocBadge
                  key={d.key}
                  label={d.label}
                  expiry={voiture[d.key]}
                  statut={voiture.responsabilites?.[d.statusKey]?.statut}
                />
              ))}
            </div>
          </div>

          {/* Alerts from responsabilites */}
          {voiture.responsabilites && Object.values(voiture.responsabilites).some(r => r.statut !== 'ok') && (
            <div className="card border border-orange-100 bg-orange-50/50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-orange-500" />
                <h3 className="font-semibold text-orange-700 text-sm">Alertes documents</h3>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(voiture.responsabilites)
                  .filter(([_, v]) => v.statut !== 'ok')
                  .map(([k, v]) => (
                    <div key={k} className="text-sm text-orange-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                      {k} — {v.statut} {v.jours_restants != null ? `(${v.jours_restants}j restants)` : ''}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} size="lg"
        title={voiture ? 'Modifier le véhicule' : 'Ajouter un véhicule'}>
        <VoitureForm initial={voiture || {}} onSave={save} loading={saving} />
      </Modal>
    </div>
  )
}
