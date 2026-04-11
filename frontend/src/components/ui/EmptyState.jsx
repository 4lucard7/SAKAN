import React from 'react';

export const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-display font-bold text-lg text-slate-900">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">{description}</p>
    </div>
  );
};
