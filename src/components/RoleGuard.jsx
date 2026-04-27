import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard — proteksi route berdasarkan role.
 * 
 * Props:
 *   allowedRoles: array of string, e.g. ['admin'] atau ['admin','user']
 *   redirectTo: string path tujuan kalau akses ditolak (default: '/dashboard')
 */
export default function RoleGuard({ children, allowedRoles = [], redirectTo = '/dashboard' }) {
  const { role, loading } = useAuth();

  if (loading) return null; // Bisa diganti spinner kalau mau

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}