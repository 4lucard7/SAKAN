import { useEffect, useState } from 'react'
import { tiersAPI } from '../services/api'
import { Modal, ConfirmDialog, Avatar, PageHeader, EmptyState, Spinner, Field, Select } from '../components/Ui'
import { Plus, Pencil, Trash2, Search,Users} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const TYPES = ['famille', 'collègue','Banques','Ecole', 'autre']

function TierForm({ initial = {}, onSave, loading }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', type: '', contact: '', ...initial })
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="flex flex-col gap-4 " > 
      <Field label={t('common.name')} required>
        <input name="name" required value={form.name} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder={t('tiers.form_name')}  />
      </Field>
      <Field label={t('common.type')} required>
        <input
          name="type"
          list="tier-types"
          value={form.type}
          onChange={h}
          className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          placeholder="Sélectionnez ou saisissez un type"
          required
        />
        <datalist id="tier-types">
          {TYPES.map(tier_type => (
            <option key={tier_type} value={tier_type} />
          ))}
        </datalist>
      </Field>
      <Field label={t('common.contact')}>
        <input name="contact" value={form.contact} onChange={h} className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder={t('tiers.form_contact')} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

export default function TiersPage() {
  const { t } = useTranslation()
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

  const filtered = tiers.filter(t_item =>
    t_item.name.toLowerCase().includes(search.toLowerCase()) ||
    t_item.type.toLowerCase().includes(search.toLowerCase())
  )

  const save = async (form) => {
    setSaving(true)
    try {
      if (modal === 'create') {
        await tiersAPI.create(form); toast.success(t('common.save'))
      } else {
        await tiersAPI.update(modal.tier.id, form); toast.success(t('common.save'))
      }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try {
      await tiersAPI.delete(deleting.id); toast.success(t('common.delete'))
      setDeleting(null); load()
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <PageHeader
        title={t('tiers.title')}
        action={
          <button className="btn-primary" onClick={() => setModal('create')}>
            <Plus size={16} /> {t('tiers.add_tier')}
          </button>
          
        }
      />

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('tiers.placeholder_search')} className="input pl-9 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden dark:bg-slate-900 dark:border-white/10 transition-colors">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Users size={48} />} title={t('tiers.no_tiers')} description={t('tiers.desc_no_tiers')} />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide bg-gray-50/50 dark:bg-slate-800/20">
                    <th className="py-3 px-6 text-left font-medium">{t('common.name')}</th>
                    <th className="py-3 px-4 text-left font-medium">{t('common.type')}</th>
                    <th className="py-3 px-4 text-left font-medium">{t('common.contact')}</th>
                    <th className="py-3 px-6 text-right font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t_item => (
                    <tr key={t_item.id} className="border-b border-gray-50 dark:border-slate-800 last:border-0 hover:bg-primary-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={t_item.name} size="sm" />
                          <span className="font-medium text-gray-800 dark:text-slate-200">{t_item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                          {t_item.type.charAt(0).toUpperCase() + t_item.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 dark:text-slate-500">{t_item.contact || '—'}</td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setModal({ tier: t_item })}
                            className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-slate-800 text-gray-400 hover:text-sakan-blue dark:hover:text-sakan transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleting(t_item)}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.map(t_item => (
                <div key={t_item.id} className="border border-gray-100 dark:border-slate-800 rounded-lg p-4 hover:bg-primary-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={t_item.name} size="sm" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-slate-200">{t_item.name}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{t_item.contact || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-xs">
                        {t_item.type.charAt(0).toUpperCase() + t_item.type.slice(1)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ tier: t_item })}
                          className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-slate-800 text-gray-400 hover:text-sakan-blue dark:hover:text-sakan transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleting(t_item)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="mt-5">
      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? t('tiers.add_tier') : t('common.edit')}>
            <TierForm initial={modal?.tier} onSave={save} loading={saving} />
      </Modal>
      </div>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={del} loading={saving}
        title={t('common.delete')}
        message={`${t('common.delete')} "${deleting?.name}" ? ${t('tiers.confirm_delete')}`} />
    </div>
  )
}
