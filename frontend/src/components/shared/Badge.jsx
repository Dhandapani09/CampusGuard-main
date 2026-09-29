import React from 'react';

const Badge = ({ children, type = 'default' }) => {
  const typeStyles = {
    guest: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    contractor: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    interview: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    vip: 'bg-red-500/10 text-red-400 border border-red-500/20',
    delivery: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    temp: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    tempemployee: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    default: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  };

  const selectedStyle = typeStyles[type.toLowerCase()] || typeStyles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[0.7rem] font-semibold uppercase tracking-wide ${selectedStyle}`}>
      {children}
    </span>
  );
};

export default Badge;
