import React from 'react';
import { User, Briefcase, Users, AlertCircle } from 'lucide-react';

const GateBanner = ({ visitorType, bannerColor }) => {
  const getBannerConfig = () => {
    const color = bannerColor || (
      visitorType === 'Customer' ? 'red' :
      visitorType === 'Vendor' ? 'blue' :
      visitorType === 'Guest' ? 'green' :
      visitorType === 'TempEmployee' ? 'yellow' : 'default'
    );

    const isHex = typeof color === 'string' && color.startsWith('#');

    if (isHex) {
      return {
        style: {
          backgroundColor: `${color}15`,
          borderColor: `${color}35`,
          color: color
        },
        iconStyle: {
          color: color
        },
        icon: User,
        label: visitorType || 'Custom Visitor Type',
        desc: 'Custom Entry Pathway'
      };
    }

    switch (color) {
      case 'red':
        return { 
          classes: 'bg-red-500/10 border-red-500/20 text-red-400 light:bg-red-50 light:border-red-200 light:text-red-700', 
          iconClasses: 'text-red-400 light:text-red-650',
          icon: User, 
          label: visitorType || 'Customer / VIP', 
          desc: 'Priority Entry — VIP Protocol',
          style: {},
          iconStyle: {}
        };
      case 'blue':
        return { 
          classes: 'bg-blue-500/10 border-blue-500/20 text-blue-400 light:bg-blue-50 light:border-blue-200 light:text-blue-700', 
          iconClasses: 'text-blue-400 light:text-blue-650',
          icon: Briefcase, 
          label: visitorType || 'Vendor / Contractor', 
          desc: 'Standard Entry — Assets Tracking Required',
          style: {},
          iconStyle: {}
        };
      case 'green':
        return { 
          classes: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 light:bg-emerald-50 light:border-emerald-200 light:text-emerald-700', 
          iconClasses: 'text-emerald-400 light:text-emerald-650',
          icon: Users, 
          label: visitorType || 'General Guest', 
          desc: 'Standard Entry',
          style: {},
          iconStyle: {}
        };
      case 'yellow':
        return { 
          classes: 'bg-amber-500/10 border-amber-500/20 text-amber-500 light:bg-amber-50 light:border-amber-200 light:text-amber-700', 
          iconClasses: 'text-amber-500 light:text-amber-650',
          icon: AlertCircle, 
          label: visitorType === 'TempEmployee' ? 'Temp Employee' : (visitorType || 'Temporary Badge'), 
          desc: 'Forgotten ID Protocol — Auto Notify Department Head',
          style: {},
          iconStyle: {}
        };
      default:
        return { 
          classes: 'bg-gray-800 border-white/10 text-gray-400 light:bg-gray-100 light:border-gray-200 light:text-gray-600', 
          iconClasses: 'text-gray-500',
          icon: Users, 
          label: 'Select Visitor Type', 
          desc: 'Choose a category to begin check-in',
          style: {},
          iconStyle: {}
        };
    }
  };

  const config = getBannerConfig();
  const Icon = config.icon;

  return (
    <div 
      className={`flex items-center gap-5 p-5 border rounded-xl transition-all duration-200 ${config.classes || ''}`}
      style={config.style}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-900/60 shadow-sm text-inherit shrink-0">
        <Icon className={config.iconClasses || ''} style={config.iconStyle} size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold m-0">{config.label}</h3>
        <p className="text-sm opacity-90 m-0">{config.desc}</p>
      </div>
    </div>
  );
};

export default GateBanner;