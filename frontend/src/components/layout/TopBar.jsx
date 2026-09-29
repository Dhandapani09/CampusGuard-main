import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, Search, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const TopBar = () => {
  const { branding, theme, toggleTheme, toggleSidebar } = useAppContext();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key === 'k') || (e.altKey && e.key === 'K')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 h-[60px] shrink-0 border-b border-white/10 light:border-gray-200 bg-[#0a0a0a]/80 light:bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Toggle */}
        <button 
          onClick={toggleSidebar}
          type="button"
          className="w-9 h-9 rounded-lg border border-white/10 light:border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 light:text-gray-500 light:hover:text-gray-900 light:hover:bg-gray-100 transition-all duration-200"
          title="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Company Logo & Name for Desktop */}
        <div className="hidden md:flex items-center gap-2 border-r border-white/10 light:border-gray-200 pr-4 mr-2">
          {branding?.logo_url ? (
            <img src={branding.logo_url} alt="Logo" className="w-6 h-6 object-contain rounded" />
          ) : (
            <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {branding?.logo_initial || 'CG'}
            </div>
          )}
          <span className="text-sm font-bold text-white light:text-gray-900 truncate max-w-[120px]" title={branding?.company_name}>
            {branding?.company_name || 'CampusGuard'}
          </span>
        </div>

        {/* Mobile brand logo (visible only on small screens) */}
        <div className="md:hidden flex items-center mr-2">
          {branding?.logo_url ? (
            <img src={branding.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded" />
          ) : (
            <div className="w-8 h-8 rounded bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
              {branding?.logo_initial || 'CG'}
            </div>
          )}
        </div>

        <div className="relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            ref={inputRef}
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
              }
            }}
            placeholder="Quick search visitors (Alt+K)..." 
            className="w-40 sm:w-72 bg-gray-900/60 light:bg-gray-100 border border-white/10 light:border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm text-white light:text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-sm font-semibold font-mono text-gray-300 light:text-gray-600">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        <button 
          onClick={toggleTheme} 
          type="button"
          className="w-9 h-9 rounded-lg border border-white/10 light:border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 light:text-gray-500 light:hover:text-gray-900 light:hover:bg-gray-100 transition-all duration-200"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        
        <button 
          type="button"
          className="relative w-9 h-9 rounded-lg border border-white/10 light:border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 light:text-gray-500 light:hover:text-gray-900 light:hover:bg-gray-100 transition-all duration-200"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;