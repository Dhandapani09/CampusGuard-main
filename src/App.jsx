import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AppProvider } from './context/AppContext';
import { VisitorProvider } from './context/VisitorContext';

// Placeholders for Pages
import DashboardLocal from './pages/DashboardLocal';
import GateEntry from './pages/GateEntry';

function App() {
  return (
    <AppProvider>
      <VisitorProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/local" replace />} />
            
            <Route element={<MainLayout />}>
              <Route path="/dashboard/local" element={<DashboardLocal />} />
              <Route path="/gate/entry" element={<GateEntry />} />
              {/* Other routes will be added as they are built */}
              <Route path="*" element={<div style={{padding: '2rem'}}>Page under construction...</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </VisitorProvider>
    </AppProvider>
  );
}

export default App;