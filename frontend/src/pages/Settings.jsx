import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Users, Palette, Plus, Trash2, Bell, Building, MonitorSmartphone, UserCheck, Edit2, X } from 'lucide-react';
import Button from '../components/shared/Button';
import { apiClient } from '../services/apiClient';
import { useAppContext } from '../context/AppContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('master');
  const [masterTab, setMasterTab] = useState('sites'); // sites, departments, accessories, visitorTypes

  // Real data state
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [visitorTypes, setVisitorTypes] = useState([]);
  
  const [branding, setBranding] = useState({
    company_name: 'CampusGuard',
    logo_url: '',
    tagline: 'Secure. Smart. Seamless.',
    logo_initial: 'CG',
    contact_info: 'security@campusguard.local'
  });

  const [notifications, setNotifications] = useState({
    email_enabled: true,
    sms_enabled: false,
    alert_threshold_mins: 120
  });

  // UI state
  const [expandedSite, setExpandedSite] = useState(null);
  
  // Forms state
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [newBuildingName, setNewBuildingName] = useState('');
  
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHodName, setNewDeptHodName] = useState('');
  const [newDeptHodEmail, setNewDeptHodEmail] = useState('');
  
  const [newAccName, setNewAccName] = useState('');
  const [newAccDesc, setNewAccDesc] = useState('');

  const [newBlackName, setNewBlackName] = useState('');
  const [newBlackPhone, setNewBlackPhone] = useState('');
  const [newBlackReason, setNewBlackReason] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('Guard');
  const [newUserPassword, setNewUserPassword] = useState('');

  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#10B981');
  const [newTypeSkipPhoto, setNewTypeSkipPhoto] = useState(false);

  // PRESET COLORS for Visitor Categories
  const PRESET_COLORS = [
    '#10B981', // Emerald
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#6B7280'  // Gray
  ];

  // Editing state
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [editSiteName, setEditingSiteName] = useState('');
  const [editSiteLocation, setEditingSiteLocation] = useState('');

  const [editingBuildingId, setEditingBuildingId] = useState(null);
  const [editBuildingName, setEditingBuildingName] = useState('');

  const [editingDeptId, setEditingDeptId] = useState(null);
  const [editDeptName, setEditingDeptName] = useState('');
  const [editDeptHodName, setEditingDeptHodName] = useState('');
  const [editDeptHodEmail, setEditingDeptHodEmail] = useState('');

  const [editingAccId, setEditingAccId] = useState(null);
  const [editAccName, setEditingAccName] = useState('');
  const [editAccDesc, setEditingAccDesc] = useState('');

  const [editingBlackId, setEditingBlackId] = useState(null);
  const [editBlackName, setEditingBlackName] = useState('');
  const [editBlackPhone, setEditingBlackPhone] = useState('');
  const [editBlackReason, setEditingBlackReason] = useState('');

  const [editingVisitorTypeId, setEditingVisitorTypeId] = useState(null);
  const [editVisitorTypeName, setEditingVisitorTypeName] = useState('');
  const [editVisitorTypeColor, setEditingVisitorTypeColor] = useState('#10B981');
  const [editVisitorTypeDesc, setEditingVisitorTypeDesc] = useState('');
  const [editVisitorTypeSkipPhoto, setEditingVisitorTypeSkipPhoto] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserUsername, setEditingUserUsername] = useState('');
  const [editUserFullName, setEditingUserFullName] = useState('');
  const [editUserRole, setEditingUserRole] = useState('Guard');
  const [editUserPassword, setEditingUserPassword] = useState('');

  // Status/Alert state
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

  // Users & Roles state
  const { reloadUsers, reloadBranding, users } = useAppContext();

  const loadSettingsData = async () => {
    try {
      const siteData = await apiClient.getSites();
      setSites(siteData || []);
      const deptData = await apiClient.getDepartments();
      setDepartments(deptData || []);
      const accData = await apiClient.getAccessories();
      setAccessories(accData || []);
      const blacklistData = await apiClient.getBlacklist();
      setBlacklist(blacklistData || []);
      const visitorTypesData = await apiClient.getVisitorTypes();
      setVisitorTypes(visitorTypesData || []);
      
      const brandData = await apiClient.getBranding();
      if (brandData) setBranding(brandData);
      
      const notifData = await apiClient.getNotifications();
      if (notifData) setNotifications(notifData);
    } catch (e) {
      console.error('Failed to load settings data:', e);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.updateBranding(branding);
      await reloadBranding();
      setSaveStatus({ type: 'success', message: 'Branding options saved successfully!' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to update branding options.' });
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.updateNotifications(notifications);
      setSaveStatus({ type: 'success', message: 'Notification preferences saved successfully!' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to update notification preferences.' });
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.createUser({
        username: newUsername,
        full_name: newFullName,
        role: newRole,
        password: newUserPassword
      });
      setNewUsername('');
      setNewFullName('');
      setNewUserPassword('');
      await reloadUsers();
      setSaveStatus({ type: 'success', message: 'User created successfully!' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to create user.' });
    }
  };

  const handleDeleteUser = async (userId) => {
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.deleteUser(userId);
      await reloadUsers();
      setSaveStatus({ type: 'success', message: 'User deleted successfully!' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to delete user.' });
    }
  };

  const handleAddBlacklist = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.addToBlacklist({
        name: newBlackName,
        phone: newBlackPhone,
        reason: newBlackReason
      });
      setNewBlackName('');
      setNewBlackPhone('');
      setNewBlackReason('');
      const data = await apiClient.getBlacklist();
      setBlacklist(data || []);
      setSaveStatus({ type: 'success', message: 'Added to blacklist successfully.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to add to blacklist.' });
    }
  };

  const handleDeleteBlacklist = async (id) => {
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.removeFromBlacklist(id);
      const data = await apiClient.getBlacklist();
      setBlacklist(data || []);
      setSaveStatus({ type: 'success', message: 'Removed from blacklist.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to remove from blacklist.' });
    }
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: '', message: '' });
    const duplicate = sites.some(s => s.name.toLowerCase() === newSiteName.toLowerCase());
    if (duplicate) {
      setSaveStatus({ type: 'danger', message: 'A site with this name already exists.' });
      return;
    }
    try {
      await apiClient.createSite({ name: newSiteName, location: newSiteLocation });
      setNewSiteName('');
      setNewSiteLocation('');
      const data = await apiClient.getSites();
      setSites(data || []);
      setSaveStatus({ type: 'success', message: 'Site added successfully.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to create site.' });
    }
  };

  const handleDeleteSite = async (id) => {
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.deleteSite(id);
      const data = await apiClient.getSites();
      setSites(data || []);
      setSaveStatus({ type: 'success', message: 'Site deleted.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to delete site.' });
    }
  };

  const handleAddBuilding = async (siteId) => {
    if (!newBuildingName) return;
    setSaveStatus({ type: '', message: '' });
    const targetSite = sites.find(s => s.id === siteId);
    if (targetSite && targetSite.buildings) {
      const duplicate = targetSite.buildings.some(b => b.name.toLowerCase() === newBuildingName.toLowerCase());
      if (duplicate) {
        setSaveStatus({ type: 'danger', message: 'A building with this name already exists on this site.' });
        return;
      }
    }
    try {
      await apiClient.createBuilding(siteId, newBuildingName);
      setNewBuildingName('');
      const data = await apiClient.getSites();
      setSites(data || []);
      setSaveStatus({ type: 'success', message: 'Building added.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to add building.' });
    }
  };

  const handleDeleteBuilding = async (id) => {
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.deleteBuilding(id);
      const data = await apiClient.getSites();
      setSites(data || []);
      setSaveStatus({ type: 'success', message: 'Building deleted.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to delete building.' });
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: '', message: '' });
    const duplicate = departments.some(d => d.name.toLowerCase() === newDeptName.toLowerCase());
    if (duplicate) {
      setSaveStatus({ type: 'danger', message: 'A department with this name already exists.' });
      return;
    }
    try {
      await apiClient.createDepartment({
        name: newDeptName,
        hod_name: newDeptHodName,
        hod_email: newDeptHodEmail
      });
      setNewDeptName('');
      setNewDeptHodName('');
      setNewDeptHodEmail('');
      const data = await apiClient.getDepartments();
      setDepartments(data || []);
      setSaveStatus({ type: 'success', message: 'Department added.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to add department.' });
    }
  };

  const handleDeleteDept = async (id) => {
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.deleteDepartment(id);
      const data = await apiClient.getDepartments();
      setDepartments(data || []);
      setSaveStatus({ type: 'success', message: 'Department deleted.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to delete department.' });
    }
  };

  const handleAddAcc = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: '', message: '' });
    const duplicate = accessories.some(a => a.name.toLowerCase() === newAccName.toLowerCase());
    if (duplicate) {
      setSaveStatus({ type: 'danger', message: 'An accessory type with this name already exists.' });
      return;
    }
    try {
      await apiClient.createAccessory({ name: newAccName, description: newAccDesc });
      setNewAccName('');
      setNewAccDesc('');
      const data = await apiClient.getAccessories();
      setAccessories(data || []);
      setSaveStatus({ type: 'success', message: 'Accessory type added.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to add accessory type.' });
    }
  };

  const handleDeleteAcc = async (id) => {
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.deleteAccessory(id);
      const data = await apiClient.getAccessories();
      setAccessories(data || []);
      setSaveStatus({ type: 'success', message: 'Accessory type deleted.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to delete accessory type.' });
    }
  };

  const handleAddVisitorType = async (e) => {
    e.preventDefault();
    setSaveStatus({ type: '', message: '' });
    const nameExists = visitorTypes.some(t => t.name.toLowerCase() === newTypeName.toLowerCase());
    if (nameExists) {
      setSaveStatus({ type: 'danger', message: 'A visitor category with this name already exists.' });
      return;
    }
    const colorExists = visitorTypes.some(t => t.banner_color.toLowerCase() === newTypeColor.toLowerCase());
    if (colorExists) {
      setSaveStatus({ type: 'danger', message: 'This color is already assigned to another category. Please choose a different color.' });
      return;
    }
    try {
      await apiClient.createVisitorType({ 
        name: newTypeName, 
        banner_color: newTypeColor,
        skip_photo_capture: newTypeSkipPhoto
      });
      setNewTypeName('');
      setNewTypeColor('#10B981');
      setNewTypeSkipPhoto(false);
      const data = await apiClient.getVisitorTypes();
      setVisitorTypes(data || []);
      setSaveStatus({ type: 'success', message: 'Visitor category added.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to add visitor category.' });
    }
  };

  const handleDeleteVisitorType = async (id) => {
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.deleteVisitorType(id);
      const data = await apiClient.getVisitorTypes();
      setVisitorTypes(data || []);
      setSaveStatus({ type: 'success', message: 'Visitor category deleted.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: 'Failed to delete visitor category.' });
    }
  };

  // --- UPDATE HANDLERS ---
  const handleUpdateSite = async (siteId) => {
    if (!editSiteName) return;
    setSaveStatus({ type: '', message: '' });
    const duplicate = sites.some(s => s.id !== siteId && s.name.toLowerCase() === editSiteName.toLowerCase());
    if (duplicate) {
      setSaveStatus({ type: 'danger', message: 'Another site with this name already exists.' });
      return;
    }
    try {
      await apiClient.updateSite(siteId, { name: editSiteName, location_details: editSiteLocation });
      setEditingSiteId(null);
      const data = await apiClient.getSites();
      setSites(data || []);
      setSaveStatus({ type: 'success', message: 'Site updated successfully.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: e.message || 'Failed to update site.' });
    }
  };

  const handleUpdateBuilding = async (siteId, buildingId) => {
    if (!editBuildingName) return;
    setSaveStatus({ type: '', message: '' });
    const siteObj = sites.find(s => s.id === siteId);
    if (siteObj && siteObj.buildings) {
      const duplicate = siteObj.buildings.some(b => b.id !== buildingId && b.name.toLowerCase() === editBuildingName.toLowerCase());
      if (duplicate) {
        setSaveStatus({ type: 'danger', message: 'Another building with this name already exists on this site.' });
        return;
      }
    }
    try {
      await apiClient.updateBuilding(siteId, buildingId, editBuildingName);
      setEditingBuildingId(null);
      const data = await apiClient.getSites();
      setSites(data || []);
      setSaveStatus({ type: 'success', message: 'Building updated successfully.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: e.message || 'Failed to update building.' });
    }
  };

  const handleUpdateDept = async (deptId) => {
    if (!editDeptName || !editDeptHodName || !editDeptHodEmail) return;
    setSaveStatus({ type: '', message: '' });
    const duplicate = departments.some(d => d.id !== deptId && d.name.toLowerCase() === editDeptName.toLowerCase());
    if (duplicate) {
      setSaveStatus({ type: 'danger', message: 'Another department with this name already exists.' });
      return;
    }
    try {
      await apiClient.updateDepartment(deptId, {
        name: editDeptName,
        hod_name: editDeptHodName,
        hod_email: editDeptHodEmail
      });
      setEditingDeptId(null);
      const data = await apiClient.getDepartments();
      setDepartments(data || []);
      setSaveStatus({ type: 'success', message: 'Department updated successfully.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: e.message || 'Failed to update department.' });
    }
  };

  const handleUpdateAcc = async (accId) => {
    if (!editAccName) return;
    setSaveStatus({ type: '', message: '' });
    const duplicate = accessories.some(a => a.id !== accId && a.name.toLowerCase() === editAccName.toLowerCase());
    if (duplicate) {
      setSaveStatus({ type: 'danger', message: 'Another accessory type with this name already exists.' });
      return;
    }
    try {
      await apiClient.updateAccessory(accId, { name: editAccName, description: editAccDesc });
      setEditingAccId(null);
      const data = await apiClient.getAccessories();
      setAccessories(data || []);
      setSaveStatus({ type: 'success', message: 'Accessory type updated successfully.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: e.message || 'Failed to update accessory type.' });
    }
  };

  const handleUpdateBlacklist = async (blackId) => {
    if (!editBlackName || !editBlackPhone || !editBlackReason) return;
    setSaveStatus({ type: '', message: '' });
    try {
      await apiClient.updateBlacklist(blackId, {
        name: editBlackName,
        phone: editBlackPhone,
        reason: editBlackReason
      });
      setEditingBlackId(null);
      const data = await apiClient.getBlacklist();
      setBlacklist(data || []);
      setSaveStatus({ type: 'success', message: 'Blacklist entry updated.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: e.message || 'Failed to update blacklist entry.' });
    }
  };

  const handleUpdateVisitorType = async (typeId) => {
    if (!editVisitorTypeName) return;
    setSaveStatus({ type: '', message: '' });
    const nameExists = visitorTypes.some(t => t.id !== typeId && t.name.toLowerCase() === editVisitorTypeName.toLowerCase());
    if (nameExists) {
      setSaveStatus({ type: 'danger', message: 'Another visitor type with this name already exists.' });
      return;
    }
    const colorExists = visitorTypes.some(t => t.id !== typeId && t.banner_color.toLowerCase() === editVisitorTypeColor.toLowerCase());
    if (colorExists) {
      setSaveStatus({ type: 'danger', message: 'This color is already assigned to another category.' });
      return;
    }
    try {
      await apiClient.updateVisitorType(typeId, {
        name: editVisitorTypeName,
        banner_color: editVisitorTypeColor,
        description: editVisitorTypeDesc,
        skip_photo_capture: editVisitorTypeSkipPhoto
      });
      setEditingVisitorTypeId(null);
      const data = await apiClient.getVisitorTypes();
      setVisitorTypes(data || []);
      setSaveStatus({ type: 'success', message: 'Visitor category updated.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: e.message || 'Failed to update visitor category.' });
    }
  };

  const handleUpdateUser = async (userId) => {
    if (!editUserUsername || !editUserFullName || !editUserRole) return;
    setSaveStatus({ type: '', message: '' });
    const duplicate = users.some(u => u.id !== userId && u.username.toLowerCase() === editUserUsername.toLowerCase());
    if (duplicate) {
      setSaveStatus({ type: 'danger', message: 'Username is already taken by another user.' });
      return;
    }
    try {
      await apiClient.updateUser(userId, {
        username: editUserUsername,
        name: editUserFullName,
        role: editUserRole,
        email: users.find(u => u.id === userId)?.email || `${editUserUsername}@campusguard.local`,
        password: editUserPassword || undefined
      });
      setEditingUserId(null);
      setEditUserPassword('');
      await reloadUsers();
      setSaveStatus({ type: 'success', message: 'User updated successfully.' });
    } catch (e) {
      setSaveStatus({ type: 'danger', message: e.message || 'Failed to update user.' });
    }
  };

  const tabs = [
    { id: 'master', label: 'Master Data', icon: MonitorSmartphone },
    { id: 'blacklist', label: 'Global Blacklist', icon: Shield },
    { id: 'branding', label: 'Branding & Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications Config', icon: Bell },
    { id: 'users', label: 'Users & Roles', icon: UserCheck }
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white light:text-gray-900 font-heading m-0 flex items-center gap-2">
          <SettingsIcon className="text-indigo-500" size={28} />
          System Settings
        </h1>
        <p className="text-sm text-gray-400 light:text-gray-500 m-0 mt-1 font-medium">
          Manage master metadata, security blacklist controls, application branding, and access roles.
        </p>
      </div>

      {/* Save Status Banner */}
      {saveStatus.message && (
        <div className={`p-4 border rounded-xl text-sm transition-all duration-300 animate-in fade-in ${
          saveStatus.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {saveStatus.message}
        </div>
      )}

      {/* Main Settings Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
        
        {/* Settings Tab List */}
        <div className="flex flex-col gap-1.5 p-2 backdrop-blur-xl bg-gray-900/40 border border-white/10 rounded-2xl light:bg-white light:border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSaveStatus({ type: '', message: '' }); }}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} className="shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Tab Content */}
        <div className="p-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl light:bg-white light:border-gray-200 min-h-[450px]">
          
          {/* TAB 1: MASTER DATA */}
          {activeTab === 'master' && (
            <div className="space-y-6">
              <div className="flex gap-2 border-b border-white/10 pb-4 mb-4 overflow-x-auto">
                {['sites', 'departments', 'accessories', 'visitorTypes'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setMasterTab(sub)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                      masterTab === sub
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                        : 'border border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {sub === 'visitorTypes' ? 'Visitor Categories' : sub}
                  </button>
                ))}
              </div>

              {/* Sites Configuration */}
              {masterTab === 'sites' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Sites & Buildings</h3>
                    <p className="text-xs text-gray-400 light:text-gray-500 mt-1 m-0">Define facilities, campus locations, and register their buildings.</p>
                  </div>
                  
                  <form onSubmit={handleAddSite} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Site Name" 
                      value={newSiteName} 
                      onChange={e => setNewSiteName(e.target.value)} 
                      required 
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                    <input 
                      type="text" 
                      placeholder="Site Location" 
                      value={newSiteLocation} 
                      onChange={e => setNewSiteLocation(e.target.value)} 
                      required 
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                    <Button type="submit" variant="primary">Add Site</Button>
                  </form>

                  <div className="space-y-3">
                    {sites.map(site => (
                      <div key={site.id} className="border border-white/10 light:border-gray-250 rounded-xl overflow-hidden bg-gray-900/10">
                        {editingSiteId === site.id ? (
                          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-900/60 light:bg-gray-100 border-b border-white/10 light:border-gray-200">
                            <input 
                              type="text" 
                              value={editSiteName} 
                              onChange={e => setEditingSiteName(e.target.value)} 
                              placeholder="Site Name"
                              className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-300 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs flex-1"
                            />
                            <input 
                              type="text" 
                              value={editSiteLocation} 
                              onChange={e => setEditingSiteLocation(e.target.value)} 
                              placeholder="Site Location"
                              className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-300 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs flex-1"
                            />
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" variant="primary" onClick={() => handleUpdateSite(site.id)}>Save</Button>
                              <Button size="sm" variant="secondary" onClick={() => setEditingSiteId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center bg-gray-900/40 light:bg-gray-50 p-4 border-b border-white/10 light:border-gray-200">
                            <div>
                              <strong className="text-sm text-white light:text-gray-900">{site.name} ({site.buildings?.length || 0} Buildings)</strong>
                              <span className="text-xs text-gray-500 block">{site.location}</span>
                              {site.buildings && site.buildings.length > 0 && (
                                <span className="text-[11px] text-indigo-400 light:text-indigo-650 block mt-1 font-semibold">
                                  Buildings: {site.buildings.map(b => b.name).join(', ')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                type="button" 
                                onClick={() => setExpandedSite(expandedSite === site.id ? null : site.id)}
                                className="text-xs text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                              >
                                {expandedSite === site.id ? 'Collapse Buildings' : 'Manage Buildings'}
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingSiteId(site.id);
                                  setEditingSiteName(site.name);
                                  setEditingSiteLocation(site.location || '');
                                }}
                                type="button"
                                className="text-gray-400 hover:text-white light:hover:text-gray-900 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteSite(site.id)}
                                type="button"
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}

                        {expandedSite === site.id && (
                          <div className="p-4 bg-gray-955/20 light:bg-gray-100/30 space-y-4">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="New Building Name" 
                                value={newBuildingName} 
                                onChange={e => setNewBuildingName(e.target.value)} 
                                className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 flex-1"
                              />
                              <Button variant="primary" size="sm" onClick={() => handleAddBuilding(site.id)}>Add Bldg</Button>
                            </div>
                            <div className="space-y-2">
                              {(!site.buildings || site.buildings.length === 0) ? (
                                <p className="text-xs text-gray-500 italic m-0">No buildings registered for this site.</p>
                              ) : (
                                site.buildings.map(bldg => (
                                  <div key={bldg.id} className="flex justify-between items-center bg-gray-900/25 light:bg-gray-100 p-2.5 rounded-lg border border-white/5 light:border-gray-200">
                                    {editingBuildingId === bldg.id ? (
                                      <div className="flex gap-2 items-center w-full">
                                        <input 
                                          type="text" 
                                          value={editBuildingName} 
                                          onChange={e => setEditingBuildingName(e.target.value)} 
                                          className="bg-gray-805 border border-white/10 light:border-gray-300 text-white light:text-gray-900 rounded px-2 py-1 text-xs flex-1 focus:outline-none"
                                        />
                                        <button onClick={() => handleUpdateBuilding(site.id, bldg.id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1">
                                          Save
                                        </button>
                                        <button onClick={() => setEditingBuildingId(null)} className="text-gray-400 hover:text-gray-300 p-1">
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-xs text-gray-300 light:text-gray-800">{bldg.name}</span>
                                        <div className="flex items-center gap-2.5">
                                          <button 
                                            onClick={() => {
                                              setEditingBuildingId(bldg.id);
                                              setEditingBuildingName(bldg.name);
                                            }}
                                            type="button"
                                            className="text-gray-400 hover:text-white light:hover:text-gray-900 transition-colors"
                                          >
                                            <Edit2 size={14} />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteBuilding(bldg.id)}
                                            type="button"
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Departments Configuration */}
              {masterTab === 'departments' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Departments</h3>
                    <p className="text-xs text-gray-400 light:text-gray-500 mt-1 m-0">Register internal departments and specify their respective HODs.</p>
                  </div>

                  <form onSubmit={handleAddDept} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input 
                      type="text" 
                      placeholder="Dept Name" 
                      value={newDeptName} 
                      onChange={e => setNewDeptName(e.target.value)} 
                      required 
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                    <input 
                      type="text" 
                      placeholder="HOD Name" 
                      value={newDeptHodName} 
                      onChange={e => setNewDeptHodName(e.target.value)} 
                      required 
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                    <input 
                      type="email" 
                      placeholder="HOD Email" 
                      value={newDeptHodEmail} 
                      onChange={e => setNewDeptHodEmail(e.target.value)} 
                      required 
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                    <Button type="submit" variant="primary">Add Dept</Button>
                  </form>

                  <div className="space-y-2">
                    {departments.map(dept => (
                      <div key={dept.id} className="bg-gray-900/30 light:bg-gray-50 border border-white/10 light:border-gray-200 p-4 rounded-xl">
                        {editingDeptId === dept.id ? (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-gray-400 font-semibold">Dept Name</label>
                                <input 
                                  type="text" 
                                  value={editDeptName} 
                                  onChange={e => setEditDeptName(e.target.value)} 
                                  className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-gray-400 font-semibold">HOD Name</label>
                                <input 
                                  type="text" 
                                  value={editDeptHodName} 
                                  onChange={e => setEditDeptHodName(e.target.value)} 
                                  className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-gray-400 font-semibold">HOD Email</label>
                                <input 
                                  type="email" 
                                  value={editDeptHodEmail} 
                                  onChange={e => setEditDeptHodEmail(e.target.value)} 
                                  className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="primary" onClick={() => handleUpdateDept(dept.id)}>Save</Button>
                              <Button size="sm" variant="secondary" onClick={() => setEditingDeptId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <strong className="text-sm text-white light:text-gray-900">{dept.name}</strong>
                              <span className="text-xs text-gray-500 block mt-0.5">HOD: {dept.hodName || 'Unassigned'} ({dept.hodEmail || 'No Email'})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  setEditingDeptId(dept.id);
                                  setEditDeptName(dept.name);
                                  setEditDeptHodName(dept.hodName || '');
                                  setEditDeptHodEmail(dept.hodEmail || '');
                                }}
                                type="button"
                                className="text-gray-400 hover:text-white light:hover:text-gray-900 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteDept(dept.id)}
                                type="button"
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accessories Configuration */}
              {masterTab === 'accessories' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Accessory Types</h3>
                    <p className="text-xs text-gray-400 light:text-gray-500 mt-1 m-0">Define catalog list of accessory categories for visitor assets registration.</p>
                  </div>

                  <form onSubmit={handleAddAcc} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Accessory Category Name" 
                      value={newAccName} 
                      onChange={e => setNewAccName(e.target.value)} 
                      required 
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                    <input 
                      type="text" 
                      placeholder="Optional Description" 
                      value={newAccDesc} 
                      onChange={e => setNewAccDesc(e.target.value)} 
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                    <Button type="submit" variant="primary">Add Accessory</Button>
                  </form>

                  <div className="space-y-2">
                    {accessories.map(acc => (
                      <div key={acc.id} className="bg-gray-900/30 light:bg-gray-50 border border-white/10 light:border-gray-200 p-4 rounded-xl">
                        {editingAccId === acc.id ? (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-gray-400 font-semibold">Accessory Name</label>
                                <input 
                                  type="text" 
                                  value={editAccName} 
                                  onChange={e => setEditAccName(e.target.value)} 
                                  className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-gray-400 font-semibold">Description</label>
                                <input 
                                  type="text" 
                                  value={editAccDesc} 
                                  onChange={e => setEditAccDesc(e.target.value)} 
                                  className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="primary" onClick={() => handleUpdateAcc(acc.id)}>Save</Button>
                              <Button size="sm" variant="secondary" onClick={() => setEditingAccId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <strong className="text-sm text-white light:text-gray-900">{acc.name}</strong>
                              <span className="text-xs text-gray-500 block mt-0.5">{acc.desc || 'No description provided'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  setEditingAccId(acc.id);
                                  setEditAccName(acc.name);
                                  setEditAccDesc(acc.desc || '');
                                }}
                                type="button"
                                className="text-gray-400 hover:text-white light:hover:text-gray-900 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteAcc(acc.id)}
                                type="button"
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visitor Categories Configuration */}
              {masterTab === 'visitorTypes' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Visitor Categories</h3>
                    <p className="text-xs text-gray-400 light:text-gray-500 mt-1 m-0">Register visitor types and pair them with dynamic banner colors.</p>
                  </div>

                  <form onSubmit={handleAddVisitorType} className="grid grid-cols-1 gap-4 bg-gray-900/20 light:bg-gray-50/50 p-4 rounded-xl border border-white/5 light:border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Category Name</label>
                        <input 
                          type="text" 
                          placeholder="Category Name (e.g. Guest)" 
                          value={newTypeName} 
                          onChange={e => setNewTypeName(e.target.value)} 
                          required 
                          className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Select Color Palette</label>
                        <div className="flex flex-wrap items-center gap-1.5 bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 p-2 rounded-lg">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewTypeColor(color)}
                              className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${
                                newTypeColor.toLowerCase() === color.toLowerCase() ? 'border-white ring-1 ring-indigo-500' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                          <div className="w-[1px] h-5 bg-white/20 light:bg-gray-300 mx-0.5" />
                          <input 
                            type="color" 
                            value={newTypeColor} 
                            onChange={e => setNewTypeColor(e.target.value)} 
                            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="newTypeSkipPhoto"
                        checked={newTypeSkipPhoto}
                        onChange={e => setNewTypeSkipPhoto(e.target.checked)}
                        className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500/40 bg-gray-800"
                      />
                      <label htmlFor="newTypeSkipPhoto" className="text-xs text-gray-300 light:text-gray-600 font-semibold cursor-pointer">
                        Skip Photo Capture (VIP Protocol)
                      </label>
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button type="submit" variant="primary">Add Category</Button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    {visitorTypes.map(type => (
                      <div key={type.id} className="bg-gray-900/30 light:bg-gray-50 border border-white/10 light:border-gray-200 p-4 rounded-xl">
                        {editingVisitorTypeId === type.id ? (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-gray-400 font-semibold">Category Name</label>
                                <input 
                                  type="text" 
                                  value={editVisitorTypeName} 
                                  onChange={e => setEditVisitorTypeName(e.target.value)} 
                                  className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-gray-400 font-semibold">Description</label>
                                <input 
                                  type="text" 
                                  value={editVisitorTypeDesc} 
                                  onChange={e => setEditVisitorTypeDesc(e.target.value)} 
                                  className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="flex flex-col gap-1 sm:col-span-2">
                                <label className="text-[10px] uppercase text-gray-400 font-semibold">Banner Color</label>
                                <div className="flex flex-wrap items-center gap-1.5 bg-gray-800 light:bg-white border border-white/10 light:border-gray-200 p-2 rounded-lg">
                                  {PRESET_COLORS.map(color => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => setEditVisitorTypeColor(color)}
                                      className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${
                                        editVisitorTypeColor.toLowerCase() === color.toLowerCase() ? 'border-white ring-1 ring-indigo-500' : 'border-transparent'
                                      }`}
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                  <div className="w-[1px] h-5 bg-white/20 light:bg-gray-300 mx-0.5" />
                                  <input 
                                    type="color" 
                                    value={editVisitorTypeColor} 
                                    onChange={e => setEditVisitorTypeColor(e.target.value)} 
                                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:col-span-2 mt-1">
                                <input 
                                  type="checkbox"
                                  id={`editTypeSkipPhoto-${type.id}`}
                                  checked={editVisitorTypeSkipPhoto}
                                  onChange={e => setEditingVisitorTypeSkipPhoto(e.target.checked)}
                                  className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500/40 bg-gray-800"
                                />
                                <label htmlFor={`editTypeSkipPhoto-${type.id}`} className="text-xs text-gray-300 light:text-gray-600 font-semibold cursor-pointer">
                                  Skip Photo Capture (VIP Protocol)
                                </label>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="primary" onClick={() => handleUpdateVisitorType(type.id)}>Save</Button>
                              <Button size="sm" variant="secondary" onClick={() => setEditingVisitorTypeId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-5 h-5 rounded-full border border-white/10 shadow-sm shrink-0" 
                                style={{ backgroundColor: type.banner_color || '#10b981' }} 
                              />
                              <div>
                                <strong className="text-sm text-white light:text-gray-900">{type.name}</strong>
                                {type.description && <span className="text-xs text-gray-400 block mt-0.5">{type.description}</span>}
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Color: {type.banner_color}</span>
                                  {type.skip_photo_capture && (
                                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-semibold uppercase font-mono">VIP (No Photo)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  setEditingVisitorTypeId(type.id);
                                  setEditVisitorTypeName(type.name);
                                  setEditVisitorTypeColor(type.banner_color || '#10B981');
                                  setEditVisitorTypeDesc(type.description || '');
                                  setEditingVisitorTypeSkipPhoto(!!type.skip_photo_capture);
                                }}
                                type="button"
                                className="text-gray-400 hover:text-white light:hover:text-gray-900 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteVisitorType(type.id)}
                                type="button"
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GLOBAL BLACKLIST */}
          {activeTab === 'blacklist' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Global Blacklist</h3>
                <p className="text-xs text-gray-400 light:text-gray-500 mt-1 m-0">Restricted personnel directory triggers immediate alert intercepts during gate entry forms registration.</p>
              </div>

              <form onSubmit={handleAddBlacklist} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input 
                  type="text" 
                  placeholder="Visitor Name" 
                  value={newBlackName} 
                  onChange={e => setNewBlackName(e.target.value)} 
                  required 
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                />
                <input 
                  type="text" 
                  placeholder="Phone" 
                  value={newBlackPhone} 
                  onChange={e => setNewBlackPhone(e.target.value)} 
                  required 
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                />
                <input 
                  type="text" 
                  placeholder="Reason" 
                  value={newBlackReason} 
                  onChange={e => setNewBlackReason(e.target.value)} 
                  required 
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                />
                <Button type="submit" variant="primary">Add Blacklist</Button>
              </form>

              <div className="space-y-2">
                {blacklist.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-6">No restricted records configured in the database blacklist.</p>
                ) : (
                  blacklist.map(item => (
                    <div key={item.id} className="bg-red-500/5 border border-red-500/25 p-4 rounded-xl">
                      {editingBlackId === item.id ? (
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase text-red-400/80 font-semibold">Visitor Name</label>
                              <input 
                                type="text" 
                                value={editBlackName} 
                                onChange={e => setEditBlackName(e.target.value)} 
                                className="bg-gray-800/80 light:bg-white border border-red-500/30 light:border-gray-300 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase text-red-400/80 font-semibold">Phone</label>
                              <input 
                                type="text" 
                                value={editBlackPhone} 
                                onChange={e => setEditBlackPhone(e.target.value)} 
                                className="bg-gray-800/80 light:bg-white border border-red-500/30 light:border-gray-300 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase text-red-400/80 font-semibold">Reason</label>
                              <input 
                                type="text" 
                                value={editBlackReason} 
                                onChange={e => setEditBlackReason(e.target.value)} 
                                className="bg-gray-800/80 light:bg-white border border-red-500/30 light:border-gray-300 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="primary" onClick={() => handleUpdateBlacklist(item.id)}>Save</Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingBlackId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <strong className="text-sm text-red-400">{item.name}</strong>
                            <span className="text-xs text-gray-400 block font-medium">Reason: {item.reason} • Phone: {item.phone}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => {
                                setEditingBlackId(item.id);
                                setEditBlackName(item.name);
                                setEditBlackPhone(item.phone);
                                setEditBlackReason(item.reason || '');
                              }}
                              type="button"
                              className="text-gray-400 hover:text-white light:hover:text-gray-900 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteBlacklist(item.id)}
                              type="button"
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BRANDING & APPEARANCE */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Branding & Appearance</h3>
                <p className="text-xs text-gray-400 light:text-gray-500 mt-1 m-0">Override details, tagline, and logo properties used on the Top Bar, Login screen, and PDF exports.</p>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Company Name</label>
                    <input 
                      type="text" 
                      value={branding.company_name}
                      onChange={e => setBranding(prev => ({ ...prev, company_name: e.target.value }))}
                      required
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Company Tagline</label>
                    <input 
                      type="text" 
                      value={branding.tagline}
                      onChange={e => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                      required
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Logo Initial</label>
                    <input 
                      type="text" 
                      value={branding.logo_initial}
                      onChange={e => setBranding(prev => ({ ...prev, logo_initial: e.target.value }))}
                      maxLength={2}
                      required
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Logo Image URL</label>
                    <input 
                      type="text" 
                      placeholder="Optional URL path"
                      value={branding.logo_url}
                      onChange={e => setBranding(prev => ({ ...prev, logo_url: e.target.value }))}
                      className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Support Contact Info</label>
                  <input 
                    type="text" 
                    value={branding.contact_info}
                    onChange={e => setBranding(prev => ({ ...prev, contact_info: e.target.value }))}
                    required
                    className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary">Save Branding Changes</Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS CONFIG */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Notification Settings</h3>
                <p className="text-xs text-gray-400 light:text-gray-500 mt-1 m-0">Configure alerts sent to Hosts and overstay security logs threshold limits.</p>
              </div>

              <form onSubmit={handleSaveNotifications} className="space-y-5">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.email_enabled}
                      onChange={e => setNotifications(prev => ({ ...prev, email_enabled: e.target.checked }))}
                      className="w-4.5 h-4.5 rounded bg-gray-800/60 light:bg-white border-white/10 light:border-gray-200 text-indigo-500 focus:ring-indigo-500 accent-indigo-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white light:text-gray-900">Email Notifications</span>
                      <span className="text-xs text-gray-500">Auto-email department heads and hosts upon visitor check-in/checkout.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.sms_enabled}
                      onChange={e => setNotifications(prev => ({ ...prev, sms_enabled: e.target.checked }))}
                      className="w-4.5 h-4.5 rounded bg-gray-800/60 light:bg-white border-white/10 light:border-gray-200 text-indigo-500 focus:ring-indigo-500 accent-indigo-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white light:text-gray-900">SMS Notification Integration</span>
                      <span className="text-xs text-gray-500">Send short check-in codes to visitor phones.</span>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider text-gray-400 light:text-gray-500 font-semibold">Overstay Alert Threshold (Minutes)</label>
                  <input 
                    type="number" 
                    value={notifications.alert_threshold_mins}
                    onChange={e => setNotifications(prev => ({ ...prev, alert_threshold_mins: parseInt(e.target.value) || 0 }))}
                    required
                    className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full sm:w-[150px]"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary">Save Preferences</Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: USERS & ROLES */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">Users & Roles</h3>
                <p className="text-xs text-gray-400 light:text-gray-500 mt-1 m-0 mb-3">Manage operator accounts allowed to log into the command center and gate control terminals.</p>
              </div>

              {/* Role Permissions Reference Table */}
              <div className="glass-panel p-4 border border-white/10 rounded-xl bg-indigo-950/10 light:bg-indigo-50/20 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-white/5 light:bg-white border border-white/5 light:border-gray-250/50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <strong className="text-xs text-white light:text-gray-900 font-bold uppercase tracking-wider">Administrator (Admin)</strong>
                  </div>
                  <p className="text-[11px] text-gray-400 light:text-gray-500 leading-normal m-0">
                    Full read-write access to all sections including Global HQ, Reports, System Branding, Notifications, and Operator Accounts Management.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 light:bg-white border border-white/5 light:border-gray-250/50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <strong className="text-xs text-white light:text-gray-900 font-bold uppercase tracking-wider">Security Guard (Guard)</strong>
                  </div>
                  <p className="text-[11px] text-gray-400 light:text-gray-500 leading-normal m-0">
                    Front-desk terminal operations. Access to Gate Entry check-ins/returns, Gate Exit check-outs, Local Feed dashboard, and Reports. Restricted from Settings and Global HQ.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 light:bg-white border border-white/5 light:border-gray-250/50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <strong className="text-xs text-white light:text-gray-900 font-bold uppercase tracking-wider">Department Staff (Host)</strong>
                  </div>
                  <p className="text-[11px] text-gray-400 light:text-gray-500 leading-normal m-0">
                    Host employee portal. Allowed only to pre-register/invite visitors and view a filtered log of their own visitors. Restrictive read-only access.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={newUsername} 
                  onChange={e => setNewUsername(e.target.value)} 
                  required 
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={newFullName} 
                  onChange={e => setNewFullName(e.target.value)} 
                  required 
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={newUserPassword} 
                  onChange={e => setNewUserPassword(e.target.value)} 
                  required 
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                />
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="bg-gray-800/60 light:bg-white border border-white/10 light:border-gray-200 text-white light:text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full"
                >
                  <option value="Guard">Security Guard</option>
                  <option value="Admin">Administrator</option>
                  <option value="Host">Department Staff</option>
                </select>
                <Button type="submit" variant="primary">Add User</Button>
              </form>

              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="bg-gray-900/30 light:bg-gray-50 border border-white/10 light:border-gray-200 p-4 rounded-xl">
                    {editingUserId === user.id ? (
                      <div className="flex flex-col gap-3 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-gray-400 font-semibold">Username</label>
                            <input 
                              type="text" 
                              value={editUserUsername} 
                              onChange={e => setEditingUserUsername(e.target.value)} 
                              className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-gray-400 font-semibold">Full Name</label>
                            <input 
                              type="text" 
                              value={editUserFullName} 
                              onChange={e => setEditingUserFullName(e.target.value)} 
                              className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-gray-400 font-semibold">Password (Optional)</label>
                            <input 
                              type="password" 
                              value={editUserPassword} 
                              onChange={e => setEditingUserPassword(e.target.value)} 
                              placeholder="Leave blank to keep same"
                              className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none placeholder:text-gray-400"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-gray-400 font-semibold">Role</label>
                            <select
                              value={editUserRole}
                              onChange={e => setEditingUserRole(e.target.value)}
                              className="bg-gray-800 light:bg-white border border-white/10 light:border-gray-305 text-white light:text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                            >
                              <option value="Guard">Security Guard</option>
                              <option value="Admin">Administrator</option>
                              <option value="Host">Department Staff</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="primary" onClick={() => handleUpdateUser(user.id)}>Save</Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditingUserId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <strong className="text-sm text-white light:text-gray-900">{user.full_name}</strong>
                          <span className="text-xs text-gray-500 block mt-0.5">User: {user.username} • Role: {user.role}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              setEditingUserId(user.id);
                              setEditingUserUsername(user.username);
                              setEditingUserFullName(user.full_name || user.name);
                              setEditingUserRole(user.role);
                              setEditingUserPassword('');
                            }}
                            type="button"
                            className="text-gray-400 hover:text-white light:hover:text-gray-900 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            type="button"
                            className="text-red-400 hover:text-red-300 transition-colors"
                            disabled={users.length <= 1} // Prevent deleting last remaining user
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;