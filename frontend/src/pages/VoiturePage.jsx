import { useEffect, useState } from 'react'
import { voituresAPI } from '../services/api'
import { Modal, ConfirmDialog, PageHeader, Spinner, Field } from '../components/Ui'
import { Plus, Pencil, Trash2, Car, Gauge, Shield, AlertTriangle, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import SelectedVehicleCard from '../components/SelectedVehicleCard'
import { maintenanceAPI } from '../services/api'

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
      <span className={`badge ${color}`}>{statut ? t(`alert_status.${statut}`) : t('alert_status.ok')}</span>
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
  const [maintenances, setMaintenances] = useState([])

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

  useEffect(() => {
    if (selected) {
      maintenanceAPI.list({ params: { car_id: selected.id } })
        .then(r => setMaintenances(r.data))
        .catch(() => setMaintenances([]))
    } else {
      setMaintenances([])
    }
  }, [selected])

  const handleAction = (type, data) => {
    if (type === 'edit') setModal({ voiture: data })
    if (type === 'create') setModal('create')
    if (type === 'updateMileage') setModal({ voiture: data })
    if (type === 'addMaintenance') {
      // Navigate to maintenance page or show a toast
      toast.success(t('maintenance.add') + ' (Coming Soon shortcut)')
    }
    if (type === 'renewInsurance') {
      setModal({ voiture: data })
    }
  }

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
        <EmptyState 
          icon={<Car size={64} className="opacity-20" />} 
          title={t('vehicle.no_car')} 
          description={t('vehicle.subtitle')} 
          action={
            <button className="btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-sakan-blue/20" onClick={() => setModal('create')}>
              <Plus size={20} className="mr-2" /> {t('vehicle.add_car')}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {voitures.map(car => (
              <div
                key={car.id}
                onClick={() => setSelected(car)}
                className={`group relative card p-6 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${selected?.id === car.id ? 'border-sakan-blue bg-sakan-blue/5 dark:bg-sakan-blue/10 shadow-xl shadow-sakan-blue/10' : 'border-transparent hover:border-slate-100 dark:hover:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-hover'}`}
              >
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">{t('vehicle.name')}</p>
                    <h3 className="font-display font-black text-xl text-slate-900 dark:text-white group-hover:text-sakan-blue transition-colors">{car.car_name}</h3>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${selected?.id === car.id ? 'bg-sakan-blue text-white rotate-12' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-sakan-blue/10 group-hover:text-sakan-blue'}`}>
                    <Car size={28} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/50 p-5 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Gauge size={14} className="text-slate-400" />
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">{t('vehicle.current_km')}</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{formatKm(car.current_km)} <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">km</span></p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {car.assurance_expiry ? (
                      <span className="px-3 py-1.5 rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-100 dark:border-green-900/30">
                        {formatDate(car.assurance_expiry)}
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                        {t('vehicle.no_document')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setModal({ voiture: car }) }}
                    className="p-3 text-slate-400 hover:text-sakan-blue hover:bg-sakan-blue/5 rounded-2xl transition-all"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDeleting(car) }}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <SelectedVehicleCard 
              vehicle={selected} 
              maintenances={maintenances} 
              onAction={handleAction} 
            />
          </div>
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
