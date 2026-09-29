import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import { apiClient } from '../../services/apiClient';

const PassPreview = ({ visitorData, onPrint }) => {
  const [visitorTypes, setVisitorTypes] = useState([]);

  useEffect(() => {
    apiClient.getVisitorTypes().then(types => {
      if (types) setVisitorTypes(types);
    }).catch(err => console.error("Failed to load visitor types in PassPreview:", err));
  }, []);

  if (!visitorData) return null;

  const { name, phone, type, purpose, comingFrom, host, photo, id } = visitorData;

  const matchedType = visitorTypes.find(t => t.name === type);
  const bannerColor = matchedType ? matchedType.banner_color : undefined;

  const getBannerStyles = () => {
    if (!bannerColor) {
      switch (type) {
        case 'Customer': return { backgroundColor: '#dc2626', color: '#ffffff' };
        case 'Vendor': return { backgroundColor: '#2563eb', color: '#ffffff' };
        case 'Guest': return { backgroundColor: '#059669', color: '#ffffff' };
        case 'TempEmployee': return { backgroundColor: '#f59e0b', color: '#000000' };
        default: return { backgroundColor: '#059669', color: '#ffffff' };
      }
    }
    if (bannerColor.startsWith('#')) {
      return { backgroundColor: bannerColor, color: '#ffffff' };
    }
    switch (bannerColor) {
      case 'red': return { backgroundColor: '#dc2626', color: '#ffffff' };
      case 'blue': return { backgroundColor: '#2563eb', color: '#ffffff' };
      case 'green': return { backgroundColor: '#059669', color: '#ffffff' };
      case 'yellow': return { backgroundColor: '#f59e0b', color: '#000000' };
      default: return { backgroundColor: '#059669', color: '#ffffff' };
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-[320px] bg-white text-gray-900 rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 print:shadow-none print:border-none print:absolute print:left-0 print:top-0" id="printable-pass">
        <div className="p-4 flex justify-between items-center" style={getBannerStyles()}>
          <h2 className="text-lg font-bold text-inherit m-0">CampusGuard</h2>
          <span className="text-xs font-semibold uppercase tracking-wide">{type.replace('TempEmployee', 'Temp Employee')} Pass</span>
        </div>
        
        <div className="p-6 flex gap-6 border-b-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center gap-3 w-[90px] shrink-0">
            {photo ? (
              <img src={photo} alt="Visitor" className="w-[90px] h-[90px] object-cover rounded-md border border-gray-200" />
            ) : (
              <div className="w-[90px] h-[90px] bg-gray-100 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-xs text-gray-500">No Photo</div>
            )}
            <Badge type={type.toLowerCase()}>{type}</Badge>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 m-0">{name}</h3>
            <p className="text-sm text-gray-500 mb-4 m-0">{comingFrom || 'Independent'}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Pass ID</span>
                <strong className="text-sm text-gray-900 font-mono">{id || 'TBD'}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Date</span>
                <strong className="text-sm text-gray-900">{new Date().toLocaleDateString()}</strong>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Host</span>
                <strong className="text-sm text-gray-900">{host || 'Unassigned'}</strong>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Purpose</span>
                <strong className="text-sm text-gray-900">{purpose || 'Meeting'}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 flex items-center gap-4">
          <div className="p-1 bg-white border border-gray-200 rounded shrink-0">
            <QRCodeSVG value={id || 'new-pass'} size={64} level="H" />
          </div>
          <div className="text-[10px] text-gray-500 leading-normal">
            <p className="m-0">Please wear this badge at all times.</p>
            <p className="m-0">Valid only on date of issue.</p>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-[320px] print:hidden">
        <Button variant="primary" icon={Printer} onClick={onPrint} fullWidth>
          Print Pass & Check In
        </Button>
      </div>
    </div>
  );
};

export default PassPreview;