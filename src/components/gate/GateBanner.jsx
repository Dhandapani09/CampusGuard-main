import React from 'react';
import { User, Briefcase, Users, AlertCircle } from 'lucide-react';
import './GateBanner.css';

const GateBanner = ({ visitorType }) => {
  const getBannerConfig = () => {
    switch (visitorType) {
      case 'Customer':
        return { 
          className: 'banner-customer', 
          icon: User, 
          label: 'Customer / VIP', 
          desc: 'Priority Entry — VIP Protocol' 
        };
      case 'Vendor':
        return { 
          className: 'banner-vendor', 
          icon: Briefcase, 
          label: 'Vendor / Contractor', 
          desc: 'Standard Entry — Assets Tracking Required' 
        };
      case 'Guest':
        return { 
          className: 'banner-guest', 
          icon: Users, 
          label: 'General Guest', 
          desc: 'Standard Entry' 
        };
      case 'TempEmployee':
        return { 
          className: 'banner-temp', 
          icon: AlertCircle, 
          label: 'Temp Employee', 
          desc: 'Forgotten ID Protocol — Auto Notify Department Head' 
        };
      default:
        return { 
          className: 'banner-default', 
          icon: Users, 
          label: 'Select Visitor Type', 
          desc: 'Choose a category to begin check-in' 
        };
    }
  };

  const config = getBannerConfig();
  const Icon = config.icon;

  return (
    <div className={`gate-banner ${config.className}`}>
      <div className="banner-icon-wrapper">
        <Icon size={24} />
      </div>
      <div className="banner-content">
        <h3>{config.label}</h3>
        <p>{config.desc}</p>
      </div>
    </div>
  );
};

export default GateBanner;