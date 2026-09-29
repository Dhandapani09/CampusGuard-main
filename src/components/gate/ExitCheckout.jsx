import React, { useState } from 'react';
import { useVisitorContext } from '../../context/VisitorContext';
import SearchInput from '../shared/SearchInput';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import { LogOut, CheckCircle } from 'lucide-react';
import './ExitCheckout.css';

const ExitCheckout = () => {
  const { activeVisitors, checkOut } = useVisitorContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  const filteredVisitors = activeVisitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone.includes(searchTerm)
  );

  const handleCheckout = (id, name) => {
    checkOut(id);
    setCheckoutSuccess(name);
    setTimeout(() => setCheckoutSuccess(null), 3000);
  };

  return (
    <div className="exit-checkout glass-panel card">
      <div className="exit-header">
        <h3>Quick Checkout</h3>
        <p>Search by name, phone, or Pass ID to log a visitor's departure.</p>
        <SearchInput 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Scan Pass ID or search name..." 
        />
      </div>

      {checkoutSuccess && (
        <div className="checkout-success-banner">
          <CheckCircle size={20} />
          <span>Successfully checked out <strong>{checkoutSuccess}</strong>.</span>
        </div>
      )}

      <div className="active-list">
        {filteredVisitors.length === 0 ? (
          <div className="empty-state">
            <p>No active visitors match your search.</p>
          </div>
        ) : (
          filteredVisitors.map(visitor => (
            <div key={visitor.id} className="visitor-row">
              <div className="visitor-info-compact">
                {visitor.photo ? (
                  <img src={visitor.photo} alt={visitor.name} cla
<truncated 1141 bytes