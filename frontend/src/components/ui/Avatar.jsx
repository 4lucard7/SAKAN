import React from 'react';

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
