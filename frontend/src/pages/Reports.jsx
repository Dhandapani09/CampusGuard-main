import React, { useState, useEffect } from 'react';
import { Search, Printer, RotateCcw, Eye, MapPin, User, FileText, Clock, Laptop, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import Badge from '../components/shared/Badge';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import PassPreview from '../components/gate/PassPreview';
import { useAppContext } from '../context/AppContext';

const Reports = () => {
  const { branding, currentUser } = useAppContext();
  const userRole = currentUser?.role || 'Guard';
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkoutRemarks, setCheckoutRemarks] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [sites, setSites] = useState([]);
  const [visitorTypes, setVisitorTypes] = useState([]);
  const [reprintVisitor, setReprintVisitor] = useState(null);

  const isVisitorOverstay = (visitor) => {
    if (!visitor || visitor.status !== 'ACTIVE') return false;
    const now = new Date();
    
    if (visitor.validUpto) {
      const expiry = new Date(visitor.validUpto);
      return now > expiry;
    }
    
    return false;
  };
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const get24HoursAgoLocal = () => {
    const d = new Date();
    d.setHours(d.getHours() - 24);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getNowLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [fromDate, setFromDate] = useState(get24HoursAgoLocal());
  const [toDate, setToDate] = useState(getNowLocal());
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null); // For details modal

  useEffect(() => {
    if (selectedVisitor) {
      setCheckoutRemarks('');
    }
  }, [selectedVisitor]);

  useEffect(() => {
    const init = async () => {
      await loadMasterData();
      
      const urlSearch = searchParams.get('search');
      setLoading(true);
      setHasSearched(true);
      try {
        if (urlSearch) {
          setSearchTerm(urlSearch);
          setFromDate('');
          setToDate('');
          const histData = await apiClient.getVisitorHistory('', '');
          setHistory(histData || []);
        } else {
          const histData = await apiClient.getVisitorHistory(get24HoursAgoLocal(), getNowLocal());
          setHistory(histData || []);
        }
      } catch (error) {
        console.error("Failed to load initial history:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  const loadMasterData = async () => {
    try {
      const sitesData = await apiClient.getSites();
      setSites(sitesData || []);

      const typesData = await apiClient.getVisitorTypes();
      setVisitorTypes(typesData || []);
    } catch (error) {
      console.error("Failed to load master metadata for reports:", error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const histData = await apiClient.getVisitorHistory(fromDate, toDate);
      setHistory(histData || []);
    } catch (error) {
      console.error("Failed to load visitor logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSite('');
    setSelectedType('');
    setSelectedStatus('');
    const prev24 = get24HoursAgoLocal();
    const now = getNowLocal();
    setFromDate(prev24);
    setToDate(now);
    setSearchParams({});
    setLoading(true);
    apiClient.getVisitorHistory(prev24, now)
      .then(histData => setHistory(histData || []))
      .catch(err => console.error("Reset history load failed:", err))
      .finally(() => setLoading(false));
  };

  const handleModalCheckout = async () => {
    if (!selectedVisitor) return;
    setCheckoutLoading(true);
    try {
      const updatedVisitor = await apiClient.checkOutVisitor(selectedVisitor.id, 'PERMANENT', checkoutRemarks);
      setSelectedVisitor(updatedVisitor);
      setHistory(prev => prev.map(v => v.id === updatedVisitor.id ? updatedVisitor : v));
      alert(`Visitor ${selectedVisitor.name} has been successfully checked out.`);
    } catch (error) {
      console.error("Failed to checkout visitor from reports:", error);
      alert(`Error: ${error.message || 'Failed to checkout visitor'}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing PDF export. Please allow pop-ups for this website.');
      return;
    }

    const companyName = branding?.company_name || 'CampusGuard';
    const logoUrl = branding?.logo_url || '';
    const logoInitial = branding?.logo_initial || 'CG';
    const tagline = branding?.tagline || 'Secure. Smart. Seamless.';
    const printedDate = new Date().toLocaleString();
    const siteName = selectedSite ? (sites.find(s => s.id === selectedSite)?.name || 'Selected Site') : 'All Sites';
    const typeName = selectedType || 'All Types';
    const statusName = selectedStatus ? (
      selectedStatus === 'active' ? 'Active On-Site' : 
      selectedStatus === 'temp_out' ? 'Temporary Exit' : 'Checked Out'
    ) : 'All Statuses';

    let tableRows = '';
    filteredHistory.forEach(item => {
      const siteItem = sites.find(s => s.id === item.site_id)?.name || item.site_id || 'Main Site';
      const checkInStr = new Date(item.checkInTime).toLocaleString();
      const checkOutStr = item.status === 'ACTIVE'
        ? 'Active On-Site'
        : item.status === 'TEMP_OUT'
          ? `Temporary Exit (${new Date(item.check_out_time).toLocaleString()})`
          : new Date(item.check_out_time).toLocaleString();
      
      tableRows += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 10px; font-family: monospace; font-weight: bold; color: #4f46e5;">${item.id}</td>
          <td style="padding: 12px 10px;">
            <div style="font-weight: bold; color: #1e293b;">${item.name}</div>
            <div style="font-size: 11px; color: #64748b;">${item.comingFrom || 'Independent'}</div>
          </td>
          <td style="padding: 12px 10px;">
            <span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; border-radius: 9999px; background: #e0e7ff; color: #4338ca; text-transform: uppercase;">
              ${item.type}
            </span>
          </td>
          <td style="padding: 12px 10px; color: #334155;">${siteItem}</td>
          <td style="padding: 12px 10px; color: #334155;">${checkInStr}</td>
          <td style="padding: 12px 10px; color: #334155;">${checkOutStr}</td>
        </tr>
      `;
    });

    if (filteredHistory.length === 0) {
      tableRows = `
        <tr>
          <td colspan="6" style="padding: 40px; text-align: center; color: #64748b; font-style: italic;">
            No logs found matching search criteria.
          </td>
        </tr>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${companyName} - Registry Logs Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 40px; color: #1e293b; background: white; }
            .header-container { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
            .logo-placeholder { width: 44px; height: 44px; border-radius: 8px; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; }
            .branding-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
            .branding-tagline { font-size: 11px; color: #64748b; margin: 4px 0 0 0; }
            .report-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0; border-left: 4px solid #4f46e5; padding-left: 10px; }
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 12px; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { color: #64748b; font-weight: 700; margin-bottom: 3px; text-transform: uppercase; font-size: 9px; tracking-letter: 0.5px; }
            .meta-value { font-weight: bold; color: #334155; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
            th { border-bottom: 2px solid #cbd5e1; padding: 10px; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            @media print {
              body { margin: 15px; }
              @page { size: auto; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="branding-title">${companyName}</h1>
              <p class="branding-tagline">${tagline}</p>
            </div>
            <div>
              ${logoUrl ? `<img src="${logoUrl}" style="height: 44px; max-width: 150px; object-fit: contain; border-radius: 6px;" />` : `<div class="logo-placeholder">${logoInitial}</div>`}
            </div>
          </div>

          <h2 class="report-title">Facility Visitor Registry Log Report</h2>
          
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Generated On</span>
              <span class="meta-value">${printedDate}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Filters Applied</span>
              <span class="meta-value">Site: ${siteName} | Type: ${typeName} | Status: ${statusName}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Pass ID</th>
                <th>Visitor Name & Org</th>
                <th>Category</th>
                <th>Facility Site</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Filtering Logic
  const filteredHistory = history.filter(item => {
    // Hosts can only see their own hosted/created visitors
    if (userRole === 'Host' && item.host !== currentUser?.name) {
      return false;
    }

    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      (item.comingFrom && item.comingFrom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesSite = selectedSite ? item.site_id === selectedSite : true;
    const matchesType = selectedType ? item.type === selectedType : true;
    
    let matchesStatus = true;
    if (selectedStatus === 'active') {
      matchesStatus = item.status === 'ACTIVE';
    } else if (selectedStatus === 'checkedout') {
      matchesStatus = item.status === 'CHECKED_OUT';
    } else if (selectedStatus === 'temp_out') {
      matchesStatus = item.status === 'TEMP_OUT';
    } else if (selectedStatus === 'requested') {
      matchesStatus = item.status === 'REQUESTED';
    }
    
    return matchesSearch && matchesSite && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Print Banner (visible only on print) */}
      <div className="hidden print:flex flex-col items-center mb-8 pb-4 border-b-2 border-gray-300 text-black">
        <h1 className="text-3xl font-bold tracking-tight">{branding?.company_name || 'CampusGuard'} Registry Report</h1>
        <p className="text-xs text-gray-500 font-mono mt-1">Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white light:text-gray-900 font-heading m-0">Visitor Logs & Reports</h1>
          <p className="text-sm text-gray-400 light:text-gray-500 m-0 mt-1">Audit active registry, filter historical data, and export logs.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Generate Report'}
          </Button>
          {history.length > 0 && (
            <Button variant="secondary" onClick={handleExportPDF}>
              Export as PDF
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar Card */}
      <div className="p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200 print:hidden animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Search Visitor</label>
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Name, Phone, Pass ID..."
                className="w-full bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Facility Site</label>
            <select 
              value={selectedSite} 
              onChange={e => setSelectedSite(e.target.value)}
              className="w-full bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            >
              <option value="" className="bg-gray-950 text-white light:bg-white light:text-gray-900">All Sites</option>
              {sites.map(s => (
                <option key={s.id} value={s.id} className="bg-gray-950 text-white light:bg-white light:text-gray-900">{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Visitor Type</label>
            <select 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)}
              className="w-full bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            >
              <option value="" className="bg-gray-950 text-white light:bg-white light:text-gray-900">All Types</option>
              {visitorTypes.map(t => (
                <option key={t.id} value={t.name} className="bg-gray-950 text-white light:bg-white light:text-gray-900">{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Status</label>
            <select 
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            >
              <option value="" className="bg-gray-950 text-white light:bg-white light:text-gray-900">All Status</option>
              <option value="active" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Active On-Site</option>
              <option value="temp_out" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Temporary Exit</option>
              <option value="checkedout" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Checked Out</option>
              <option value="requested" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Requested Invites</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">From Date</label>
            <input 
              type="datetime-local"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">To Date</label>
            <div className="flex gap-2">
              <input 
                type="datetime-local"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="flex-1 bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
              <button 
                onClick={handleResetFilters}
                type="button"
                className="w-9 h-9 flex items-center justify-center bg-gray-800/40 hover:bg-gray-800 light:bg-gray-100 light:hover:bg-gray-200 text-gray-400 light:text-gray-600 rounded-lg border border-white/10 light:border-gray-200 transition-colors shrink-0"
                title="Reset Filters"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Registry Table */}
      <div className="p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200 overflow-hidden flex flex-col print:border-none print:bg-transparent print:p-0 print:shadow-none">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <span className="text-sm font-medium animate-pulse">Querying reporting databases...</span>
          </div>
        ) : !hasSearched ? (
          <div className="py-20 text-center text-gray-400">
            <p className="m-0 text-sm font-medium">Use search parameters above and click "Generate Report" to audit visitor history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 light:border-gray-200 text-gray-400 light:text-gray-600 print:border-black">
                  <th className="pb-3 text-xs uppercase font-bold tracking-wider">Pass ID</th>
                  <th className="pb-3 text-xs uppercase font-bold tracking-wider">Visitor</th>
                  <th className="pb-3 text-xs uppercase font-bold tracking-wider">Type</th>
                  <th className="pb-3 text-xs uppercase font-bold tracking-wider">Facility Site</th>
                  <th className="pb-3 text-xs uppercase font-bold tracking-wider">Checked In</th>
                  <th className="pb-3 text-xs uppercase font-bold tracking-wider">Checked Out</th>
                  <th className="pb-3 text-xs uppercase font-bold tracking-wider text-center print:hidden">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 light:divide-gray-100 print:divide-black">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-gray-500 italic">
                      No logs matching selected filters found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map(item => (
                    <tr key={item.id} className="hover:bg-white/5 light:hover:bg-gray-50/50 print:hover:bg-transparent">
                      <td className="py-4 text-sm text-indigo-400 font-mono font-bold tracking-wider">{item.id}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white light:text-gray-900 print:text-black">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.comingFrom || 'Independent'}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge type={item.type.toLowerCase()}>{item.type.replace('TempEmployee', 'Temp')}</Badge>
                      </td>
                      <td className="py-4 text-sm text-gray-300 light:text-gray-700 print:text-black">
                        {sites.find(s => s.id === item.site_id)?.name || item.site_id || 'Main Site'}
                      </td>
                      <td className="py-4 text-sm text-gray-300 light:text-gray-700 print:text-black">
                        {item.status === 'REQUESTED' ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Expected:</span>
                            <span className="text-xs font-semibold">{item.checkInTime ? new Date(item.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</span>
                          </div>
                        ) : (
                          item.checkInTime ? new Date(item.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Pending Arrival'
                        )}
                      </td>
                      <td className="py-4 text-sm">
                        {item.status === 'ACTIVE' ? (
                          <div className="flex flex-col gap-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:bg-transparent print:text-black print:border-none w-fit">
                              Active On-Site
                            </span>
                            {isVisitorOverstay(item) && (
                              <span className="px-2 py-0.5 text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg w-fit animate-pulse">
                                🚨 OVERSTAY ALERT
                              </span>
                            )}
                          </div>
                        ) : item.status === 'TEMP_OUT' ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
                              Temporary Exit
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {new Date(item.check_out_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        ) : item.status === 'REQUESTED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 print:bg-transparent print:text-black print:border-none">
                            Requested Invite
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-white/5 w-fit light:border-gray-250">
                              Checked Out
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {new Date(item.check_out_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-center print:hidden">
                        <button 
                          onClick={() => setSelectedVisitor(item)}
                          type="button"
                          className="p-1.5 rounded bg-gray-800/40 hover:bg-gray-800 light:bg-gray-100 light:hover:bg-gray-200 text-gray-400 light:text-gray-600 hover:text-white transition-colors"
                          title="Audit Trail Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedVisitor && (
        <Modal 
          isOpen={true} 
          onClose={() => setSelectedVisitor(null)} 
          title={`Audit Detail Trail: Pass #${selectedVisitor.id}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 py-2">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-4 w-[160px] mx-auto md:mx-0">
              {selectedVisitor.photo ? (
                <img src={selectedVisitor.photo} alt={selectedVisitor.name} className="w-40 h-40 object-cover rounded-xl border border-white/10 light:border-gray-200 shadow-lg" />
              ) : (
                <div className="w-40 h-40 rounded-xl bg-gray-800 light:bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-3xl border border-dashed border-white/10 light:border-gray-300 select-none">
                  {selectedVisitor.name.charAt(0)}
                </div>
              )}
              <Badge type={selectedVisitor.type.toLowerCase()}>{selectedVisitor.type}</Badge>
            </div>

            {/* Information Grid */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <User size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Full Name</span>
                    <strong className="text-sm text-white light:text-gray-900">{selectedVisitor.name}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Contact Number</span>
                    <strong className="text-sm text-white light:text-gray-900 font-mono">{selectedVisitor.phone}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Location Access</span>
                    <strong className="text-sm text-white light:text-gray-900">
                      Site: {sites.find(s => s.id === selectedVisitor.site_id)?.name || selectedVisitor.site_id || 'Main HQ'} • Bldg: {(() => {
                        if (!selectedVisitor.building_id) return 'Main';
                        for (const s of sites) {
                          const b = s.buildings?.find(bld => bld.id === selectedVisitor.building_id);
                          if (b) return b.name;
                        }
                        return selectedVisitor.building_id;
                      })()}
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Host / Meet With</span>
                    <strong className="text-sm text-white light:text-gray-900">{selectedVisitor.host || 'Unassigned'}</strong>
                  </div>
                </div>
              </div>

              {/* Purpose & Checkin Info */}
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div className="flex items-start gap-2.5">
                  <FileText size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Purpose of Visit</span>
                    <p className="text-sm text-gray-300 light:text-gray-600 m-0 mt-0.5">{selectedVisitor.purpose || 'General Visit'}</p>
                  </div>
                </div>                 <div className="flex items-start gap-2.5">
                  <Clock size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                      {selectedVisitor.status === 'REQUESTED' ? 'Expected Arrival Time' : 'Check-In Time'}
                    </span>
                    <strong className="text-sm text-white light:text-gray-900">
                      {selectedVisitor.checkInTime ? new Date(selectedVisitor.checkInTime).toLocaleString() : 'Pending Arrival'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Check-Out Time</span>
                    {selectedVisitor.check_out_time ? (
                      <strong className="text-sm text-white light:text-gray-900">
                        {new Date(selectedVisitor.check_out_time).toLocaleString()}
                      </strong>
                    ) : selectedVisitor.status === 'REQUESTED' ? (
                      <span className="text-sm text-indigo-400 font-bold">Pending Invite Activation</span>
                    ) : isVisitorOverstay(selectedVisitor) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-emerald-400 font-bold">Active On Site</span>
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg animate-pulse">
                          🚨 OVERSTAY ALERT
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-emerald-400 font-bold">Active On Site</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assets & Accessories */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Laptop size={18} />
                  <h4 className="text-sm font-bold text-white light:text-gray-900 m-0 font-heading">
                    Registered Assets & Accessories ({selectedVisitor.accessories ? selectedVisitor.accessories.length : 0})
                  </h4>
                </div>
                
                <div className="max-h-[120px] overflow-y-auto bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-250 p-3 rounded-lg space-y-2">
                  {!selectedVisitor.accessories || selectedVisitor.accessories.length === 0 ? (
                    <div className="text-xs text-gray-500 italic">No assets or accessories registered.</div>
                  ) : (
                    selectedVisitor.accessories.map((acc, index) => (
                      <div key={index} className="text-xs text-gray-300 light:text-gray-700 flex items-center gap-1.5">
                        <span>💻</span>
                        <strong>{acc.type}</strong>
                        <span>-</span>
                        <span className="font-mono">{acc.details || 'No Serial Info'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Access & Movement History */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Clock size={18} />
                  <h4 className="text-sm font-bold text-white light:text-gray-900 m-0 font-heading">
                    Access & Movement History ({
                      history.filter(h => h.phone === selectedVisitor.phone || (selectedVisitor.idNumber && h.idNumber === selectedVisitor.idNumber)).length
                    } entries)
                  </h4>
                </div>
                
                <div className="max-h-[150px] overflow-y-auto bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-250 p-3 rounded-lg space-y-3">
                  {history
                    .filter(h => h.phone === selectedVisitor.phone || (selectedVisitor.idNumber && h.idNumber === selectedVisitor.idNumber))
                    .map((visit, index) => (
                      <div key={visit.id} className="text-xs border-b border-white/5 last:border-none pb-2 last:pb-0">
                        <div className="flex justify-between text-gray-300 light:text-gray-700 font-semibold">
                          <span>Pass ID: {visit.id} ({visit.type})</span>
                          <span className={
                            visit.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 
                            visit.status === 'TEMP_OUT' ? 'text-amber-400 font-bold' : 'text-gray-500'
                          }>
                            {visit.status === 'ACTIVE' ? 'Active On-Site' : 
                             visit.status === 'TEMP_OUT' ? 'Temporary Exit' : 'Checked Out'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Checked In: {new Date(visit.checkInTime).toLocaleString()}
                          {visit.check_out_time && ` • Checked Out: ${new Date(visit.check_out_time).toLocaleString()}`}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Checkout Remarks Display */}
              {selectedVisitor.checkoutRemarks && (
                <div className="space-y-1.5 border-t border-white/5 pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Checkout Remarks</span>
                  <p className="text-xs text-gray-300 light:text-gray-700 bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-200 p-2.5 rounded-lg m-0 italic">
                    "{selectedVisitor.checkoutRemarks}"
                  </p>
                </div>
              )}

              {/* Force Permanent Checkout Form */}
              {(selectedVisitor.status === 'ACTIVE' || selectedVisitor.status === 'TEMP_OUT') && userRole !== 'Host' && (
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <ShieldCheck size={18} />
                    <h4 className="text-sm font-bold text-white light:text-gray-900 m-0 font-heading">
                      Force Permanent Checkout
                    </h4>
                  </div>
                  
                  <div className="bg-gray-800/40 light:bg-gray-50 border border-white/10 light:border-gray-250 p-4 rounded-xl space-y-3">
                    <p className="text-xs text-gray-400 light:text-gray-500 m-0">
                      If this visitor will not return, you can check them out permanently from here. This updates their status to Checked Out and records your remarks.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Checkout Remarks</label>
                      <textarea
                        value={checkoutRemarks}
                        onChange={e => setCheckoutRemarks(e.target.value)}
                        placeholder="Enter reasons / remarks for checkout..."
                        className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-500 transition-all resize-none h-16"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={handleModalCheckout}
                        disabled={checkoutLoading}
                      >
                        {checkoutLoading ? 'Processing...' : 'Confirm Checkout'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6 print:hidden">
            {(selectedVisitor.status === 'ACTIVE' || selectedVisitor.status === 'TEMP_OUT') && userRole !== 'Host' && (
              <Button 
                variant="primary" 
                onClick={() => setReprintVisitor(selectedVisitor)}
              >
                Reprint ID Pass
              </Button>
            )}
            <Button variant="secondary" onClick={() => setSelectedVisitor(null)}>Close Window</Button>
          </div>
        </Modal>
      )}

      {/* Reprint Pass Modal */}
      {reprintVisitor && (
        <Modal 
          isOpen={true} 
          onClose={() => setReprintVisitor(null)} 
          title="Reprint Visitor Pass"
        >
          <PassPreview 
            visitorData={reprintVisitor} 
            onPrint={() => {
              window.print();
              setReprintVisitor(null);
            }} 
          />
        </Modal>
      )}
    </div>
  );
};

export default Reports;