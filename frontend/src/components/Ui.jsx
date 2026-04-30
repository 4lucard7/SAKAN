import { AlertCircle, ChevronDown, X } from 'lucide-react';

export const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

export { Badge as StatutBadge };

export const Spinner = ({ size = 24 }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-sakan"
      />
    </div>
  );
};

export const Modal = ({ open, onClose, title, size = 'md', children }) => {
  if (!open) return null;
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full ${sizes[size] || sizes.md} overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 dark:border-white/5`}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/50">
          <h3 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all transform hover:rotate-90 active:scale-90">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading, type = 'danger' }) => {
  if (!open) return null;
  const isDanger = type === 'danger';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 dark:border-white/5">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-sakan/10 text-sakan-blue'}`}>
            <AlertCircle size={32} />
          </div>
          <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 flex flex-col gap-3">
          <button onClick={onConfirm} disabled={loading} className={`w-full py-3 text-sm font-bold text-white rounded-2xl transition-all shadow-lg active:scale-95 ${isDanger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-sakan-blue hover:bg-sakan-hover shadow-sakan-blue/20'}`}>
            {loading ? '...' : 'Confirmer'}
          </button>
          <button onClick={onClose} disabled={loading} className="w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export const Avatar = ({ name = '', size = 'md' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={`flex-shrink-0 flex items-center justify-center rounded-full bg-sakan text-white font-bold ${sizes[size] || sizes.md} shadow-sm`}>
      {initials}
    </div>
  );
};

export const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};

export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
      <div className="text-slate-300 dark:text-slate-700 mb-6 transform transition-transform hover:scale-110 duration-500">
        {icon}
      </div>
      <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">{description}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
};

export const Field = ({ label, required, error, helperText, children }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full group">
      {label && (
        <label className={`text-sm font-bold transition-colors ${error ? 'text-red-500' : 'text-slate-700 dark:text-slate-300 group-focus-within:text-sakan-blue'}`}>
          {label}
          {required && <span className="text-red-500 ml-1 font-black">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
      </div>
      {error ? (
        <p className="text-[11px] font-bold text-red-500 mt-0.5 animate-in slide-in-from-top-1">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};

export const Select = ({ children, ...props }) => {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className="w-full h-11 pl-4 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sakan focus:border-transparent transition-all cursor-pointer"
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown size={18} />
      </div>
    </div>
  );
};

export const PriorityPills = ({ value, onChange, options = [] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = value === opt.value;
        const colorClass = opt.color === 'red' 
          ? (isActive ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30')
          : (isActive ? 'bg-sakan-blue text-white border-sakan-blue shadow-lg shadow-sakan-blue/20' : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700');
        
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all active:scale-95 ${colorClass}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4 mt-2">
    {Icon && <Icon size={16} className="text-sakan-blue" />}
    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{title}</h4>
  </div>
);
