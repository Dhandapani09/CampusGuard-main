import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const typeStyles = {
  info: 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400',
  success: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
  danger: 'bg-red-500/15 border-red-500/25 text-red-400',
  warning: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
};

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    danger: <AlertCircle size={20} />,
    warning: <AlertCircle size={20} />,
  };

  const colorClasses = typeStyles[type] || typeStyles.info;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-slide-down ${colorClasses}`}>
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm text-white">{message}</div>
      <button
        className="shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
