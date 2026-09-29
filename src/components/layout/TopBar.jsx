import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Search } from 'lucide-react';
import './TopBar.css';

const TopBar = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="topbar glass-panel">
      <div className="topbar-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Quick search visitors (Alt+K)..." />
      </div>
      
      <div className="topbar-actions">
        <div className="clock">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="badge-dot"></span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;