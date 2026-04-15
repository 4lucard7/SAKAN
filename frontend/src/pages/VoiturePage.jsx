import { useEffect, useState } from 'react'
import { voitureAPI } from '../services/api'
import { Modal, PageHeader, Spinner, Field } from '../components/Ui'
import { Plus, Pencil, Car, Gauge, Shield, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

function VoitureForm({ initial = {}, onSave, loading }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    car_name: '', current_km: '',
    assurance_expiry: '', vignette_expiry: '',
    controle_technique_expiry: '', carte_grise_expiry: '',
    ...initial
  })
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label={t('vehicle.name')} required>
          <input name="car_name" required value={form.car_name} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder={t('vehicle.placeholder_name')} />
        </Field>
        <Field label={t('vehicle.current_km')} required>
          <input name="current_km" type="number" min="0" required value={form.current_km} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="42500" />
        </Field>
      </div>
      <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">{t('vehicle.documents')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'assurance_expiry',          label: t('vehicle.doc_assurance') },
            { name: 'vignette_expiry',            label: t('vehicle.doc_vignette') },
            { name: 'controle_technique_expiry',  label: t('vehicle.doc_controle') },
            { name: 'carte_grise_expiry',         label: t('vehicle.doc_carte_grise') },
          ].map(f => (
            <Field key={f.name} label={f.label}>
              <input name={f.name} type="date" value={form[f.name] || ''} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            </Field>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

function DocBadge({ label, expiry, statut }) {
  const { t, i18n } = useTranslation()
  if (!expiry) return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between border border-transparent dark:border-slate-800">
      <span className="text-sm text-gray-400 dark:text-slate-500">{label}</span>
      <span className="badge bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500">{t('vehicle.doc_not_set')}</span>
    </div>
  )
  const color = statut?.includes('expire') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    : statut?.includes('j7') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    : statut?.includes('j30') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between border border-transparent dark:border-slate-800">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{new Date(expiry).toLocaleDateString(i18n.language)}</p>
      </div>
      <span className={`badge ${color}`}>{statut || 'OK'}</span>
    </div>
  )
}

const formatKm = (value) => {
  const km = Number(value)
  return Number.isFinite(km) ? km.toLocaleString() : '0'
}

export default function VoiturePage() {
  const { t } = useTranslation()
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
        await voitureAPI.update(form)
      } else {
        await voitureAPI.create(form)
      }
      toast.success(t('common.save'))
      setModal(false); load()
    } catch (err) {
      if (err.response?.status === 404 && voiture) {
        // If the backend reports no voiture, fall back to creating it.
        try {
          await voitureAPI.create(form)
          toast.success(t('common.save'))
          setModal(false); load()
          return
        } catch (createErr) {
          toast.error(createErr.response?.data?.message || 'Error')
          return
        }
      }
      toast.error(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size={32} /></div>

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title={t('vehicle.title')}
        subtitle={t('vehicle.subtitle')}
        action={
          <button className="btn-primary" onClick={() => setModal(true)}>
            {voiture ? <><Pencil size={15} /> {t('common.edit')}</> : <><Plus size={15} /> {t('vehicle.add_car')}</>}
          </button>
        }
      />

      {!voiture ? (
        <div className="card flex flex-col items-center py-16 gap-4 dark:bg-slate-900 dark:border-white/10">
          <Car size={48} className="text-gray-200 dark:text-slate-800" />
          <p className="font-display font-semibold text-gray-400 dark:text-slate-600">{t('vehicle.no_car')}</p>
          <button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={15} /> {t('vehicle.add_car')}
          </button>
        </div>
      ) : (
        <>
          {/* Vehicle card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card flex items-center gap-4 dark:bg-slate-900 dark:border-white/10 transition-colors">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                <Car size={28} className="text-sakan-blue dark:text-sakan" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide font-medium">{t('common.type')}</p>
                <p className="font-display font-bold text-xl text-gray-800 dark:text-white transition-colors">{voiture.car_name}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4 dark:bg-slate-900 dark:border-white/10 transition-colors">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                <Gauge size={28} className="text-sakan-blue dark:text-sakan" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide font-medium">{t('vehicle.current_km')}</p>
                <p className="font-display font-bold text-xl text-gray-800 dark:text-white transition-colors">
                    {formatKm(voiture.current_km)} km
                </p>
              </div>
            </div>
          </div>

          {/* Responsabilités */}
          <div className="card dark:bg-slate-900 dark:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-sakan-blue dark:text-sakan" />
              <h2 className="font-display font-semibold text-gray-800 dark:text-white">{t('vehicle.documents')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: t('vehicle.doc_assurance'),          key: 'assurance_expiry',         statusKey: 'assurance' },
                { label: t('vehicle.doc_vignette'),           key: 'vignette_expiry',          statusKey: 'vignette' },
                { label: t('vehicle.doc_controle'), key: 'controle_technique_expiry',statusKey: 'controle_technique' },
                { label: t('vehicle.doc_carte_grise'),        key: 'carte_grise_expiry',       statusKey: 'carte_grise' },
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
            <div className="card border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-orange-500" />
                <h3 className="font-semibold text-orange-700 dark:text-orange-400 text-sm">{t('vehicle.alerts')}</h3>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(voiture.responsabilites)
                  .filter(([_, v]) => v.statut !== 'ok')
                  .map(([k, v]) => (
                    <div key={k} className="text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
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
        title={voiture ? t('vehicle.modify_car') : t('vehicle.add_car')}>
        <VoitureForm initial={voiture || {}} onSave={save} loading={saving} />
      </Modal>
    </div>
  )
}
