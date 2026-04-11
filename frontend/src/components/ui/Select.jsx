import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({ children, ...props }) => {
  return (
    <div className="relative w-full">
      <select 
        {...props}
        className="w-full h-11 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-sakan focus:border-transparent transition-all cursor-pointer"
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown size={18} />
      </div>
    </div>
  );
};
