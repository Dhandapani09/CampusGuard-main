import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Building, TrendingUp, Filter, Clock, ShieldAlert } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const DashboardGlobal = () => {
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [sites, setSites] = useState([]);
  const [history, setHistory] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const sitesData = await apiClient.getSites();
      setSites(sitesData || []);

      const histData = await apiClient.getVisitorHistory('', '');
      setHistory(histData || []);

      const blacklistData = await apiClient.getBlacklist();
      setBlacklist(blacklistData || []);
    } catch (error) {
      console.error("Failed to load global dashboard telemetry:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const siteOptions = sites.length > 0 ? sites.map(s => s.name) : ['Main HQ', 'Warehouse A', 'Tech Hub'];

  const getSiteName = (siteId) => {
    return sites.find(s => s.id === siteId)?.name || siteId || 'Main HQ';
  };

  // Helper for matching blacklist entries
  const fuzzyMatch = (visitorName, visitorPhone, blacklistEntries) => {
    if (!visitorName) return null;
    const normalizedInputName = visitorName.toLowerCase().replace(/[^a-z]/g, '');
    for (const person of blacklistEntries) {
      if (visitorPhone && visitorPhone.replace(/\D/g, '') === person.phone.replace(/\D/g, '')) {
        return { match: 'Exact (Banned)', reason: person.reason || 'Restricted phone match' };
      }
      const normalizedDbName = person.name.toLowerCase().replace(/[^a-z]/g, '');
      if (
        normalizedInputName &&
        (normalizedDbName.includes(normalizedInputName) || normalizedInputName.includes(normalizedDbName)) &&
        Math.abs(normalizedDbName.length - normalizedInputName.length) <= 2
      ) {
        return { match: 'Fuzzy Match', reason: person.reason || 'Restricted name similarity' };
      }
    }
    return null;
  };

  // Filter visitor log by site option
  const filteredHistory = history.filter(visitor => {
    if (selectedSite === 'All Sites') return true;
    return getSiteName(visitor.site_id) === selectedSite;
  });

  // Calculate Overstay Count
  const getOverstayCount = () => {
    const now = new Date();
    return filteredHistory.filter(visitor => {
      if (visitor.status !== 'ACTIVE') return false;
      
      // Expiry check only
      if (visitor.validUpto) {
        const expiry = new Date(visitor.validUpto);
        return now > expiry;
      }
      
      return false;
    }).length;
  };

  // Weekly throughput in the last 7 days
  const getWeeklyThroughput = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return filteredHistory.filter(v => new Date(v.checkInTime) >= sevenDaysAgo).length;
  };

  // Compute blacklist hits logs dynamically
  const getBlacklistHits = () => {
    const hits = [];
    filteredHistory.forEach(v => {
      const matchResult = fuzzyMatch(v.name, v.phone, blacklist);
      if (matchResult) {
        hits.push({
          site: getSiteName(v.site_id),
          name: v.name,
          match: matchResult.match,
          reason: matchResult.reason,
          date: new Date(v.checkInTime).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          type: matchResult.match === 'Exact (Banned)' ? 'danger' : 'warning'
        });
      }
    });
    return hits;
  };

  // Group visitors by day of the week for traffic distribution chart
  const getWeeklyChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    
    // Group all filtered visits
    filteredHistory.forEach(v => {
      if (v.checkInTime) {
        const dayName = days[new Date(v.checkInTime).getDay()];
        if (counts[dayName] !== undefined) {
          counts[dayName]++;
        }
      }
    });
    
    return chartOrder.map(name => ({
      name,
      visitors: counts[name]
    }));
  };

  const currentWeeklyTotal = getWeeklyThroughput();
  const blacklistAlertsCount = getBlacklistHits().length;
  const overstayCount = getOverstayCount();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white light:text-gray-900 m-0 font-heading">Global Operations HQ</h1>
          <p className="text-sm text-gray-400 light:text-gray-500 m-0 mt-1 font-medium">Real-time multisite visitor telemetry and threat intercept dashboard.</p>
        </div>
        
        {/* Site Filter Dropdown */}
        <div className="relative flex items-center gap-2 bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white light:bg-gray-100 light:border-gray-200 light:text-gray-900 shrink-0">
          <Filter size={16} className="text-indigo-400" />
          <select 
            value={selectedSite} 
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-transparent border-none text-inherit text-sm focus:outline-none cursor-pointer pr-4 font-semibold"
          >
            <option value="All Sites" className="bg-gray-950 text-white light:bg-white light:text-gray-950">All Sites</option>
            {siteOptions.map(opt => (
              <option key={opt} value={opt} className="bg-gray-950 text-white light:bg-white light:text-gray-950">{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">
          <span className="text-sm font-medium animate-pulse">Syncing multisite telemetry channels...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-5 p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <TrendingUp size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 light:text-gray-500">Weekly Throughput</span>
                <strong className="text-2xl font-bold text-white light:text-gray-900 mt-1">{currentWeeklyTotal}</strong>
              </div>
            </div>

            <div className="flex items-center gap-5 p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200">
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                <Shield size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 light:text-gray-500">Blacklist Intercepts</span>
                <strong className="text-2xl font-bold text-white light:text-gray-900 mt-1">{blacklistAlertsCount}</strong>
              </div>
            </div>

            <div className="flex items-center gap-5 p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                overstayCount > 0 ? 'bg-amber-500/10 text-amber-400 animate-pulse border border-amber-500/20' : 'bg-gray-500/10 text-gray-400'
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
                <Building size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 light:text-gray-500">Facilities Sites</span>
                <strong className="text-2xl font-bold text-white light:text-gray-900 mt-1">{sites.length}</strong>
              </div>
            </div>
          </div>

          {/* Analytics Chart & Blacklist Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Panel */}
            <div className="p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200">
              <h3 className="text-lg font-bold text-white light:text-gray-900 m-0 mb-6 font-heading">Traffic Distribution ({selectedSite})</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWeeklyChartData()}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#818cf8' }}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <Bar dataKey="visitors" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Blacklist Table Panel */}
            <div className="p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200 overflow-hidden flex flex-col">
              <h3 className="text-lg font-bold text-white light:text-gray-900 m-0 mb-6 font-heading font-heading">Threat Intercept Log ({selectedSite})</h3>
              <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 light:border-gray-200">
                      {selectedSite === 'All Sites' && (
                        <th className="pb-3 text-xs uppercase font-bold text-gray-500 light:text-gray-400">Site</th>
                      )}
                      <th className="pb-3 text-xs uppercase font-bold text-gray-500 light:text-gray-400">Name</th>
                      <th className="pb-3 text-xs uppercase font-bold text-gray-500 light:text-gray-400">Match Type</th>
                      <th className="pb-3 text-xs uppercase font-bold text-gray-500 light:text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBlacklistHits().length === 0 ? (
                      <tr>
                        <td colSpan={selectedSite === 'All Sites' ? 4 : 3} className="py-8 text-center text-sm text-gray-500 italic">
                          No threat intercepts recorded.
                        </td>
                      </tr>
                    ) : (
                      getBlacklistHits().map((hit, idx) => (
                        <tr key={idx} className="border-b border-white/5 light:border-gray-100 last:border-none">
                          {selectedSite === 'All Sites' && (
                            <td className="py-3 text-sm text-gray-300 light:text-gray-700">{hit.site}</td>
                          )}
                          <td className="py-3 text-sm text-white light:text-gray-900 font-semibold">{hit.name}</td>
                          <td className="py-3 text-sm">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              hit.type === 'danger' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {hit.match}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-400 light:text-gray-500">{hit.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardGlobal;