
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
import RegistrationApprovals from './pages/RegistrationApprovals';
import Profile from './pages/Profile';
import Polls from './pages/Polls';
import SecurityGate from './pages/SecurityGate';
import Deliveries from './pages/Deliveries';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './src/theme';

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/emergency" element={<Emergency />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Admin & Committee */}
                  <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN', 'COMMITTEE']}><AuditLogs /></ProtectedRoute>} />
                  <Route path="/approvals" element={<ProtectedRoute allowedRoles={['ADMIN', 'COMMITTEE']}><RegistrationApprovals /></ProtectedRoute>} />
                  <Route path="/expenses" element={<ProtectedRoute allowedRoles={['ADMIN', 'COMMITTEE']}><Expenses /></ProtectedRoute>} />
                  <Route path="/security-gate" element={<ProtectedRoute allowedRoles={['ADMIN', 'COMMITTEE']}><SecurityGate /></ProtectedRoute>} />
                  
                  {/* General Protected Routes */}
                  <Route path="/meetings" element={<Meetings />} />
                  <Route path="/visitor-pass" element={<VisitorPass />} />
                  <Route path="/buildings" element={<Buildings />} />
                  <Route path="/deliveries" element={<Deliveries />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/funds" element={<Funds />} />
                  <Route path="/notices" element={<Notices />} />
                  <Route path="/committee" element={<Committee />} />
                  <Route path="/location" element={<Location />} />
                  <Route path="/facilities" element={<Facilities />} />
                  <Route path="/helpdesk" element={<Helpdesk />} />
                  <Route path="/polls" element={<Polls />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
