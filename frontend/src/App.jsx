import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AppProvider, useAppContext } from './context/AppContext';
import { VisitorProvider } from './context/VisitorContext';

import DashboardLocal from './pages/DashboardLocal';
import DashboardGlobal from './pages/DashboardGlobal';
import GateEntry from './pages/GateEntry';
import GateExit from './pages/GateExit';
import QRScanner from './pages/QRScanner';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Login from './pages/Login';

function RoleRoute({ element, allowedRoles }) {
  const { currentUser } = useAppContext();
  const userRole = currentUser?.role || 'Guard';

  if (!allowedRoles.includes(userRole)) {
    const defaultPath = userRole === 'Host' ? '/gate/entry' : '/dashboard/local';
    return <Navigate to={defaultPath} replace />;
  }

  return element;
}

function AppContent() {
  const { isLoggedIn, currentUser } = useAppContext();
  const userRole = currentUser?.role || 'Guard';

  return (
    <Routes>
      <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to={userRole === 'Host' ? '/gate/entry' : '/dashboard/local'} replace />} />
      
      {/* Protected Routes */}
      <Route element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" replace />}>
        <Route path="/" element={<Navigate to={userRole === 'Host' ? '/gate/entry' : '/dashboard/local'} replace />} />
        <Route path="/dashboard/local" element={<RoleRoute element={<DashboardLocal />} allowedRoles={['Admin', 'Guard']} />} />
        <Route path="/dashboard/global" element={<RoleRoute element={<DashboardGlobal />} allowedRoles={['Admin']} />} />
        <Route path="/gate/entry" element={<RoleRoute element={<GateEntry />} allowedRoles={['Admin', 'Guard', 'Host']} />} />
        <Route path="/gate/exit" element={<RoleRoute element={<GateExit />} allowedRoles={['Admin', 'Guard']} />} />
        <Route path="/gate/qr-scan" element={<RoleRoute element={<QRScanner />} allowedRoles={['Admin', 'Guard']} />} />
        <Route path="/settings" element={<RoleRoute element={<Settings />} allowedRoles={['Admin']} />} />
        <Route path="/reports" element={<RoleRoute element={<Reports />} allowedRoles={['Admin', 'Guard', 'Host']} />} />
        <Route path="*" element={<div className="p-8 text-gray-400">Page under construction...</div>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <VisitorProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </VisitorProvider>
    </AppProvider>
  );
}

export default App;
