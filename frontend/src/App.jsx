import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardOverview from './pages/DashboardOverview';
import UrlManagement from './pages/UrlManagement';
import UrlAnalyticsDetail from './pages/UrlAnalyticsDetail';
import PasswordRedirect from './pages/PasswordRedirect';
import { AlertCircle, FileQuestion, CalendarOff, Link2 } from 'lucide-react';

// Route protection guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="min-h-screen bg-bg flex items-center justify-center">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Simple Error pages
const ExpiredPage = () => (
  <div class="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center select-none font-sans">
    <div class="bg-amber-50 text-amber-600 border border-amber-100 p-4 rounded-full w-fit mx-auto mb-4">
      <CalendarOff class="h-8 w-8" />
    </div>
    <h2 class="text-2xl font-extrabold text-slate-800">Short Link Expired</h2>
    <p class="text-sm text-textSub mt-2 max-w-sm">This link has reached its scheduled expiration date and is no longer available.</p>
    <a href="/" class="mt-6 text-sm font-semibold text-primary hover:underline">Back to Trimr</a>
  </div>
);

const NotFoundPage = () => (
  <div class="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center select-none font-sans">
    <div class="bg-rose-50 text-rose-600 border border-rose-100 p-4 rounded-full w-fit mx-auto mb-4">
      <FileQuestion class="h-8 w-8" />
    </div>
    <h2 class="text-2xl font-extrabold text-slate-800">Short Link Not Found</h2>
    <p class="text-sm text-textSub mt-2 max-w-sm">We couldn't find a registration matching that short code. Double-check your spelling.</p>
    <a href="/" class="mt-6 text-sm font-semibold text-primary hover:underline">Back to Trimr</a>
  </div>
);

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/expired" element={<ExpiredPage />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* Interstitial & Public Stats */}
          <Route path="/p/:shortCode" element={<PasswordRedirect />} />
          <Route path="/stats/:shortCode" element={<UrlAnalyticsDetail />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardOverview />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/links"
            element={
              <ProtectedRoute>
                <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
                  <UrlManagement searchQuery={searchQuery} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <UrlAnalyticsDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
