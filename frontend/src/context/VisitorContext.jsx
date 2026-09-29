import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const VisitorContext = createContext();

export const VisitorProvider = ({ children }) => {
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshActiveVisitors = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getActiveVisitors();
      setActiveVisitors(data);
    } catch (error) {
      console.error('Failed to load active visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActiveVisitors();
  }, []);

  const checkIn = async (visitorResponse) => {
    await refreshActiveVisitors();
    return visitorResponse;
  };

  const checkOut = async (id, type = 'PERMANENT') => {
    try {
      await apiClient.checkOutVisitor(id, type);
      await refreshActiveVisitors();
    } catch (error) {
      console.error('Checkout failed in context:', error);
      alert(error.message || 'Checkout failed');
    }
  };

  const checkInReturn = async (id) => {
    try {
      const updatedVisitor = await apiClient.returnVisitor(id);
      await refreshActiveVisitors();
      return updatedVisitor;
    } catch (error) {
      console.error('Checkin return failed in context:', error);
      alert(error.message || 'Failed to check visitor back in');
      throw error;
    }
  };

  return (
    <VisitorContext.Provider value={{ activeVisitors, loading, checkIn, checkOut, checkInReturn, refreshActiveVisitors }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitorContext = () => useContext(VisitorContext);
