import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, Bot } from 'lucide-react';
import SentimentGauge from './SentimentGauge';
import { analyzeSentiment, checkIntentRouting, fuzzyMatchBlacklist } from '../../services/aiService';
import './AICheckPanel.css';

const AICheckPanel = ({ visitorName, visitorPhone, purpose }) => {
  const [sentiment, setSentiment] = useState({ score: 50, label: 'Analyzing...', level: 'neutral' });
  const [routingMatch, setRoutingMatch] = useState(null);
  const [blacklistMatch, setBlacklistMatch] = useState(null);

  // Run AI analysis when inputs change
  useEffect(() => {
    // 1. Sentiment & Intent (depends on purpose)
    if (purpose && purpose.length > 2) {
      setSentiment(analyzeSentiment(purpose));
      setRoutingMatch(checkIntentRouting(purpose));
    } else {
      setSentiment({ score: 50, label: 'Waiting...', level: 'neutral' });
      setRoutingMatch(null);
    }

    // 2. Blacklist (depends on name/phone)
    if (visitorName?.length > 2 || visitorPhone?.length > 4) {
      setBlacklistMatch(fuzzyMatchBlacklist(visitorName, visitorPhone));
    } else {
      setBlacklistMatch(null);
    }
  }, [visitorName, visitorPhone, purpose]);

  return (
    <div className="ai-check-panel glass-panel">
      <div className="ai-header">
        <Bot size={20} className="ai-icon" />
        <h4>AI Security Guardian</h4>
      </div>
      
      <div className="ai-grid">
        <div className="ai-module sentiment-module">
          <h5>Sentiment Analysis</h5>
          <SentimentGauge {...sentiment} />
        </div>
        
        <div className="ai-module alerts-module">
          <h5>Active Alerts</h5>
          <div className="alerts-list">
            {blacklistMatch && (
              <div className="alert-item danger">
                <AlertTriangle size={16} />
                <span><strong>Fuzzy Blacklist Match:</strong> Similar to {blacklistMatch.name}. Reason: {blacklistMat
<truncated 964 bytes