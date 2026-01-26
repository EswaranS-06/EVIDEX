import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
import FindingDetail from './pages/FindingDetail';
import Error404 from './pages/Error404';
import Error400 from './pages/Error400';
import Error401 from './pages/Error401';
import Error500 from './pages/Error500';
=======
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
>>>>>>> web

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}><LoadingSkeleton /></div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

<<<<<<< HEAD
          {/* Error Pages */}
          <Route path="/error/400" element={<Error400 />} />
          <Route path="/error/401" element={<Error401 />} />
          <Route path="/error/500" element={<Error500 />} />
          <Route path="/error/404" element={<Error404 />} />

          {/* Protected Routes wrapped in ProtectedRoute and MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/report/:id" element={<ReportDetails />} />
              <Route path="/finding/:id" element={<FindingDetail />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Catch-all 404 route - must be last */}
          <Route path="*" element={<Error404 />} />
        </Routes>
=======
              {/* Protected Routes wrapped in ProtectedRoute and MainLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/report/:id" element={<ReportDetails />} />
                  <Route path="/report/:reportId/finding/:id" element={<FindingDetail />} />
                  <Route path="/finding/:id" element={<FindingDetail />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
>>>>>>> web
      </Router>
    </AuthProvider>
  );
}

export default App;
