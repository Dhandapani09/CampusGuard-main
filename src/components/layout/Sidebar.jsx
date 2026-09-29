import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, LogIn, LogOut, LayoutDashboard, Settings, Users, Activity } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { name: 'Gate Entry', path: '/gate/entry', icon: LogIn },
    { name: 'Gate Exit', path: '/gate/exit', icon: LogOut },
    { name: 'Local Feed', path: '/dashboard/local', icon: Activity },
    { name: 'Global HQ', path: '/dashboard/global', icon: LayoutDashboard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <ShieldCheck size={28} className="brand-icon" />
        <h2>CampusGuard</h2>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">Operations</span>
          {navItems.slice(0, 3).map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
        
        <div className="nav-section">
          <span className="nav-label">Management</span>
          {navItems.slice(3).map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">SG</div>
          <div className="user-info">
            <span className="user-name">Security Guard</span>
            
<truncated 146 bytes