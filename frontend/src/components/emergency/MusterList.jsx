import React from 'react';
import Modal from '../shared/Modal';
import { Download } from 'lucide-react';
import Button from '../shared/Button';

const MusterList = ({ onClose, visitors }) => {
  // Group visitors by organization or generic area for the drill
  const groupedVisitors = visitors.reduce((acc, visitor) => {
    const area = visitor.host || 'General Facility';
    if (!acc[area]) acc[area] = [];
    acc[area].push(visitor);
    return acc;
  }, {});

  return (
    <Modal isOpen={true} onClose={onClose} title="EMERGENCY MUSTER ROLL" maxWidth="700px">
      <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-dashed border-red-500/50 print:border-red-600">
        <div className="text-gray-300 light:text-gray-700 leading-relaxed print:text-black">
          <strong>Time Triggered:</strong> {new Date().toLocaleTimeString()}<br/>
          <strong>Total Active Personnel:</strong> {visitors.length}
        </div>
        <div className="print:hidden">
          <Button variant="secondary" icon={Download} onClick={() => window.print()}>
            Export PDF
          </Button>
        </div>
      </div>

      <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-2 print:max-h-none print:overflow-visible">
        {Object.keys(groupedVisitors).length === 0 ? (
          <p className="text-gray-400 light:text-gray-600 print:text-black">No active visitors to muster.</p>
        ) : (
          Object.entries(groupedVisitors).map(([area, list]) => (
            <div key={area} className="space-y-3">
              <h4 className="text-indigo-400 light:text-indigo-600 font-bold tracking-wider text-sm uppercase print:text-indigo-800">
                {area} ({list.length})
              </h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 light:border-gray-200 print:border-black">
                    <th className="text-center w-12 py-2 px-3 text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider print:text-black">Check</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider print:text-black">Name</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider print:text-black">ID</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider print:text-black">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(v => (
                    <tr key={v.id} className="border-b border-white/5 light:border-gray-100 hover:bg-white/5 light:hover:bg-gray-55/10 print:border-black">
                      <td className="text-center py-2.5 px-3">
                        <input 
                          type="checkbox" 
                          className="w-4.5 h-4.5 cursor-pointer rounded border-white/20 bg-gray-800/40 text-emerald-500 focus:ring-emerald-500/30 accent-emerald-500 print:text-black print:accent-black" 
                        />
                      </td>
                      <td className="py-2.5 px-3 text-sm text-gray-200 light:text-gray-800 font-medium print:text-black">{v.name}</td>
                      <td className="py-2.5 px-3 text-sm text-gray-400 light:text-gray-500 font-mono print:text-black">{v.id}</td>
                      <td className="py-2.5 px-3 text-sm text-gray-400 light:text-gray-500 print:text-black">
                        <span className="capitalize">{v.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default MusterList;