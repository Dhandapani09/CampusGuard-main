import React from 'react';

const SentimentGauge = ({ score, label, level }) => {
  // Map level to color
  const getColor = () => {
    switch (level) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'safe': return '#10b981';
      default: return '#6b7280';
    }
  };

  const color = getColor();
  const rotation = (score / 100) * 180; // 0 to 180 degrees

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[100px] h-[50px] bg-gray-800 light:bg-gray-200 rounded-t-full overflow-hidden">
        <div
          className="absolute top-full left-0 w-[100px] h-[100px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ backgroundColor: color, transform: `rotate(${rotation}deg)`, transformOrigin: 'center top' }}
        ></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80px] h-[40px] bg-gray-900 light:bg-white rounded-t-full flex items-end justify-center pb-[5px]">
          <span className="font-heading font-bold text-xl" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-gray-400 light:text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );
};

export default SentimentGauge;
