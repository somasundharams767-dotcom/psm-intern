import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components & Layouts
import { StudentLayout } from './components/StudentLayout';
import { AdminLayout } from './components/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { PublicProfilePage } from './pages/PublicProfilePage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentInternshipPage } from './pages/student/StudentInternshipPage';
import { StudentProjectPage } from './pages/student/StudentProjectPage';
import { StudentEvaluationPage } from './pages/student/StudentEvaluationPage';
import { StudentCertificatePage } from './pages/student/StudentCertificatePage';
import { StudentSettingsPage } from './pages/student/StudentSettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInternsPage } from './pages/admin/AdminInternsPage';
import { AdminInternDetailPage } from './pages/admin/AdminInternDetailPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminEvaluationsPage } from './pages/admin/AdminEvaluationsPage';
import { AdminCertificatesPage } from './pages/admin/AdminCertificatesPage';
import { AdminQRCodesPage } from './pages/admin/AdminQRCodesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading portal...</div>;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'student') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading console...</div>;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<StudentLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify/:verificationId" element={<PublicVerifyPage />} />
          <Route path="/profile/:internId" element={<PublicProfilePage />} />

          {/* Student Protected Portal */}
          <Route
            path="/student"
            element={
              <StudentRoute>
                <StudentLayout />
              </StudentRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="internship" element={<StudentInternshipPage />} />
            <Route path="project" element={<StudentProjectPage />} />
            <Route path="evaluation" element={<StudentEvaluationPage />} />
            <Route path="certificates" element={<StudentCertificatePage />} />
            <Route path="settings" element={<StudentSettingsPage />} />
          </Route>

          {/* Admin Protected Portal */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="interns" element={<AdminInternsPage />} />
            <Route path="interns/:id" element={<AdminInternDetailPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="evaluations" element={<AdminEvaluationsPage />} />
            <Route path="certificates" element={<AdminCertificatesPage />} />
            <Route path="qr-codes" element={<AdminQRCodesPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
