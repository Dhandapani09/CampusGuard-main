import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [branding, setBranding] = useState({
    company_name: 'CampusGuard',
    logo_url: '',
    tagline: 'Secure. Smart. Seamless.',
    logo_initial: 'CG',
    contact_info: 'security@campusguard.local'
  });
  const [users, setUsers] = useState([]);

  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );

  // Fetch branding configuration on load
  const reloadBranding = async () => {
    try {
      const data = await apiClient.getBranding();
      if (data) setBranding(data);
    } catch (e) {
      console.error('Failed to load branding in context:', e);
    }
  };

  const reloadUsers = async () => {
    try {
      const data = await apiClient.getUsers();
      if (data) setUsers(data);
    } catch (e) {
      console.error('Failed to load users in context:', e);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    reloadBranding();
    if (isLoggedIn) {
      reloadUsers();
    }
  }, [isLoggedIn]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = async (username, password) => {
    try {
      const data = await apiClient.loginOperator(username, password);
      if (data && (data.status === 'success' || data.token)) {
        const tokenVal = data.token || `mock-token-${data.user?.id || 'session'}`;
        localStorage.setItem('token', tokenVal);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login failed:', e);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <AppContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isLoggedIn, 
      login, 
      logout, 
      branding, 
      reloadBranding,
      users,
      reloadUsers,
      sidebarCollapsed,
      toggleSidebar,
      currentUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
