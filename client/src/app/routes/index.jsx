import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import SharedLayout from '@/components/layout/SharedLayout';

// Fallback Loading Component
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-screen">
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

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/create-account" element={<CreateAccount />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<SharedLayout />}>
            <Route index element={<MainDashboard />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="cases" element={<CaseManagement />} />
            <Route path="research" element={<AILegalAssistant />} />
            <Route path="analytics" element={<AIAnalyticsInsights />} />
            <Route path="admin" element={<AdminPanelFirmManagement />} />
            <Route path="settings" element={<SettingsOrganization />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
