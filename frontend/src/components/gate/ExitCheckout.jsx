import React, { useState } from 'react';
import { useVisitorContext } from '../../context/VisitorContext';
import SearchInput from '../shared/SearchInput';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import { LogOut, CheckCircle } from 'lucide-react';

const ExitCheckout = () => {
  const { activeVisitors, checkOut } = useVisitorContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  const filteredVisitors = activeVisitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone.includes(searchTerm)
  );

  const handleCheckout = (id, name, type = 'PERMANENT') => {
    checkOut(id, type);
    setCheckoutSuccess(`${name} (${type === 'TEMP' ? 'Temporary Out' : 'Permanent Out'})`);
    setTimeout(() => setCheckoutSuccess(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 backdrop-blur-xl bg-gray-900/60 border border-white/10 rounded-2xl shadow-2xl p-6 light:bg-white light:border-gray-200">
      <div className="flex flex-col gap-3 mb-4">
        <h3 className="text-xl font-semibold text-white m-0 light:text-gray-900">Quick Checkout</h3>
        <p className="text-sm text-gray-400 m-0 light:text-gray-600 font-medium">Search by name, phone, or Pass ID to log a visitor's departure.</p>
        <SearchInput 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Scan Pass ID or search name..." 
        />
      </div>

      {checkoutSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg animate-in fade-in duration-300">
          <CheckCircle size={20} className="shrink-0" />
          <span>Successfully checked out <strong>{checkoutSuccess}</strong>.</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredVisitors.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-gray-800/20 border border-dashed border-white/10 rounded-xl light:bg-gray-50 light:border-gray-200 light:text-gray-600">
            <p className="m-0 text-sm font-medium">No active visitors match your search.</p>
          </div>
        ) : (
          filteredVisitors.map(visitor => (
            <div key={visitor.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-800/40 border border-white/5 rounded-xl hover:border-indigo-500/50 light:bg-gray-50 light:border-gray-200 light:hover:border-indigo-500 transition-all duration-200 gap-4">
              <div className="flex items-center gap-4 flex-[2_2_0%]">
                {visitor.photo ? (
                  <img src={visitor.photo} alt={visitor.name} className="w-12 h-12 rounded-full object-cover border border-white/10 light:border-gray-200 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-lg light:bg-gray-200 light:text-gray-700 shrink-0">
                    {visitor.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col">
                  <h4 className="text-base font-semibold text-white m-0 light:text-gray-900">{visitor.name}</h4>
                  <span className="text-xs text-gray-400 light:text-gray-500">{visitor.comingFrom} • {visitor.id}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-1.5 flex-1">
                <Badge type={visitor.type.toLowerCase()}>{visitor.type.replace('TempEmployee', 'Temp')}</Badge>
                <span className="text-xs text-gray-500 light:text-gray-400 font-medium">
                  In: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="md:ml-8 w-full md:w-auto shrink-0 flex flex-wrap gap-2 items-center">
                <button 
                  type="button"
                  onClick={() => handleCheckout(visitor.id, visitor.name, 'TEMP')}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all duration-200"
                >
                  Temporary Exit
                </button>
                <button 
                  type="button"
                  onClick={() => handleCheckout(visitor.id, visitor.name, 'PERMANENT')}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all duration-200"
                >
                  Permanent Exit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExitCheckout;