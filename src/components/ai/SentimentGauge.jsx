import React from 'react';
import './SentimentGauge.css';

const SentimentGauge = ({ score, label, level }) => {
  // Map level to color
  const getColor = () => {
    switch (level) {
      case 'danger': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      case 'safe': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  const color = getColor();
  const rotation = (score / 100) * 180; // 0 to 180 degrees

  return (
    <div className="sentiment-gauge">
      <div className="gauge-body">
        <div className="gauge-fill" style={{ backgroundColor: color, transform: `rotate(${rotation}deg)` }}></div>
        <div className="gauge-cover">
          <span className="gauge-score" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="gauge-label">{label}</span>
    </div>
  );
};

export default SentimentGauge;