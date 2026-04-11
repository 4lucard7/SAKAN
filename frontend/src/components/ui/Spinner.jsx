import React from 'react';

export const Spinner = ({ size = 24 }) => {
  return (
    <div className="flex justify-center items-center">
      <div 
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-2 border-slate-200 border-t-sakan"
      />
    </div>
  );
};
