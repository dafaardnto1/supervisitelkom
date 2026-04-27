import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  LogOut,
  HardDrive,
  BarChart3,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  UserCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = location.pathname;
  const { isAdmin, role } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    MySwal.fire({
      title: <span className="text-gray-800 dark:text-white font-black text-xl tracking-tight">Yakin ingin keluar?</span>,
      html: <p className="text-gray-500 dark:text-gray-400 font-medium text-center text-sm">Sesi kamu akan berakhir. Sampai jumpa!</p>,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'YA, KELUAR',
      cancelButtonText: 'BATAL',
      customClass: {
        confirmButton: 'bg-[#DC0000] text-white px-7 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#b50000] transition-all shadow-lg shadow-red-100 dark:shadow-none ml-3',
        cancelButton: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-7 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all',
        popup: 'rounded-2xl p-8 bg-white dark:bg-[#050E3C] border border-slate-200 dark:border-white/10 shadow-2xl',
      },
      buttonsStyling: false,
      background: isDarkMode ? '#050E3C' : '#ffffff',
      backdrop: `rgba(5,14,60,0.5) backdrop-blur-sm`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await supabase.auth.signOut();
        navigate('/login');
      }
    });
  };

  // ── Nav items berdasarkan role ──
  const adminNavItems = [
    { key: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: '/mitra', label: 'Daftar Mitra', icon: Users },
    { key: '/storage', label: 'Storage', icon: HardDrive },
    { key: '/statistik', label: 'Work Statistik', icon: BarChart3 },
  ];

  const userNavItems = [
    { key: '/user-dashboard', label: 'Berkas Saya', icon: LayoutDashboard },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* LOGO */}
      <div className="px-7 pt-8 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tighter flex items-center">
            <span className="text-[#DC0000]">TELKOM</span>
            <span className="text-[#050E3C] dark:text-white ml-1 transition-colors">SV</span>
          </h1>
          <div className="h-0.5 w-7 bg-[#DC0000] mt-1 rounded-full" />
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* ROLE BADGE */}
      <div className="mx-4 mb-4 px-4 py-2.5 rounded-xl border flex items-center gap-2.5 
        bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10">
        {isAdmin
          ? <Shield size={15} className="text-[#DC0000] shrink-0" />
          : <UserCircle2 size={15} className="text-slate-400 shrink-0" />
        }
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Role Aktif</p>
          <p className={`text-[11px] font-black uppercase tracking-wider ${isAdmin ? 'text-[#DC0000]' : 'text-slate-600 dark:text-slate-300'}`}>
            {isAdmin ? 'Administrator' : 'User'}
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.key || activePage.startsWith(`${item.key}/`);
          return (
            <Link
              key={item.key}
              to={item.key}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#DC0000]/10 dark:bg-[#DC0000]/15 text-[#DC0000]'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/8 hover:text-[#050E3C] dark:hover:text-slate-200'
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-4 pb-6 pt-4 border-t border-slate-100 dark:border-white/8 space-y-1">
        {/* THEME TOGGLE */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/8 rounded-xl transition-all duration-200"
        >
          <div className="p-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">
            {isDark ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-[#DC0000]/8 dark:hover:bg-[#DC0000]/10 hover:text-[#DC0000] rounded-xl font-black transition-all duration-200 uppercase text-[10px] tracking-widest"
        >
          <LogOut size={17} strokeWidth={2.5} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* HAMBURGER */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-[#050E3C] border border-slate-200/80 dark:border-white/10 rounded-xl shadow-md text-[#050E3C] dark:text-white backdrop-blur-sm transition-all hover:bg-slate-50 dark:hover:bg-white/10"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-[#050E3C]/50 backdrop-blur-sm"
        />
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white dark:bg-[#050E3C]/80 backdrop-blur-sm h-screen border-r border-slate-100 dark:border-white/8 sticky top-0 z-10 transition-colors duration-300 flex-col">
        <SidebarContent />
      </aside>

      {/* MOBILE DRAWER */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 z-50 bg-white dark:bg-[#050E3C] border-r border-slate-100 dark:border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      <div className="lg:hidden w-0 h-0" />
    </>
  );
}