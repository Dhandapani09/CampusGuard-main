import React, { useState } from 'react';
import GateBanner from './GateBanner';
import WebcamCapture from './WebcamCapture';
import AICheckPanel from '../ai/AICheckPanel';
import Button from '../shared/Button';
import './VisitorForm.css';

const VisitorForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    type: 'Guest',
    name: '',
    phone: '',
    comingFrom: '',
    purpose: '',
    host: '',
    idType: 'Driver License',
    idNumber: '',
    photo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = (image) => {
    setFormData(prev => ({ ...prev, photo: image }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <form className="visitor-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Visitor Type</h3>
        <div className="type-selector">
          {['Customer', 'Vendor', 'Guest', 'TempEmployee'].map(type => (
            <label key={type} className={`type-radio ${formData.type === type ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="type" 
                value={type} 
                checked={formData.type === type} 
                onChange={handleChange} 
              />
              {type === 'TempEmployee' ? 'Temp Employee' : type}
            </label>
          ))}
        </div>
      </div>

      <GateBanner visitorType={formData.type} />

      <div className="form-grid">
        <div className="form-col">
          <div className="form-section">
            <h3>Personal Details</h3>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div cla
<truncated 2903 bytes