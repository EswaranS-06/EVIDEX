import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoadingSkeleton from './components/LoadingSkeleton';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const ReportDetails = lazy(() => import('./pages/ReportDetails'));
const FindingDetail = lazy(() => import('./pages/FindingDetail'));
const ReportStatus = lazy(() => import('./pages/ReportStatus'));
const CreateReport = lazy(() => import('./pages/CreateReport'));

import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <Suspense fallback={<div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}><LoadingSkeleton /></div>}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes wrapped in ProtectedRoute and MainLayout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/report/:id" element={<ReportDetails />} />
                    <Route path="/report/:reportId/finding/:id" element={<FindingDetail />} />
                    <Route path="/finding/:id" element={<FindingDetail />} />
                    <Route path="/report-status" element={<ReportStatus />} />
                    <Route path="/create" element={<CreateReport />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
