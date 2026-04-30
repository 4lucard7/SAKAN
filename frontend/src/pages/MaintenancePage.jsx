import { useEffect, useState } from 'react'
import { maintenanceAPI, voitureAPI, voituresAPI } from '../services/api'
import { Modal, ConfirmDialog, PageHeader, EmptyState, Spinner, Field, StatutBadge, Select, PriorityPills, SectionHeader } from '../components/Ui'
import { Plus, Pencil, Trash2, Wrench, AlertTriangle, Info, Gauge, Calendar, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

function MaintenanceForm({ initial = {}, onSave, loading, voitures = [] }) {
  const { t } = useTranslation()
  const partNames = [
    'Vidange', 'Pneus', 'Freins', 'Filtre à huile', 'Bougies', 'Courroie de distribution', 'Amortisseurs'
  ]
  const [form, setForm] = useState({
    car_id: initial?.car_id || voitures[0]?.id || '',
    part_name: initial?.part_name || '',
    car_id: '', part_name: '', kilometrage_actuel: '', limit_km: '',
    last_change_date: '', duration: '', cost: '', notes: '', priority: 'normal',
    ...initial,
  })

  useEffect(() => {
    setForm({
      car_id: '', part_name: '', kilometrage_actuel: '', limit_km: '',
      last_change_date: '', duration: '', cost: '', notes: '', priority: 'normal',
      ...initial,
    })
  }, [initial])

  const h = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sakan-blue/40 focus:border-sakan-blue transition-all text-sm"
  const labelCls = "text-sm font-semibold text-slate-700 dark:text-slate-300"

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col">
      <div className="flex flex-col gap-4 pb-2">

        {/* Row 1 : Voiture + Pièce */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('vehicle.car')} <span className="text-red-500">*</span></label>
            <select name="car_id" required value={form.car_id} onChange={h} className={inputCls}>
              <option value="">Sélectionner une voiture</option>
              {voitures.map(v => <option key={v.id} value={v.id}>{v.car_name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('maintenance.part_name')} <span className="text-red-500">*</span></label>
            <input list="part_names" name="part_name" required value={form.part_name} onChange={h}
              className={inputCls} placeholder="Ex: Vidange, Pneus..." />
            <datalist id="part_names">
              {partNames.map(part => <option key={part} value={part} />)}
            </datalist>
          </div>
        </div>

        {/* Row 2 : KM actuel + Limite KM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('vehicle.current_km')} <span className="text-red-500">*</span></label>
            <input name="kilometrage_actuel" type="number" min="0" required
              value={form.kilometrage_actuel} onChange={h} className={inputCls} placeholder="45200" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('maintenance.interval')}</label>
            <input name="limit_km" type="number" min="0"
              value={form.limit_km} onChange={h} className={inputCls} placeholder="Ex: 10000" />
          </div>
        </div>

        {/* Row 3 : Date + Durée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('maintenance.last_done').split('/')[0]} <span className="text-red-500">*</span></label>
            <input name="last_change_date" type="date" required
              value={form.last_change_date} onChange={h} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('maintenance.duration_months')}</label>
            <input name="duration" type="number" min="1" max="120"
              value={form.duration} onChange={h} className={inputCls} placeholder="Ex: 6" />
          </div>
        </div>

        {/* Row 4 : Coût + Priorité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('maintenance.cost')} (MAD)</label>
            <input name="cost" type="number" min="0" step="0.01"
              value={form.cost} onChange={h} className={inputCls} placeholder="0.00" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Priorité</label>
            <select name="priority" value={form.priority} onChange={h} className={inputCls}>
              <option value="normal">Normal</option>
              <option value="important">Important</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>{t('common.notes')}</label>
          <textarea name="notes" value={form.notes} onChange={h}
            className={`${inputCls} resize-none h-20`} placeholder={t('common.optional')} />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

function AlerteBadge({ statut }) {
  const { t } = useTranslation()
  if (!statut || statut === 'ok') return null
  const map = {
    alerte_date: { label: t('maintenance.alert_j14'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    alerte_km: { label: t('maintenance.alert_km500'), color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    depasse: { label: t('maintenance.alert_passed'), color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  }
  const { label, color } = map[statut] || { label: statut, color: 'bg-gray-100 text-gray-500' }
  return <span className={`badge ${color} flex items-center gap-1`}><AlertTriangle size={10} />{label}</span>
}

const formatKm = (value) => {
  const km = Number(value)
  return Number.isFinite(km) ? km.toLocaleString() : '0'
}

export default function MaintenancePage() {
  const { t, i18n } = useTranslation()
  const [maintenances, setMaintenances] = useState([])
  const [voitures, setVoitures] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([voituresAPI.list()])
      .then(([v]) => {
        setVoitures(v.data)
        if (v.data.length > 0) {
          setSelectedCar(v.data[0])
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const loadMaintenances = () => {
    if (!selectedCar) return
    maintenanceAPI.list({ params: { car_id: selectedCar.id } })
      .then(m => setMaintenances(m.data))
      .catch(() => { })
  }
  useEffect(loadMaintenances, [selectedCar])

  const save = async (form) => {
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.car_id && selectedCar) {
        payload.car_id = selectedCar.id
      }

      if (modal === 'create') {
        await maintenanceAPI.create(payload); toast.success(t('common.save'))
      } else {
        await maintenanceAPI.update(modal.m.id, payload); toast.success(t('common.save'))
      }
      setModal(null); loadMaintenances()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(e => toast.error(e))
      else toast.error(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try {
      await maintenanceAPI.delete(deleting.id); toast.success(t('common.delete'))
      setDeleting(null); loadMaintenances()
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size={32} /></div>

  if (voitures.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 dark:bg-slate-900 dark:border-white/10 rounded-2xl">
      <Wrench size={40} className="text-gray-200 dark:text-slate-800" />
      <p className="text-gray-400 dark:text-slate-600 font-medium">{t('maintenance.register_car_first')}</p>
    </div>
  )

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title={t('maintenance.title')}
        subtitle={t('vehicle.subtitle')}
        action={
          <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-sakan-blue/20 hover:scale-105 transition-all active:scale-95" onClick={() => setModal('create')} disabled={!selectedCar}>
            <Plus size={18} /> {t('maintenance.add')}
          </button>
        }
      />

      {/* Car selector */}
      <div className="card flex items-center gap-4 py-4 dark:bg-slate-900 dark:border-white/10 transition-colors">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
          <Wrench size={18} className="text-sakan-blue dark:text-sakan" />
        </div>
        <div className="flex-1">
          <p className="font-display font-semibold text-gray-800 dark:text-white transition-colors">{t('vehicle.select_car')}</p>
          <select value={selectedCar?.id || ''} onChange={e => setSelectedCar(voitures.find(v => v.id == e.target.value))} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white mt-1">
            {voitures.map(v => <option key={v.id} value={v.id}>{v.car_name}</option>)}
          </select>
        </div>
      </div>

      {/* Vehicle info */}
      {selectedCar && (
        <div className="card flex items-center gap-4 py-4 dark:bg-slate-900 dark:border-white/10 transition-colors">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Wrench size={18} className="text-sakan-blue dark:text-sakan" />
          </div>
          <div>
            <p className="font-display font-semibold text-gray-800 dark:text-white transition-colors">{selectedCar.car_name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">{formatKm(selectedCar.current_km)} km actuels</p>
          </div>
          <div className="ml-auto flex gap-6 text-center">
            <div>
              <p className="font-display font-bold text-xl text-sakan-blue dark:text-sakan">{maintenances.length}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{t('common.maintenance')}</p>
            </div>
            <div>
              <p className="font-display font-bold text-xl text-orange-500 dark:text-orange-400">
                {maintenances.filter(m => m.statut_alerte && m.statut_alerte !== 'ok').length}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{t('vehicle.alerts')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="card p-0 overflow-hidden dark:bg-slate-900 dark:border-white/10 transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <Wrench size={15} className="text-gray-400 dark:text-slate-500" />
          <h2 className="font-display font-semibold text-gray-800 dark:text-white">{t('maintenance.history')}</h2>
        </div>

        {maintenances.length === 0 ? (
          <EmptyState 
            icon={<Wrench size={64} className="opacity-20" />} 
            title={t('common.no_data')} 
            description={t('maintenance.desc_no_maintenance')} 
            action={
              <button className="btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-sakan-blue/20" onClick={() => setModal('create')}>
                <Plus size={20} className="mr-2" /> {t('maintenance.add')}
              </button>
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
                    <th className="py-3 px-6 text-left font-medium">{t('maintenance.part_name')}</th>
                    <th className="py-3 px-4 text-left font-medium">{t('vehicle.current_km')}</th>
                    <th className="py-3 px-4 text-left font-medium">Priorité</th>
                    <th className="py-3 px-4 text-left font-medium">{t('maintenance.next_km').split(' ')[2]}</th>
                    <th className="py-3 px-4 text-left font-medium">{t('maintenance.last_done').split(' ')[0]}</th>
                    <th className="py-3 px-4 text-left font-medium">{t('maintenance.duration_months').split(' ')[0]}</th>
                    <th className="py-3 px-4 text-left font-medium">{t('vehicle.alerts')}</th>
                    <th className="py-3 px-6 text-left font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenances.map(m => (
                    <tr key={m.id} className="border-b border-gray-50 dark:border-slate-800 last:border-0 hover:bg-primary-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-6 font-medium text-gray-800 dark:text-slate-200">{m.part_name}</td>
                      <td className="py-3 px-4 dark:text-slate-400">{formatKm(m.kilometrage_actuel)} km</td>
                      <td className="py-3 px-4">
                        <StatutBadge color={(m.priority === 'important' || m.is_required) ? 'red' : 'gray'}>
                          {(m.priority || (m.is_required ? 'important' : 'normal')) === 'important' ? 'Important' : 'Normal'}
                        </StatutBadge>
                      </td>
                      <td className={`py-3 px-4 ${m.statut_alerte === 'alerte_km' || m.statut_alerte === 'depasse' ? 'text-orange-500 font-semibold dark:text-orange-400' : 'text-gray-400 dark:text-slate-600'}`}>
                        {m.limit_km ? `${formatKm(m.limit_km)} km` : '—'}
                      </td>
                      <td className="py-3 px-4 dark:text-slate-400">{new Date(m.last_change_date).toLocaleDateString(i18n.language)}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-slate-500">
                        {m.duration ? `${m.duration} ${t('maintenance.duration_months').split(' ')[1]}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <AlerteBadge statut={m.statut_alerte} />
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModal({ m })}
                            className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-slate-800 text-gray-400 hover:text-sakan-blue dark:hover:text-sakan transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleting(m)}
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
              {maintenances.map(m => (
                <div key={m.id} className="p-4 hover:bg-primary-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Part name header with priority and alert */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-slate-200 mb-1">{m.part_name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatutBadge color={(m.priority === 'important' || m.is_required) ? 'red' : 'gray'} className="text-xs">
                          {(m.priority || (m.is_required ? 'important' : 'normal')) === 'important' ? 'Important' : 'Normal'}
                        </StatutBadge>
                        <div className="text-xs">
                          <AlerteBadge statut={m.statut_alerte} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => setModal({ m })}
                        className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-slate-800 text-gray-400 hover:text-sakan-blue dark:hover:text-sakan transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleting(m)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t('vehicle.current_km')}</p>
                      <p className="font-semibold text-gray-800 dark:text-slate-200">{formatKm(m.kilometrage_actuel)} km</p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t('maintenance.next_km').split(' ')[2]}</p>
                      <p className={`font-semibold ${m.statut_alerte === 'alerte_km' || m.statut_alerte === 'depasse' ? 'text-orange-500 dark:text-orange-400' : 'text-gray-800 dark:text-slate-200'}`}>
                        {m.limit_km ? `${formatKm(m.limit_km)} km` : '—'}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t('maintenance.last_done').split(' ')[0]}</p>
                      <p className="font-semibold text-gray-800 dark:text-slate-200">{new Date(m.last_change_date).toLocaleDateString(i18n.language)}</p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t('maintenance.duration_months').split(' ')[0]}</p>
                      <p className="font-semibold text-gray-800 dark:text-slate-200">
                        {m.duration ? `${m.duration} ${t('maintenance.duration_months').split(' ')[1]}` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} size="lg"
        title={modal === 'create' ? t('maintenance.add') : t('common.edit')}>
        <MaintenanceForm initial={modal?.m} onSave={save} loading={saving} voitures={voitures} />
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={del} loading={saving}
        title={t('common.delete')}
        message={`${t('common.delete')} "${deleting?.part_name}" ?`} />
    </div>
  )
}
