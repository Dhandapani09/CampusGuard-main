import React, { useState, useEffect } from 'react';
import { Search, RotateCw, UserCheck, UserPlus, Calendar, FilePlus, ShieldCheck } from 'lucide-react';
import VisitorForm from '../components/gate/VisitorForm';
import PassPreview from '../components/gate/PassPreview';
import Modal from '../components/shared/Modal';
import Button from '../components/shared/Button';
import { useVisitorContext } from '../context/VisitorContext';
import { apiClient } from '../services/apiClient';
import { useAppContext } from '../context/AppContext';

const GateEntry = () => {
  const { checkIn, checkInReturn } = useVisitorContext();
  const { currentUser } = useAppContext();
  const userRole = currentUser?.role || 'Guard';

  const [activeTab, setActiveTab] = useState('new');
  const [generatedPass, setGeneratedPass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Master data
  const [sites, setSites] = useState([]);
  const [visitorTypes, setVisitorTypes] = useState([]);

  // Return tab states
  const [tempOutVisitors, setTempOutVisitors] = useState([]);
  const [tempOutLoading, setTempOutLoading] = useState(false);
  const [returnSearch, setReturnSearch] = useState('');

  // Invites tab states
  const [requestedVisitors, setRequestedVisitors] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  
  // Prefill state for verifying pre-registered invites
  const [preFillData, setPreFillData] = useState(null);

  // Create Pre-Invite form states
  const [inviteFormData, setInviteFormData] = useState({
    type: 'Guest',
    name: '',
    phone: '',
    comingFrom: '',
    purpose: '',
    host: '',
    site_id: '',
    building_id: '',
    validUpto: (() => {
      const d = new Date();
      d.setHours(23, 59, 0, 0);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T23:59`;
    })(),
    expectedArrival: (() => {
      const d = new Date();
      d.setHours(d.getHours() + 1); // 1 hour from now
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    })()
  });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [createdInvitePass, setCreatedInvitePass] = useState(null);
  const [showInviteSuccessModal, setShowInviteSuccessModal] = useState(false);

  const loadSites = async () => {
    try {
      const data = await apiClient.getSites();
      setSites(data || []);
      if (data && data.length > 0) {
        setInviteFormData(prev => ({ ...prev, site_id: data[0].id }));
      }
    } catch (e) {
      console.error('Failed to load sites:', e);
    }
  };

  const loadVisitorTypes = async () => {
    try {
      const data = await apiClient.getVisitorTypes();
      setVisitorTypes(data || []);
    } catch (e) {
      console.error('Failed to load visitor types:', e);
    }
  };

  const loadTempOut = async () => {
    setTempOutLoading(true);
    try {
      const data = await apiClient.getTempOutVisitors();
      setTempOutVisitors(data || []);
    } catch (e) {
      console.error('Failed to load temp-out list:', e);
    } finally {
      setTempOutLoading(false);
    }
  };

  const loadInvites = async () => {
    setInvitesLoading(true);
    try {
      const data = await apiClient.getRequestedVisitors();
      setRequestedVisitors(data || []);
    } catch (e) {
      console.error('Failed to load pre-registered invites list:', e);
    } finally {
      setInvitesLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
    loadVisitorTypes();
    loadTempOut();
    loadInvites();
  }, []);

  useEffect(() => {
    if (activeTab === 'return') loadTempOut();
    if (activeTab === 'invites') loadInvites();
  }, [activeTab]);

  useEffect(() => {
    if (userRole === 'Host') {
      setActiveTab('create_invite');
      if (currentUser?.name) {
        setInviteFormData(prev => ({ ...prev, host: currentUser.name }));
      }
    }
  }, [userRole, currentUser]);

  const handleFormComplete = async (data) => {
    const checkedInVisitor = await checkIn(data);
    setGeneratedPass(checkedInVisitor);
    setIsModalOpen(true);
    setPreFillData(null);
    loadTempOut();
    loadInvites();
  };

  const handleReturnCheckIn = async (visitor) => {
    try {
      await checkInReturn(visitor.id);
      loadTempOut();
      alert(`Visitor ${visitor.name} checked back in successfully!`);
    } catch (err) {
      // Alert handled by context
    }
  };

  const handleOpenActivation = (visitor) => {
    setPreFillData({
      id: visitor.id,
      type: visitor.type || visitor.visitor_type || 'Guest',
      name: visitor.name || '',
      phone: visitor.phone || '',
      comingFrom: visitor.comingFrom || visitor.organization || '',
      purpose: visitor.purpose || '',
      host: visitor.host || '',
      site_id: visitor.site_id || '',
      building_id: visitor.building_id || '',
      validUpto: visitor.validUpto ? visitor.validUpto.substring(0, 16) : '',
      photo: visitor.photo || null,
      idType: 'Driver License',
      idNumber: '',
      accessories: []
    });
    setActiveTab('new');
  };

  const handleCreateInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteFormData.name || !inviteFormData.phone || !inviteFormData.host) {
      alert("Name, phone, and host are required fields.");
      return;
    }
    setInviteSubmitting(true);
    try {
      const payload = {
        ...inviteFormData,
        status: 'REQUESTED'
      };
      const data = await apiClient.registerVisitor(payload);
      setCreatedInvitePass(data);
      setShowInviteSuccessModal(true);
      setInviteFormData({
        type: 'Guest',
        name: '',
        phone: '',
        comingFrom: '',
        purpose: '',
        host: inviteFormData.host, // keep same host name for ease of multiple pre-invites
        site_id: sites[0]?.id || '',
        building_id: '',
        validUpto: (() => {
          const d = new Date();
          d.setHours(23, 59, 0, 0);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}T23:59`;
        })(),
        expectedArrival: (() => {
          const d = new Date();
          d.setHours(d.getHours() + 1);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        })()
      });
      loadInvites();
    } catch (error) {
      console.error("Failed to create visitor invite:", error);
      alert(`Error creating pre-invite: ${error.message || 'Invitation failed'}`);
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
    setIsModalOpen(false);
    setGeneratedPass(null);
  };

  const filteredTempOut = tempOutVisitors.filter(v =>
    v.name.toLowerCase().includes(returnSearch.toLowerCase()) ||
    v.id.toLowerCase().includes(returnSearch.toLowerCase()) ||
    (v.phone && v.phone.includes(returnSearch))
  );

  const filteredInvites = requestedVisitors.filter(v =>
    v.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
    v.id.toLowerCase().includes(inviteSearch.toLowerCase()) ||
    (v.phone && v.phone.includes(inviteSearch))
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white light:text-gray-900 font-heading m-0">
          Gate Registration
        </h1>
        <p className="text-gray-400 light:text-gray-500 text-sm mt-1 m-0">
          Register new visitors, verify identity, manage pre-registrations, and handle return entries.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 light:border-gray-200">
        {userRole !== 'Host' && (
          <>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all select-none ${
                activeTab === 'new'
                  ? 'border-indigo-500 text-white light:text-indigo-600 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white light:text-gray-500 light:hover:text-gray-900'
              }`}
            >
              <UserPlus size={16} />
              New Registration
            </button>
            
            <button
              onClick={() => setActiveTab('invites')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all select-none ${
                activeTab === 'invites'
                  ? 'border-indigo-500 text-white light:text-indigo-600 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white light:text-gray-500 light:hover:text-gray-900'
              }`}
            >
              <Calendar size={16} />
              Pre-Registered Invites
              {requestedVisitors.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-[10px] bg-indigo-500 text-white rounded-full font-bold">
                  {requestedVisitors.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('return')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all select-none ${
                activeTab === 'return'
                  ? 'border-indigo-500 text-white light:text-indigo-600 font-bold'
                  : 'border-transparent text-gray-400 hover:text-white light:text-gray-500 light:hover:text-gray-900'
              }`}
            >
              <UserCheck size={16} />
              Temporary Returns
              {tempOutVisitors.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-[10px] bg-indigo-500 text-white rounded-full font-bold">
                  {tempOutVisitors.length}
                </span>
              )}
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('create_invite')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all select-none ${
            activeTab === 'create_invite'
              ? 'border-indigo-500 text-white light:text-indigo-600 font-bold'
              : 'border-transparent text-gray-400 hover:text-white light:text-gray-500 light:hover:text-gray-900'
          }`}
        >
          <FilePlus size={16} />
          Pre-Register/Request
        </button>
      </div>

      {/* Tab 1: New Visitor Check-in */}
      {activeTab === 'new' && userRole !== 'Host' && (
        <div className="glass-panel p-6 lg:p-8">
          <VisitorForm 
            onComplete={handleFormComplete} 
            preFillData={preFillData}
            onCancelPreFill={() => setPreFillData(null)}
          />
        </div>
      )}

      {/* Tab 2: Pre-Registered Invites List */}
      {activeTab === 'invites' && userRole !== 'Host' && (
        <div className="glass-panel p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-white light:text-gray-900 m-0">Pre-Registered Invites</h3>
              <p className="text-xs text-gray-400 light:text-gray-500 m-0 mt-0.5">
                Verify and activate visitors requested in advance by employees.
              </p>
            </div>
            <button
              onClick={loadInvites}
              disabled={invitesLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 light:bg-gray-100 light:hover:bg-gray-200 text-gray-300 light:text-gray-700 border border-white/5 light:border-gray-250 transition-colors"
            >
              <RotateCw size={12} className={invitesLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="relative group max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={inviteSearch}
              onChange={e => setInviteSearch(e.target.value)}
              placeholder="Search invite by name, phone, or Pass ID..."
              className="w-full bg-gray-950/40 light:bg-gray-50 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-4">
            {invitesLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm animate-pulse">
                Fetching requested visitor invites...
              </div>
            ) : filteredInvites.length === 0 ? (
              <div className="py-12 text-center text-gray-400 border border-dashed border-white/10 rounded-xl light:border-gray-200">
                <p className="m-0 text-sm font-medium">No pending requested invites found.</p>
              </div>
            ) : (
              filteredInvites.map(visitor => (
                <div key={visitor.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-850/40 border border-white/5 rounded-xl hover:border-indigo-500/45 light:bg-gray-50 light:border-gray-200 transition-all duration-200 gap-4">
                  <div className="flex items-center gap-4">
                    {visitor.photo ? (
                      <img src={visitor.photo} alt={visitor.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 light:border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-800 text-white flex items-center justify-center font-bold text-lg light:bg-gray-200 light:text-gray-700 shrink-0 select-none">
                        {visitor.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white light:text-gray-900">{visitor.name}</span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                          Requested Invite
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 light:text-gray-500 font-mono mt-0.5">
                        Pass ID: {visitor.id} • {visitor.phone}
                      </span>
                      <span className="text-xs text-gray-500 light:text-gray-400 mt-0.5">
                        Invited by employee: <strong>{visitor.host}</strong> | Expected Arrival: <strong>{visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</strong> | Site: {sites.find(s => s.id === visitor.site_id)?.name || 'Main HQ'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenActivation(visitor)}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all duration-200"
                  >
                    Verify & Check In
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Temporary Returns List */}
      {activeTab === 'return' && userRole !== 'Host' && (
        <div className="glass-panel p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-white light:text-gray-900 m-0">Return Check-in</h3>
              <p className="text-xs text-gray-400 light:text-gray-500 m-0 mt-0.5">
                Quickly check back in visitors who are returning from a temporary exit.
              </p>
            </div>
            <button
              onClick={loadTempOut}
              disabled={tempOutLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 light:bg-gray-100 light:hover:bg-gray-200 text-gray-300 light:text-gray-700 border border-white/5 light:border-gray-250 transition-colors"
            >
              <RotateCw size={12} className={tempOutLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="relative group max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={returnSearch}
              onChange={e => setReturnSearch(e.target.value)}
              placeholder="Search returning visitor by name, phone, or Pass ID..."
              className="w-full bg-gray-950/40 light:bg-gray-50 border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-4">
            {tempOutLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm animate-pulse">
                Fetching returning visitors...
              </div>
            ) : filteredTempOut.length === 0 ? (
              <div className="py-12 text-center text-gray-400 border border-dashed border-white/10 rounded-xl light:border-gray-250">
                <p className="m-0 text-sm font-medium">No returning visitors found.</p>
              </div>
            ) : (
              filteredTempOut.map(visitor => (
                <div key={visitor.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-850/40 border border-white/5 rounded-xl hover:border-indigo-500/45 light:bg-gray-50 light:border-gray-200 transition-all duration-200 gap-4">
                  <div className="flex items-center gap-4">
                    {visitor.photo ? (
                      <img src={visitor.photo} alt={visitor.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 light:border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-800 text-white flex items-center justify-center font-bold text-lg light:bg-gray-200 light:text-gray-700 shrink-0 select-none">
                        {visitor.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white light:text-gray-900">{visitor.name}</span>
                        <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                          Temporary Out
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 light:text-gray-500 font-mono mt-0.5">
                        Pass ID: {visitor.id} • {visitor.phone}
                      </span>
                      <span className="text-xs text-gray-500 light:text-gray-400 mt-0.5">
                        Host: {visitor.host} | Site: {sites.find(s => s.id === visitor.site_id)?.name || visitor.site_id || 'Main Site'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReturnCheckIn(visitor)}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all duration-200"
                  >
                    Check In / Return
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Employee Pre-Register Invite Form */}
      {activeTab === 'create_invite' && (
        <div className="glass-panel p-6 lg:p-8 space-y-6">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-white light:text-gray-900 m-0 font-heading">Employee Pre-Registration Invite Portal</h3>
            <p className="text-xs text-gray-400 light:text-gray-500 m-0 mt-0.5">
              Submit a visitor pre-registration request. They will receive an invitation code to present at check-in.
            </p>
          </div>

          <form onSubmit={handleCreateInviteSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Visitor Category</label>
                <select
                  value={inviteFormData.type}
                  onChange={e => setInviteFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                >
                  {visitorTypes.map(t => (
                    <option key={t.id} value={t.name} className="bg-gray-950 text-white light:bg-white light:text-gray-950">{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Facility Site</label>
                <select
                  value={inviteFormData.site_id}
                  onChange={e => {
                    const siteId = e.target.value;
                    const site = sites.find(s => s.id === siteId);
                    setInviteFormData(prev => ({ 
                      ...prev, 
                      site_id: siteId,
                      building_id: site?.buildings?.[0]?.id || ''
                    }));
                  }}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id} className="bg-gray-950 text-white light:bg-white light:text-gray-950">{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Visitor name..."
                  value={inviteFormData.name}
                  onChange={e => setInviteFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Visitor Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="Visitor contact phone..."
                  value={inviteFormData.phone}
                  onChange={e => setInviteFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Host / Employee Name</label>
                <input
                  type="text"
                  required
                  placeholder="Employee hosting this visitor..."
                  value={inviteFormData.host}
                  disabled={userRole === 'Host'}
                  onChange={e => setInviteFormData(prev => ({ ...prev, host: e.target.value }))}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Organization / Coming From</label>
                <input
                  type="text"
                  placeholder="Company name (optional)..."
                  value={inviteFormData.comingFrom}
                  onChange={e => setInviteFormData(prev => ({ ...prev, comingFrom: e.target.value }))}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Purpose of Visit</label>
                <input
                  type="text"
                  placeholder="Meeting, interview, delivery..."
                  value={inviteFormData.purpose}
                  onChange={e => setInviteFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Expected Arrival Date/Time</label>
                <input
                  type="datetime-local"
                  required
                  value={inviteFormData.expectedArrival}
                  onChange={e => setInviteFormData(prev => ({ ...prev, expectedArrival: e.target.value }))}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Valid Upto</label>
                <input
                  type="datetime-local"
                  value={inviteFormData.validUpto}
                  onChange={e => setInviteFormData(prev => ({ ...prev, validUpto: e.target.value }))}
                  className="w-full bg-gray-900/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <Button type="submit" variant="primary" disabled={inviteSubmitting}>
                {inviteSubmitting ? 'Creating Invite...' : 'Generate Pre-Invite'}
              </Button>
            </div>
          </form>
        </div>
        )}

      {/* Pre-Invite success popup */}
      {showInviteSuccessModal && createdInvitePass && (
        <Modal
          isOpen={true}
          onClose={() => setShowInviteSuccessModal(false)}
          title="Pre-Registration Invite Generated"
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-2 border border-indigo-500/20">
              <ShieldCheck size={36} />
            </div>
            
            <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Invite Logged Successfully</h3>
            <p className="text-xs text-gray-400 light:text-gray-500 max-w-sm mx-auto m-0">
              A pre-registration request has been logged. Share this code with the visitor:
            </p>
            
            <div className="p-3 bg-gray-900/80 light:bg-gray-100 rounded-lg border border-white/10 font-mono text-lg font-bold text-indigo-400 select-all tracking-wider w-fit mx-auto">
              {createdInvitePass.id}
            </div>

            <div className="text-left bg-gray-800/20 light:bg-gray-50 p-3 rounded-lg text-xs space-y-1 text-gray-300 light:text-gray-600 max-w-sm mx-auto">
              <div>Visitor: <strong>{createdInvitePass.name}</strong></div>
              <div>Host Employee: <strong>{createdInvitePass.host}</strong></div>
              <div>Valid Upto: <strong>{createdInvitePass.validUpto ? new Date(createdInvitePass.validUpto).toLocaleString() : 'N/A'}</strong></div>
            </div>

            <div className="pt-4 flex justify-center">
              <Button variant="primary" onClick={() => setShowInviteSuccessModal(false)}>Done</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Main Pass Preview Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Pass Generated Successfully"
      >
        <PassPreview visitorData={generatedPass} onPrint={handlePrint} />
      </Modal>
    </div>
  );
};

export default GateEntry;
