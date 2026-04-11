import React from 'react';

export const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};
