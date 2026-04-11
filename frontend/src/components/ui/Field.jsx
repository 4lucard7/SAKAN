import React from 'react';

export const Field = ({ label, required, children }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
};
