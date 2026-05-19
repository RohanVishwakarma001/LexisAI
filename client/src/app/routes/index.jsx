import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import SharedLayout from '@/components/layout/SharedLayout';

// Fallback Loading Component
const PageLoader = () => (
  <div className="flex-grow flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Lazy Load Features
const LandingPage = lazy(() => import('@/features/public/LandingPage'));
const SignIn = lazy(() => import('@/features/auth/SignIn'));
const CreateAccount = lazy(() => import('@/features/auth/CreateAccount'));

const MainDashboard = lazy(() => import('@/features/dashboard/MainDashboard'));
const DocumentManagement = lazy(() => import('@/features/documents/DocumentManagement'));
const CaseManagement = lazy(() => import('@/features/cases/CaseManagementKanbanTimeline'));
const AILegalAssistant = lazy(() => import('@/features/ai-research/AILegalAssistant'));
const AIAnalyticsInsights = lazy(() => import('@/features/analytics/AIAnalyticsInsights'));
const AdminPanelFirmManagement = lazy(() => import('@/features/admin/AdminPanelFirmManagement'));
const SettingsOrganization = lazy(() => import('@/features/settings/SettingsOrganization'));
const CalendarView = lazy(() => import('@/features/calendar/CalendarView'));

// Auth Route: Redirects to /dashboard or /dashboard/admin if logged in
const AuthRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return user?.role === 'ADMIN' ? <Navigate to="/dashboard/admin" replace /> : <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

// Protected Route: Redirects to /sign-in if not logged in
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export function AppRouter() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          
          {/* Guest/Auth Routes */}
          <Route element={<AuthRoute />}>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/create-account" element={<CreateAccount />} />
          </Route>
 
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<SharedLayout />}>
              <Route index element={<MainDashboard />} />
              <Route path="documents" element={<DocumentManagement />} />
              <Route path="cases" element={<CaseManagement />} />
              <Route path="research" element={<AILegalAssistant />} />
              <Route path="analytics" element={<AIAnalyticsInsights />} />
              <Route path="admin" element={<AdminPanelFirmManagement />} />
              <Route path="settings" element={<SettingsOrganization />} />
              <Route path="calendar" element={<CalendarView />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
