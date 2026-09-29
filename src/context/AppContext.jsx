import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeSite, setActiveSite] = useState('S1');
  const [userRole, setUserRole] = useState('Guard');

  return (
    <AppContext.Provider value={{ activeSite, setActiveSite, userRole, setUserRole }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);