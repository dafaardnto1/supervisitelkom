import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user'
  const [loading, setLoading] = useState(true);

  // Ambil role dari user_metadata Supabase
  const extractRole = (session) => {
    if (!session) return null;
    return session.user?.user_metadata?.role || 'user';
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setRole(extractRole(session));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setRole(extractRole(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return (
    <AuthContext.Provider value={{ session, role, isAdmin, isUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}