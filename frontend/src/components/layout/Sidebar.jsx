import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, LogOut, LayoutDashboard, Settings, Activity, ClipboardList } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
  const { logout, sidebarCollapsed, currentUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Gate Entry', path: '/gate/entry', icon: LogIn, section: 'Operations', roles: ['Admin', 'Guard', 'Host'] },
    { name: 'Gate Exit', path: '/gate/exit', icon: LogOut, section: 'Operations', roles: ['Admin', 'Guard'] },
    { name: 'Local Feed', path: '/dashboard/local', icon: Activity, section: 'Operations', roles: ['Admin', 'Guard'] },
    { name: 'Global HQ', path: '/dashboard/global', icon: LayoutDashboard, section: 'Management', roles: ['Admin'] },
    { name: 'Reports', path: '/reports', icon: ClipboardList, section: 'Management', roles: ['Admin', 'Guard', 'Host'] },
    { name: 'Settings', path: '/settings', icon: Settings, section: 'Management', roles: ['Admin'] },
  ];

  const userRole = currentUser?.role || 'Guard';
  const allowedItems = navItems.filter(item => item.roles.includes(userRole));

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className={`${
      sidebarCollapsed ? 'w-20' : 'w-64'
    } bg-[#050505] border-r border-white/10 flex flex-col h-screen shrink-0 text-white light:bg-white light:border-gray-200 light:text-gray-900 transition-all duration-200`}>
      {/* Brand */}
      <div className={`flex items-center gap-3 py-5 border-b border-white/5 light:border-gray-100 shrink-0 ${
        sidebarCollapsed ? 'justify-center px-0' : 'px-6'
      }`}>
        <ShieldCheck size={28} className="text-indigo-500 shrink-0" />
        {!sidebarCollapsed && (
          <h2 className="text-xl font-bold tracking-tight m-0 font-heading bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent light:from-gray-900 light:to-gray-600 animate-in fade-in duration-200">
            CampusGuard
          </h2>
        )}
      </div>
      
      {/* Navigation */}
      <nav className={`flex-1 py-6 space-y-7 overflow-y-auto ${
        sidebarCollapsed ? 'px-2' : 'px-4'
      }`}>
        {/* Operations Section */}
        {allowedItems.some(item => item.section === 'Operations') && (
          <div className="space-y-1.5">
            {!sidebarCollapsed ? (
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-gray-500 light:text-gray-400 block mb-3">
                Operations
              </span>
            ) : (
              <div className="border-t border-white/5 light:border-gray-100 my-4 first:mt-0"></div>
            )}
            {allowedItems.filter(item => item.section === 'Operations').map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                title={sidebarCollapsed ? item.name : undefined}
                className={({ isActive }) => `flex items-center rounded-lg text-sm font-semibold transition-all duration-200 select-none ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </div>
        )}
        
        {/* Management Section */}
        {allowedItems.some(item => item.section === 'Management') && (
          <div className="space-y-1.5">
            {!sidebarCollapsed ? (
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-gray-500 light:text-gray-400 block mb-3">
                Management
              </span>
            ) : (
              <div className="border-t border-white/5 light:border-gray-100 my-4"></div>
            )}
            {allowedItems.filter(item => item.section === 'Management').map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                title={sidebarCollapsed ? item.name : undefined}
                className={({ isActive }) => `flex items-center rounded-lg text-sm font-semibold transition-all duration-200 select-none ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
      
      {/* Footer Profile & Logout */}
      <div className={`border-t border-white/5 light:border-gray-100 flex flex-col shrink-0 ${
        sidebarCollapsed ? 'p-2 gap-2' : 'p-4 gap-3'
      }`}>
        <div className={`flex items-center ${
          sidebarCollapsed ? 'justify-center px-0 py-1' : 'gap-3 px-2 py-1.5'
        }`}>
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
            {getInitials(currentUser?.name)}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <span className="text-sm font-bold text-white light:text-gray-900 truncate">{currentUser?.name || 'User'}</span>
              <span className="text-[10px] text-gray-500 light:text-gray-400 truncate">{currentUser?.role || 'Operator'}</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleLogout}
          type="button"
          title={sidebarCollapsed ? "Log Out" : undefined}
          className={`flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all duration-200 ${
            sidebarCollapsed ? 'w-9 h-9 rounded-full mx-auto' : 'gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-bold'
          }`}
        >
          <LogOut size={14} className="shrink-0" />
          {!sidebarCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;