import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import './PassPreview.css';

const PassPreview = ({ visitorData, onPrint }) => {
  if (!visitorData) return null;

  const { name, phone, type, purpose, comingFrom, host, photo, id } = visitorData;

  // Derive banner class from visitor type
  const getBannerClass = () => {
    switch (type) {
      case 'Customer': return 'pass-banner-customer';
      case 'Vendor': return 'pass-banner-vendor';
      case 'Guest': return 'pass-banner-guest';
      case 'TempEmployee': return 'pass-banner-temp';
      default: return 'pass-banner-guest';
    }
  };

  return (
    <div className="pass-preview-wrapper">
      <div className="pass-card" id="printable-pass">
        <div className={`pass-header ${getBannerClass()}`}>
          <h2>CampusGuard</h2>
          <span>{type.replace('TempEmployee', 'Temp Employee')} Pass</span>
        </div>
        
        <div className="pass-body">
          <div className="pass-photo-section">
            {photo ? (
              <img src={photo} alt="Visitor" className="pass-photo" />
            ) : (
              <div className="pass-photo-placeholder">No Photo</div>
            )}
            <Badge type={type.toLowerCase()}>{type}</Badge>
          </div>
          
          <div className="pass-details">
            <h3 className="pass-name">{name}</h3>
            <p className="pass-org">{comingFrom || 'Independent'}</p>
            
            <div className="pass-meta-grid">
              <div className="meta-item">
                <span>Pass ID</span>
                <strong>{id || 'TBD'}</strong>
              </div>
              <div className="meta-item">
                <span>Date</span>
                <strong>{new Date().toLocaleDateString()}</strong>
              </div>
              <div className
<truncated 1000 bytes