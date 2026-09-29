import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, Bot } from 'lucide-react';
import SentimentGauge from './SentimentGauge';
import { analyzeSentiment, checkIntentRouting, fuzzyMatchBlacklist } from '../../services/aiService';

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
    <div className="backdrop-blur-xl bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 rounded-2xl shadow-2xl p-6 mt-8 border-l-4 border-l-indigo-500">
      <div className="flex items-center gap-3 mb-5 text-indigo-400">
        <Bot size={20} />
        <h4 className="m-0 text-base text-white light:text-gray-900 font-semibold">AI Security Guardian</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8">
        <div className="flex flex-col items-center md:pr-8 md:border-r md:border-dashed md:border-white/10 light:md:border-gray-200 pb-6 md:pb-0 border-b md:border-b-0 border-dashed border-white/10 light:border-gray-200">
          <h5 className="text-xs uppercase text-gray-400 light:text-gray-500 mb-4 font-semibold">Sentiment Analysis</h5>
          <SentimentGauge {...sentiment} />
        </div>

        <div>
          <h5 className="text-xs uppercase text-gray-400 light:text-gray-500 mb-4 font-semibold">Active Alerts</h5>
          <div className="flex flex-col gap-3">
            {blacklistMatch && (
              <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span><strong>Fuzzy Blacklist Match:</strong> Similar to {blacklistMatch.name}. Reason: {blacklistMatch.reason}.</span>
              </div>
            )}
            
            {sentiment.level === 'danger' && (
              <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>Hostile intent detected in purpose.</span>
              </div>
            )}

            {routingMatch && (
              <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span><strong>Intent Routing:</strong> Auto-notify {routingMatch}.</span>
              </div>
            )}

            {!blacklistMatch && sentiment.level !== 'danger' && !routingMatch && (
              <div className="flex items-center gap-3 p-3 rounded-lg text-sm text-gray-400 light:text-gray-600">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>No anomalies detected. Proceed.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICheckPanel;