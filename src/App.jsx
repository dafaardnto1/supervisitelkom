import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MitraPage from './pages/MitraPage';
import Storage from './pages/Storage';
import Statistik from './pages/Statistik';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9FAFB] dark:bg-[#030712]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-red-600 rounded-2xl"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Telkom SV...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>

      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/dashboard" />} 
        />

        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/mitra" 
          element={session ? <MitraPage /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/storage" 
          element={session ? <Storage /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/statistik" 
          element={session ? <Statistik /> : <Navigate to="/login" />} 
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}