import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell, ProtectedRoute } from './components/common/Layout';
import './styles/globals.css';

// Pages
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminStores    from './pages/admin/AdminStores';

// User
import UserStores  from './pages/user/UserStores';
import UserRatings from './pages/user/UserRatings';

// Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')  return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'owner')  return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/user/stores" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={user ? <RoleRedirect /> : <LoginPage />} />
      <Route path="/register" element={user ? <RoleRedirect /> : <RegisterPage />} />

      {/* Protected shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/password" element={<ChangePasswordPage />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users"     element={<AdminUsers />} />
            <Route path="/admin/stores"    element={<AdminStores />} />
          </Route>

          {/* Normal user routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/user/stores"  element={<UserStores />} />
            <Route path="/user/ratings" element={<UserRatings />} />
          </Route>

          {/* Store owner routes */}
          <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#faf8f4',
              color: '#2c2416',
              border: '1px solid rgba(100,90,70,0.18)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              boxShadow: '0 4px 16px rgba(80,60,30,0.12)',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#2d6a4f', secondary: '#faf8f4' } },
            error:   { iconTheme: { primary: '#e07070', secondary: '#faf8f4' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
