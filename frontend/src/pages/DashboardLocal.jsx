import React, { useState, useEffect } from 'react';
import { useVisitorContext } from '../context/VisitorContext';
import { Users, AlertTriangle, Clock, ShieldAlert, Monitor, Video } from 'lucide-react';
import Badge from '../components/shared/Badge';
import MusterList from '../components/emergency/MusterList';

const DashboardLocal = () => {
  const { activeVisitors } = useVisitorContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMusterList, setShowMusterList] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Overstay logic based on validUpto pass expiry only
  const getOverstayStatus = (visitor) => {
    if (!visitor || visitor.status !== 'ACTIVE') return 'safe';
    if (visitor.validUpto) {
      const expiry = new Date(visitor.validUpto);
      if (currentTime > expiry) return 'danger';
    }
    return 'safe';
  };

  const overstayCount = activeVisitors.filter(v => getOverstayStatus(v) !== 'safe').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white light:text-gray-900 font-heading m-0">
            Local Command Center
          </h1>
          <p className="text-gray-400 light:text-gray-500 text-sm mt-1 m-0">
            Real-time view of Main Gate operations, active visitors, and CCTV feeds.
          </p>
        </div>
        <button 
          onClick={() => setShowMusterList(true)}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-none rounded-lg font-bold text-sm cursor-pointer transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 shrink-0"
        >
          <ShieldAlert size={18} />
          <span>MUSTER ROLL</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-5 p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 light:text-gray-500">Active Visitors</span>
            <strong className="text-2xl font-bold text-white light:text-gray-900 mt-1">{activeVisitors.length}</strong>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
            overstayCount > 0 ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 'bg-gray-500/10 text-gray-400'
          }`}>
            <Clock size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 light:text-gray-500">Overstay Warnings</span>
            <strong className="text-2xl font-bold text-white light:text-gray-900 mt-1">{overstayCount}</strong>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Monitor size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 light:text-gray-500">System Status</span>
            <strong className="text-2xl font-bold text-emerald-400 mt-1">ONLINE</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed + Video Mocks */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        
        {/* Active Visitors Feed */}
        <div className="p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200 flex flex-col">
          <h3 className="text-lg font-bold text-white light:text-gray-900 m-0 mb-6 font-heading">On-Site Visitor Registry</h3>
          
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            {activeVisitors.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-gray-800/20 border border-dashed border-white/10 rounded-xl light:bg-gray-50 light:border-gray-200">
                <p className="m-0 text-sm font-medium">No visitors currently on site.</p>
              </div>
            ) : (
              activeVisitors.map(visitor => {
                const overstay = getOverstayStatus(visitor);
                return (
                  <div 
                    key={visitor.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl transition-all duration-200 gap-4 ${
                      overstay === 'danger'
                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 animate-pulse'
                        : overstay === 'warning'
                        ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                        : 'bg-gray-800/40 border-white/5 hover:border-indigo-500/50 light:bg-gray-50 light:border-gray-200 light:hover:border-indigo-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {visitor.photo ? (
                        <img src={visitor.photo} alt={visitor.name} className="w-12 h-12 rounded-full object-cover border border-white/10 light:border-gray-200 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-lg light:bg-gray-200 light:text-gray-700 shrink-0">
                          {visitor.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-semibold text-white light:text-gray-900 m-0">{visitor.name}</h4>
                        <span className="text-xs text-gray-400 light:text-gray-500">{visitor.comingFrom} • ID: {visitor.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center sm:items-end justify-between sm:flex-col gap-3">
                      <Badge type={visitor.type.toLowerCase()}>{visitor.type.replace('TempEmployee', 'Temp')}</Badge>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 light:text-gray-500 font-medium">
                        <Clock size={14} className={
                          overstay === 'danger' ? 'text-red-400 animate-pulse' :
                          overstay === 'warning' ? 'text-amber-400 animate-pulse' : 'text-gray-400'
                        } />
                        <span>In: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live CCTV Video Mocks */}
        <div className="p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200 flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-indigo-400 light:text-indigo-600">
            <Video size={20} />
            <h3 className="text-lg font-bold text-white light:text-gray-900 m-0 font-heading">CCTV Live Feeds</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="relative aspect-[16/9] bg-black border border-white/10 light:border-gray-200 rounded-xl overflow-hidden flex items-center justify-center text-gray-600 font-medium font-mono text-xs select-none">
              <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1.5 border border-white/5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                <span>CAM 01: MAIN GATE IN</span>
              </div>
              <span className="text-gray-500 uppercase tracking-widest text-[10px] animate-pulse">Feed Loading...</span>
            </div>

            <div className="relative aspect-[16/9] bg-black border border-white/10 light:border-gray-200 rounded-xl overflow-hidden flex items-center justify-center text-gray-600 font-medium font-mono text-xs select-none">
              <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1.5 border border-white/5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>CAM 02: MAIN GATE OUT</span>
              </div>
              <span className="text-gray-500 uppercase tracking-widest text-[10px] animate-pulse">Static Capture Active</span>
            </div>
          </div>
        </div>
      </div>

      {showMusterList && (
        <MusterList 
          onClose={() => setShowMusterList(false)} 
          visitors={activeVisitors} 
        />
      )}
    </div>
  );
};

export default DashboardLocal;