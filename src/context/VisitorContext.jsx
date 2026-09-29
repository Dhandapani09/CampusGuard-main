import React, { createContext, useContext, useState, useEffect } from 'react';

const VisitorContext = createContext();

export const VisitorProvider = ({ children }) => {
  const [activeVisitors, setActiveVisitors] = useState(() => {
    const saved = localStorage.getItem('activeVisitors');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('activeVisitors', JSON.stringify(activeVisitors));
  }, [activeVisitors]);

  const checkIn = (visitor) => {
    const newVisitor = {
      ...visitor,
      id: `VIS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      checkInTime: new Date().toISOString(),
      status: 'active'
    };
    setActiveVisitors(prev => [newVisitor, ...prev]);
    return newVisitor;
  };

  const checkOut = (id) => {
    setActiveVisitors(prev => prev.filter(v => v.id !== id));
    // In a real app, we'd move this to a "history" or "audit" log
  };

  return (
    <VisitorContext.Provider value={{ activeVisitors, checkIn, checkOut }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitorContext = () => useContext(VisitorContext);