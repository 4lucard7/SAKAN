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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-${size} overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-white/10`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-white/10">
        <div className="p-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
            <AlertCircle size={24} />
            <h3 className="font-display font-bold text-lg">{title}</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm">
            {loading ? 'Suppression...' : 'Confirmer'}
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

export const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">{description}</p>
    </div>
  );
};

export const Field = ({ label, required, children }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
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
