import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <AlertCircle size={24} />
            <h3 className="font-display font-bold text-lg">{title}</h3>
          </div>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
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
