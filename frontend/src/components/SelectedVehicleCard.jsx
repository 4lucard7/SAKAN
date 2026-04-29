import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Car, Gauge, Shield, Calendar, AlertTriangle, 
  Wrench, TrendingUp, DollarSign, Plus, ArrowRight,
  CheckCircle2, Clock, Info, ExternalLink, RefreshCw,
  FileText
} from 'lucide-react';
import { Badge } from './Ui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const SelectedVehicleCard = ({ vehicle, maintenances = [], onAction }) => {
  const { t, i18n } = useTranslation();

  const stats = useMemo(() => {
    if (!vehicle) return null;

    const totalExpenses = maintenances.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);
    const lastMaintenanceKm = maintenances.length > 0 
      ? Math.max(...maintenances.map(m => Number(m.kilometrage_actuel) || 0))
      : vehicle.current_km;
    
    // Prediction: search for the nearest limit_km
    const upcomingMaintenances = maintenances
      .filter(m => m.limit_km && Number(m.limit_km) > Number(vehicle.current_km))
      .sort((a, b) => Number(a.limit_km) - Number(b.limit_km));
    
    const nextMaintenanceKm = upcomingMaintenances.length > 0 
      ? upcomingMaintenances[0].limit_km 
      : null;

    return { totalExpenses, lastMaintenanceKm, nextMaintenanceKm };
  }, [vehicle, maintenances]);

  const documents = useMemo(() => {
    if (!vehicle) return [];

    const docs = [
      { id: 'assurance', key: 'assurance_expiry', label: t('vehicle.doc_assurance'), icon: Shield },
      { id: 'vignette', key: 'vignette_expiry', label: t('vehicle.doc_vignette'), icon: Calendar },
      { id: 'controle', key: 'controle_technique_expiry', label: t('vehicle.doc_controle'), icon: Wrench },
      { id: 'carte_grise', key: 'carte_grise_expiry', label: t('vehicle.doc_carte_grise'), icon: FileText },
    ];

    return docs.map(doc => {
      const expiryDate = vehicle[doc.key];
      if (!expiryDate) return { ...doc, status: 'missing' };

      const diffTime = new Date(expiryDate) - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status = 'valid';
      let color = 'green';
      if (diffDays < 0) {
        status = 'expired';
        color = 'red';
      } else if (diffDays <= 30) {
        status = 'expiring';
        color = 'orange';
      }

      // Progress calculation (assuming 1 year validity for simplicity)
      const totalDays = 365;
      const remainingDays = Math.max(0, diffDays);
      const progress = Math.min(100, (remainingDays / totalDays) * 100);

      return {
        ...doc,
        expiryDate,
        diffDays,
        status,
        color,
        progress,
        formattedDate: new Date(expiryDate).toLocaleDateString(i18n.language)
      };
    });
  }, [vehicle, t, i18n.language]);

  const alerts = documents.filter(d => d.status === 'expired' || d.status === 'expiring');

  if (!vehicle) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex flex-col items-center justify-center py-20 gap-6 dark:bg-slate-900 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]"
      >
        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
          <Car size={40} className="text-slate-300 dark:text-slate-700" />
        </div>
        <div className="text-center">
          <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white">{t('vehicle.no_car')}</h3>
          <p className="text-slate-400 dark:text-slate-500 mt-2 max-w-xs">{t('vehicle.subtitle')}</p>
        </div>
        <button 
          onClick={() => onAction('create')}
          className="btn-primary flex items-center gap-2 px-8 py-3 rounded-2xl shadow-lg shadow-sakan-blue/20"
        >
          <Plus size={18} /> {t('vehicle.add_car')}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <motion.div 
        layoutId={`vehicle-${vehicle.id}`}
        className="card bg-white dark:bg-slate-900 border-none shadow-card rounded-[2.5rem] overflow-hidden p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-sakan/10 dark:bg-sakan/20 flex items-center justify-center ring-1 ring-sakan/20">
              <Car size={32} className="text-sakan-blue dark:text-sakan" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('vehicle.selected_car')}</span>
                {alerts.length > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">
                {vehicle.car_name}
              </h2>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => onAction('updateMileage', vehicle)}
              className="group flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-sakan hover:text-white dark:hover:bg-sakan rounded-2xl transition-all duration-300 font-semibold text-slate-700 dark:text-slate-200"
            >
              <Gauge size={18} className="group-hover:rotate-12 transition-transform" />
              <span>{Number(vehicle.current_km).toLocaleString()} km</span>
              <RefreshCw size={14} className="opacity-40 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button 
              onClick={() => onAction('edit', vehicle)}
              className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Alerts Section */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-red-900 dark:text-red-200">
                    {alerts.length} {alerts.length > 1 ? t('vehicle.alerts').toLowerCase() : 'document'} {t('dashboard.late')}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400/80 mt-1">
                    {alerts.map(a => a.label).join(', ')}
                  </p>
                </div>
                <button 
                  onClick={() => onAction('renewInsurance', vehicle)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95"
                >
                  Renew Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="group relative bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 p-5 rounded-[2rem] transition-all duration-300 hover:shadow-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    doc.status === 'valid' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                    doc.status === 'expiring' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
                    doc.status === 'expired' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {doc.icon && <doc.icon size={20} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{doc.label}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                      {doc.formattedDate || t('vehicle.doc_not_set')}
                    </p>
                  </div>
                </div>
                {doc.status !== 'missing' && (
                  <div className="text-right">
                    <p className={`text-xs font-black uppercase tracking-tighter ${
                      doc.status === 'valid' ? 'text-green-500' :
                      doc.status === 'expiring' ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {doc.status === 'expired' ? t('alert_status.expire') : 
                       doc.status === 'expiring' ? `${doc.diffDays}d left` : 
                       'Valid'}
                    </p>
                  </div>
                )}
              </div>
              
              {doc.status !== 'missing' && (
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${doc.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        doc.status === 'valid' ? 'bg-green-500' :
                        doc.status === 'expiring' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Smart Insights & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sakan/10 rounded-xl">
                  <TrendingUp size={18} className="text-sakan-blue" />
                </div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white">Expense Insight</h3>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-xs font-bold uppercase">Total:</span>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{stats?.totalExpenses.toLocaleString()} MAD</span>
              </div>
            </div>
            
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={maintenances.slice(-10).map(m => ({ name: new Date(m.last_change_date).toLocaleDateString(), cost: m.cost }))}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D1F4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#25D1F4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="cost" stroke="#25D1F4" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-gradient-to-br from-sakan-blue to-blue-600 rounded-[2rem] p-6 text-white shadow-lg shadow-sakan-blue/20 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Wrench size={120} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Next Maintenance</p>
                <h4 className="text-2xl font-black">
                  {stats?.nextMaintenanceKm ? `${stats.nextMaintenanceKm.toLocaleString()} km` : 'TBD'}
                </h4>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-black uppercase mb-1 opacity-80">
                  <span>Progress</span>
                  <span>{stats?.nextMaintenanceKm ? Math.round((vehicle.current_km / stats.nextMaintenanceKm) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${stats?.nextMaintenanceKm ? Math.min(100, (vehicle.current_km / stats.nextMaintenanceKm) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-6 text-white border border-slate-800">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Last Maintenance</p>
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold">{stats?.lastMaintenanceKm.toLocaleString()} km</h4>
                <div className="p-2 bg-slate-800 rounded-xl text-slate-400">
                  <Clock size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
          <button 
            onClick={() => onAction('addMaintenance', vehicle)}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-[1.5rem] font-bold transition-all active:scale-95"
          >
            <Plus size={18} />
            {t('maintenance.add')}
          </button>
          <button 
            onClick={() => onAction('renewInsurance', vehicle)}
            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sakan text-slate-900 dark:text-white rounded-[1.5rem] font-bold transition-all active:scale-95"
          >
            <Shield size={18} className="text-sakan-blue" />
            Renew Docs
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SelectedVehicleCard;
