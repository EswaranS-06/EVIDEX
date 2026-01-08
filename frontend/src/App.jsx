import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ReportDetails from './pages/ReportDetails';
import FindingDetail from './pages/FindingDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Default redirect */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report/:id" element={<ReportDetails />} />
        <Route path="/finding/:id" element={<FindingDetail />} />
        {/* Default redirect - Bypassing login for now */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
