import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Maintenance from './pages/Maintenance';
import Funds from './pages/Funds';
import Notices from './pages/Notices';
import Committee from './pages/Committee';
import Login from './pages/Login';
import Register from './pages/Register';
import Location from './pages/Location';
import Expenses from './pages/Expenses';
import Meetings from './pages/Meetings';
import AuditLogs from './pages/AuditLogs';
import Emergency from './pages/Emergency';
import VisitorPass from './pages/VisitorPass';
import Facilities from './pages/Facilities';
import Helpdesk from './pages/Helpdesk';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('sr_token'));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('sr_token'));
    };
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Everyone can see Dashboard (logic inside handles view) */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/emergency" element={<Emergency />} />
                
                {/* Admin & Committee Only */}
                <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />
                <Route path="/expenses" element={<ProtectedRoute allowedRoles={['ADMIN', 'COMMITTEE']}><Expenses /></ProtectedRoute>} />
                
                {/* General Protected Routes */}
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/visitor-pass" element={<VisitorPass />} />
                <Route path="/buildings" element={<Buildings />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/funds" element={<Funds />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/committee" element={<Committee />} />
                <Route path="/location" element={<Location />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/helpdesk" element={<Helpdesk />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;