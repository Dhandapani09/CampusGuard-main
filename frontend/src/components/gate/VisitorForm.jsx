import React, { useState, useEffect } from 'react';
import GateBanner from './GateBanner';
import WebcamCapture from './WebcamCapture';
import AICheckPanel from '../ai/AICheckPanel';
import Button from '../shared/Button';
import Toast from '../shared/Toast';
import { Plus, Trash2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const getEndOfTodayLocal = () => {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const VisitorForm = ({ onComplete, preFillData, onCancelPreFill }) => {
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    type: 'Guest',
    name: '',
    phone: '',
    comingFrom: '',
    purpose: '',
    host: '',
    idType: 'Driver License',
    idNumber: '',
    photo: null,
    accessories: [],
    site_id: '',
    building_id: '',
    validUpto: getEndOfTodayLocal()
  });

  const [accessoryTypes, setAccessoryTypes] = useState(['Laptop', 'Mobile', 'Pendrive', 'Tablet', 'Camera']);
  const [sites, setSites] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [visitorTypes, setVisitorTypes] = useState([]);

  // Fetch Sites, Accessory Types, and Visitor Types from backend
  useEffect(() => {
    const loadMasterData = async () => {
      const fetchedSites = await apiClient.getSites();
      setSites(fetchedSites || []);
      
      const fetchedAccs = await apiClient.getAccessories();
      if (fetchedAccs && fetchedAccs.length > 0) {
        setAccessoryTypes(fetchedAccs.map(a => a.name));
      }

      const fetchedVisitorTypes = await apiClient.getVisitorTypes();
      setVisitorTypes(fetchedVisitorTypes || []);
      if (fetchedVisitorTypes && fetchedVisitorTypes.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          type: prev.type || fetchedVisitorTypes[0].name 
        }));
      }
    };
    loadMasterData();
  }, []);

  // Handle prefill data from invites
  useEffect(() => {
    if (preFillData) {
      setFormData(prev => ({
        ...prev,
        id: preFillData.id || null,
        type: preFillData.type || prev.type,
        name: preFillData.name || '',
        phone: preFillData.phone || '',
        comingFrom: preFillData.comingFrom || '',
        purpose: preFillData.purpose || '',
        host: preFillData.host || '',
        site_id: preFillData.site_id || prev.site_id,
        building_id: preFillData.building_id || prev.building_id,
        validUpto: preFillData.validUpto || prev.validUpto,
        idType: preFillData.idType || 'Driver License',
        idNumber: preFillData.idNumber || '',
        photo: preFillData.photo || null,
        accessories: preFillData.accessories || []
      }));
    }
  }, [preFillData]);

  // Update buildings list and autoselect when site_id changes
  useEffect(() => {
    if (formData.site_id) {
      const selectedSiteObj = sites.find(s => s.id === formData.site_id);
      if (selectedSiteObj && selectedSiteObj.buildings) {
        setFilteredBuildings(selectedSiteObj.buildings);
        if (selectedSiteObj.buildings.length > 0) {
          setFormData(prev => {
            const hasSelectedBuilding = selectedSiteObj.buildings.some(b => b.id === prev.building_id);
            return {
              ...prev,
              building_id: hasSelectedBuilding ? prev.building_id : selectedSiteObj.buildings[0].id
            };
          });
        } else {
          setFormData(prev => ({ ...prev, building_id: '' }));
        }
      } else {
        setFilteredBuildings([]);
        setFormData(prev => ({ ...prev, building_id: '' }));
      }
    } else {
      setFilteredBuildings([]);
      setFormData(prev => ({ ...prev, building_id: '' }));
    }
  }, [formData.site_id, sites]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = React.useCallback((photoData) => {
    setFormData(prev => ({ ...prev, photo: photoData }));
  }, []);

  const handleAccessoryChange = (index, field, value) => {
    setFormData(prev => {
      const newAcc = [...prev.accessories];
      newAcc[index] = { ...newAcc[index], [field]: value };
      return { ...prev, accessories: newAcc };
    });
  };

  const addAccessory = () => {
    setFormData(prev => ({
      ...prev,
      accessories: [...prev.accessories, { type: accessoryTypes[0] || 'Laptop', details: '' }]
    }));
  };

  const removeAccessory = (index) => {
    setFormData(prev => {
      const newAcc = prev.accessories.filter((_, idx) => idx !== index);
      return { ...prev, accessories: newAcc };
    });
  };

  const handleCancelVerification = () => {
    setFormData({
      id: null,
      type: visitorTypes[0]?.name || 'Guest',
      name: '',
      phone: '',
      comingFrom: '',
      purpose: '',
      host: '',
      idType: 'Driver License',
      idNumber: '',
      photo: null,
      accessories: [],
      site_id: sites[0]?.id || '',
      building_id: '',
      validUpto: getEndOfTodayLocal()
    });
    if (onCancelPreFill) {
      onCancelPreFill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedVisitorType = visitorTypes.find(vt => vt.name === formData.type);
    const skipPhoto = selectedVisitorType ? selectedVisitorType.skip_photo_capture : false;
    
    // Validate photo capture for non-VIP types
    if (!skipPhoto && !formData.photo) {
      alert('Please capture a visitor photo for identity verification.');
      return;
    }

    // Trigger Forgotten ID Protocol if ID number is missing
    if (!formData.idNumber) {
      setShowToast(true);
    }

    try {
      const response = await apiClient.checkInVisitor(formData);
      if (response && onComplete) {
        onComplete(response);
      }
      // Reset form on success
      setFormData({
        id: null,
        type: visitorTypes[0]?.name || 'Guest',
        name: '',
        phone: '',
        comingFrom: '',
        purpose: '',
        host: '',
        idType: 'Driver License',
        idNumber: '',
        photo: null,
        accessories: [],
        site_id: sites[0]?.id || '',
        building_id: '',
        validUpto: getEndOfTodayLocal()
      });
    } catch (error) {
      console.error('Check-in error:', error);
      alert(error.message || 'Check-in failed. Please try again.');
    }
  };

  const selectedVisitorType = visitorTypes.find(vt => vt.name === formData.type);
  const bannerColor = selectedVisitorType ? selectedVisitorType.banner_color : undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {formData.id && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3.5 flex justify-between items-center text-xs text-indigo-400 font-bold mb-2">
          <span>Verifying Invite Pass: {formData.id}</span>
          <button 
            type="button" 
            onClick={handleCancelVerification}
            className="underline hover:text-indigo-300 transition-colors font-semibold"
          >
            Cancel Verification
          </button>
        </div>
      )}

      <GateBanner visitorType={formData.type} bannerColor={bannerColor} />

      <div className="flex flex-wrap gap-3 mb-6">
        {visitorTypes.map(t => (
          <label 
            key={t.id} 
            className={`flex items-center justify-center px-5 py-2.5 rounded-lg border font-semibold text-sm cursor-pointer select-none transition-all duration-200 ${
              formData.type === t.name 
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                : 'bg-gray-800/40 light:bg-gray-100 border-white/10 light:border-gray-200 text-gray-300 light:text-gray-600 hover:bg-gray-700/40 light:hover:bg-gray-200/50'
            }`}
          >
            <input 
              type="radio" 
              name="type" 
              value={t.name} 
              checked={formData.type === t.name} 
              onChange={handleChange} 
              className="hidden" 
            />
            {t.name.replace('TempEmployee', 'Temp Employee')}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">
        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white light:text-gray-900 border-b border-white/10 light:border-gray-200 pb-2 m-0">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Visitor's full name"
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="E.g., +1 234 567 890"
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Site</label>
                <select 
                  name="site_id" 
                  value={formData.site_id} 
                  onChange={handleChange} 
                  required
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all w-full"
                >
                  <option value="" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Select Site</option>
                  {sites.map(s => (
                    <option key={s.id} value={s.id} className="bg-gray-950 text-white light:bg-white light:text-gray-900">{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Building</label>
                <select 
                  name="building_id" 
                  value={formData.building_id} 
                  onChange={handleChange} 
                  required
                  disabled={!formData.site_id}
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all disabled:opacity-50 w-full"
                >
                  <option value="" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Select Building</option>
                  {filteredBuildings.map(b => (
                    <option key={b.id} value={b.id} className="bg-gray-950 text-white light:bg-white light:text-gray-900">{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Representing / Organization</label>
              <input 
                type="text" 
                name="comingFrom" 
                value={formData.comingFrom} 
                onChange={handleChange} 
                placeholder="Company Name or Independent"
                className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all w-full"
              />
            </div>
          </div>

          {/* Section 2: Assets & Accessories */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 light:border-gray-200 pb-2">
              <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Assets & Accessories</h3>
              <button 
                type="button" 
                onClick={addAccessory} 
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                <Plus size={14} /> Add Asset
              </button>
            </div>
            
            {formData.accessories.length === 0 ? (
              <p className="text-xs text-gray-500 italic m-0">No assets or accessories declared.</p>
            ) : (
              <div className="space-y-3">
                {formData.accessories.map((acc, idx) => (
                  <div key={idx} className="flex gap-3 items-center w-full">
                    <select 
                      value={acc.type} 
                      onChange={(e) => handleAccessoryChange(idx, 'type', e.target.value)}
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all w-[150px] shrink-0"
                    >
                      {accessoryTypes.map(type => (
                        <option key={type} value={type} className="bg-gray-950 text-white light:bg-white light:text-gray-900">{type}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      placeholder="Serial # / Details" 
                      value={acc.details} 
                      onChange={(e) => handleAccessoryChange(idx, 'details', e.target.value)}
                      className="flex-1 bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeAccessory(idx)}
                      className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Visit Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white light:text-gray-900 border-b border-white/10 light:border-gray-200 pb-2 m-0">Visit Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Host / Meet With</label>
                <input 
                  type="text" 
                  name="host" 
                  value={formData.host} 
                  onChange={handleChange} 
                  placeholder="Search staff name..."
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Valid Upto</label>
                <input 
                  type="datetime-local" 
                  name="validUpto" 
                  value={formData.validUpto} 
                  onChange={handleChange} 
                  required
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Purpose of Visit</label>
              <textarea 
                name="purpose" 
                value={formData.purpose} 
                onChange={handleChange} 
                rows={3} 
                required 
                placeholder="E.g., Meeting, Server Repair, Delivery..."
                className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all w-full"
              />
            </div>
            
            <AICheckPanel 
              visitorName={formData.name} 
              visitorPhone={formData.phone} 
              purpose={formData.purpose} 
            />
          </div>
        </div>

        {/* Identity Verification Column */}
        <div className="flex flex-col">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white light:text-gray-900 border-b border-white/10 light:border-gray-200 pb-2 m-0">Identity Verification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">ID Type</label>
                  <select 
                    name="idType" 
                    value={formData.idType} 
                    onChange={handleChange}
                    className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all w-full"
                  >
                    <option value="Driver License" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Driver License</option>
                    <option value="Passport" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Passport</option>
                    <option value="Company ID" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Company ID</option>
                    <option value="Other" className="bg-gray-950 text-white light:bg-white light:text-gray-900">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">ID Number</label>
                  <input 
                    type="text" 
                    name="idNumber" 
                    value={formData.idNumber} 
                    onChange={handleChange} 
                    placeholder="Enter ID number"
                    className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-600 light:placeholder:text-gray-400 transition-all w-full"
                  />
                </div>
              </div>

              <WebcamCapture 
                onCapture={handlePhotoCapture} 
                skipped={selectedVisitorType ? selectedVisitorType.skip_photo_capture : false} 
              />
            </div>
            
            <div className="pt-4">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Generate Pass
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="toast-container fixed bottom-6 right-6 z-50">
          <Toast 
            type="warning" 
            message="Forgotten ID Protocol Initiated. An email has been sent to the Department Head and Security Manager." 
            onClose={() => setShowToast(false)} 
          />
        </div>
      )}
    </form>
  );
};

export default VisitorForm;