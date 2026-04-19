import { useEffect, useState } from 'react'
import { voituresAPI } from '../services/api'
import { Modal, ConfirmDialog, PageHeader, Spinner, Field } from '../components/Ui'
import { Plus, Pencil, Trash2, Car, Gauge, Shield, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

function VoitureForm({ initial = {}, onSave, loading }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    car_name: '', current_km: '',
    assurance_expiry: '', vignette_expiry: '',
    controle_technique_expiry: '', carte_grise_expiry: '',
    ...initial,
  })

  useEffect(() => {
    setForm({
      car_name: '', current_km: '',
      assurance_expiry: '', vignette_expiry: '',
      controle_technique_expiry: '', carte_grise_expiry: '',
      ...initial,
    })
  }, [initial])

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label={t('vehicle.name')} required>
          <input
            name="car_name"
            required
            value={form.car_name}
            onChange={h}
            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            placeholder={t('vehicle.placeholder_name')}
          />
        </Field>
        <Field label={t('vehicle.current_km')} required>
          <input
            name="current_km"
            type="number"
            min="0"
            required
            value={form.current_km}
            onChange={h}
            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            placeholder="42500"
          />
        </Field>
      </div>
      <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">{t('vehicle.documents')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'assurance_expiry', label: t('vehicle.doc_assurance') },
            { name: 'vignette_expiry', label: t('vehicle.doc_vignette') },
            { name: 'controle_technique_expiry', label: t('vehicle.doc_controle') },
            { name: 'carte_grise_expiry', label: t('vehicle.doc_carte_grise') },
          ].map(f => (
            <Field key={f.name} label={f.label}>
              <input
                name={f.name}
                type="date"
                value={form[f.name] || ''}
                onChange={h}
                className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
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

  if (!expiry) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between border border-transparent dark:border-slate-800">
        <span className="text-sm text-gray-400 dark:text-slate-500">{label}</span>
        <span className="badge bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500">{t('vehicle.doc_not_set')}</span>
      </div>
    )
  }

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
  const { t, i18n } = useTranslation()
  const [voitures, setVoitures] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  const formatDate = (value) => {
    return value ? new Date(value).toLocaleDateString(i18n.language) : ''
  }

  const load = () => {
    setLoading(true)
    voituresAPI.list()
      .then(r => {
        setVoitures(r.data)
        setSelected(r.data[0] || null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const save = async (form) => {
    setSaving(true)
    try {
      if (modal === 'create') {
        await voituresAPI.create(form)
      } else {
        await voituresAPI.update(modal.voiture.id, form)
      }
      toast.success(t('common.save'))
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    setSaving(true)
    try {
      await voituresAPI.delete(deleting.id)
      toast.success(t('common.delete'))
      setDeleting(null)
      load()
    } catch {
      toast.error('Error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size={32} /></div>
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title={t('vehicle.title')}
        subtitle={t('vehicle.subtitle')}
        action={
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={15} /> {t('vehicle.add_car')}
          </button>
        }
      />

      {voitures.length === 0 ? (
        <div className="card flex flex-col items-center py-16 gap-4 dark:bg-slate-900 dark:border-white/10">
          <Car size={48} className="text-gray-200 dark:text-slate-800" />
          <p className="font-display font-semibold text-gray-400 dark:text-slate-600">{t('vehicle.no_car')}</p>
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={15} /> {t('vehicle.add_car')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {voitures.map(car => (
              <div
                key={car.id}
                onClick={() => setSelected(car)}
                className={`card p-5 rounded-3xl border transition cursor-pointer ${selected?.id === car.id ? 'border-sakan-blue/30 bg-sakan-blue/5 dark:bg-sakan-blue/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400 font-semibold">{t('vehicle.name')}</p>
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{car.car_name}</h3>
                  </div>
                  <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-900/30">
                    <Car size={20} className="text-sakan-blue dark:text-sakan" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-2xl bg-gray-50 dark:bg-slate-800 p-4">
                    <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide font-medium">{t('vehicle.current_km')}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{formatKm(car.current_km)} km</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{car.assurance_expiry ? formatDate(car.assurance_expiry) : t('vehicle.no_document')}</span>
                    <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{car.vignette_expiry ? t('vehicle.vignette') : t('vehicle.no_document')}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setModal({ voiture: car }) }}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-2xl hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Pencil size={14} /> {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDeleting(car) }}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-2xl hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="card rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-3xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Car size={24} className="text-sakan-blue dark:text-sakan" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">{t('vehicle.selected_car')}</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{selected.car_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-3xl bg-gray-50 dark:bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">{t('vehicle.current_km')}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{formatKm(selected.current_km)} km</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: t('vehicle.doc_assurance'), value: formatDate(selected.assurance_expiry) },
                    { label: t('vehicle.doc_vignette'), value: formatDate(selected.vignette_expiry) },
                    { label: t('vehicle.doc_controle'), value: formatDate(selected.controle_technique_expiry) },
                    { label: t('vehicle.doc_carte_grise'), value: formatDate(selected.carte_grise_expiry) },
                  ].map(info => (
                    <div key={info.label} className="rounded-3xl bg-gray-50 dark:bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">{info.label}</p>
                      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{info.value || t('vehicle.no_document')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} size="lg"
        title={modal === 'create' ? t('vehicle.add_car') : t('vehicle.modify_car')}>
        <VoitureForm initial={modal?.voiture || {}} onSave={save} loading={saving} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={del}
        loading={saving}
        title={t('common.delete')}
        message={`${t('common.delete')} "${deleting?.car_name}" ?`}
      />
    </div>
  )
}
