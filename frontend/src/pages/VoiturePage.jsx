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

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sakan-blue/40 focus:border-sakan-blue transition-all text-sm"
  const labelCls = "text-sm font-semibold text-slate-700 dark:text-slate-300"

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4">

      {/* Nom + KM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t('vehicle.name')} <span className="text-red-500">*</span></label>
          <input name="car_name" required value={form.car_name} onChange={h}
            className={inputCls} placeholder={t('vehicle.placeholder_name')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t('vehicle.current_km')} <span className="text-red-500">*</span></label>
          <input name="current_km" type="number" min="0" required value={form.current_km} onChange={h}
            className={inputCls} placeholder="42500" />
        </div>
      </div>

      {/* Documents */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{t('vehicle.documents')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'assurance_expiry', label: t('vehicle.doc_assurance') },
            { name: 'vignette_expiry', label: t('vehicle.doc_vignette') },
            { name: 'controle_technique_expiry', label: t('vehicle.doc_controle') },
            { name: 'carte_grise_expiry', label: t('vehicle.doc_carte_grise') },
          ].map(f => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label className={labelCls}>{f.label}</label>
              <input name={f.name} type="date" value={form[f.name] || ''} onChange={h} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
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

function DocDot({ expiry }) {
  if (!expiry) return <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 inline-block" title="Non renseigné" />
  const diff = Math.ceil((new Date(expiry) - new Date()) / 86400000)
  const color = diff < 0 ? 'bg-red-500' : diff <= 30 ? 'bg-orange-400' : 'bg-green-500'
  return <span className={`w-2.5 h-2.5 rounded-full ${color} inline-block`} title={new Date(expiry).toLocaleDateString()} />
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
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal('create')}>
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
        <div className="flex flex-col gap-6">

          {/* ── Grille de voitures (2 colonnes) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {voitures.map(car => {
              const isActive = selected?.id === car.id
              return (
                <div
                  key={car.id}
                  onClick={() => setSelected(car)}
                  className={`group relative card p-6 rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden ${isActive
                      ? 'border-[#2196F3] bg-[#2196F3]/5 dark:bg-[#2196F3]/10 shadow-xl shadow-[#2196F3]/10'
                      : 'border-transparent bg-white dark:bg-slate-900 shadow-card hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md'
                    }`}
                >
                  {/* Header: nom + icône voiture */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">{t('vehicle.name')}</p>
                      <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">{car.car_name}</h3>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-[#2196F3] text-white' : 'bg-slate-100 dark:bg-slate-800 text-[#2196F3]'
                      }`}>
                      <Car size={22} />
                    </div>
                  </div>

                  {/* KM */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3 mb-4">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-0.5">{t('vehicle.current_km')}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatKm(car.current_km)} <span className="text-sm font-bold text-slate-400 uppercase">km</span>
                    </p>
                  </div>

                  {/* Status docs + actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isActive ? 'bg-[#2196F3]/10 text-[#2196F3]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                        {isActive ? 'Sélectionné' : 'Véhicule'}
                      </span>
                      <div className="flex items-center gap-1">
                        <DocDot expiry={car.assurance_expiry} />
                        <DocDot expiry={car.vignette_expiry} />
                        <DocDot expiry={car.controle_technique_expiry} />
                        <DocDot expiry={car.carte_grise_expiry} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setModal({ voiture: car }) }}
                        className="p-2 rounded-xl text-slate-400 hover:text-[#2196F3] hover:bg-[#2196F3]/5 transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setDeleting(car) }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>


          {/* ── Détails de la voiture sélectionnée ── */}
          <SelectedVehicleCard
            vehicle={selected}
            maintenances={maintenances}
            onAction={handleAction}
          />
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
