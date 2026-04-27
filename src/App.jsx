import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoleGuard from './components/RoleGuard';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';       // Admin only
import MitraPage from './pages/MitraPage';       // Admin only
import Storage from './pages/Storage';           // Admin only
import Statistik from './pages/Statistik';       // Admin only
import UserDashboard from './pages/UserDashboard'; // User only

// ── Inner component agar bisa pakai useAuth (harus di dalam AuthProvider) ──
function AppRoutes() {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9FAFB] dark:bg-[#030712]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-red-600 rounded-2xl" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            Loading Telkom SV...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Public ── */}
      <Route
        path="/login"
        element={!session
          ? <Login />
          : <Navigate to={isAdmin ? '/dashboard' : '/user-dashboard'} replace />
        }
      />

      {/* ── Admin only ── */}
      <Route
        path="/dashboard"
        element={
          session
            ? <RoleGuard allowedRoles={['admin']} redirectTo="/user-dashboard"><Dashboard /></RoleGuard>
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/mitra"
        element={
          session
            ? <RoleGuard allowedRoles={['admin']} redirectTo="/user-dashboard"><MitraPage /></RoleGuard>
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/storage"
        element={
          session
            ? <RoleGuard allowedRoles={['admin']} redirectTo="/user-dashboard"><Storage /></RoleGuard>
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/statistik"
        element={
          session
            ? <RoleGuard allowedRoles={['admin']} redirectTo="/user-dashboard"><Statistik /></RoleGuard>
            : <Navigate to="/login" replace />
        }
      />

      {/* ── User only ── */}
      <Route
        path="/user-dashboard"
        element={
          session
            ? <RoleGuard allowedRoles={['user', 'admin']} redirectTo="/login"><UserDashboard /></RoleGuard>
            : <Navigate to="/login" replace />
        }
      />

      {/* ── Catch-all ── */}
      <Route
        path="/"
        element={
          !session
            ? <Navigate to="/login" replace />
            : <Navigate to={isAdmin ? '/dashboard' : '/user-dashboard'} replace />
        }
      />
      <Route
        path="*"
        element={
          !session
            ? <Navigate to="/login" replace />
            : <Navigate to={isAdmin ? '/dashboard' : '/user-dashboard'} replace />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}