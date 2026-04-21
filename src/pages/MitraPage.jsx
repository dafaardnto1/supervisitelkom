import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { 
  Users, Plus, Edit3, Trash2, Search, 
  Building2, Fingerprint,
  ShieldCheck, Loader2
} from 'lucide-react';

export default function MitraPage() {
  const [mitra, setMitra] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMitra = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mitra')
      .select('*')
      .order('nama_mitra', { ascending: true });
    if (!error) setMitra(data);
    setLoading(false);
  };

  useEffect(() => { fetchMitra(); }, []);

  const filteredMitra = mitra.filter(m => 
    m.nama_mitra.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] dark:bg-[#050E3C] transition-all duration-500 overflow-hidden">
      <Sidebar />
      
      {/* SUBTLE AMBIENT BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#002455]/6 dark:bg-[#002455]/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[20%] w-[30%] h-[30%] bg-[#DC0000]/4 dark:bg-[#DC0000]/10 blur-[100px] rounded-full" />
      </div>

      <main className="flex-1 p-8 lg:p-10 relative z-10 overflow-y-auto pt-16 lg:pt-10">
        
        {/* HEADER */}
        <header className="mb-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-[#DC0000] rounded-xl shadow-lg shadow-[#DC0000]/25">
                <Users className="text-white" size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#050E3C] dark:text-white tracking-tight uppercase">
                  Partner Registry
                </h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase ml-0.5">
                  Database Management System
                </p>
              </div>
            </div>
          </div>

          <button className="group relative bg-[#002455] dark:bg-[#002455] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#002455]/30 dark:shadow-[#002455]/50 hover:bg-[#001a3d] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={15} strokeWidth={3} />
              Tambah Instansi
            </span>
          </button>
        </header>

        {/* SEARCH & STATS */}
        <div className="flex flex-col xl:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#DC0000] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama instansi atau mitra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-5 py-3 text-sm bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#DC0000]/20 focus:border-[#DC0000]/40 transition-all font-medium text-slate-700 dark:text-white shadow-sm placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm px-6 py-3 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Total: {mitra.length} Partner
              </span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-[#DC0000]" size={36} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/8">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                      Partner Identity
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                      Encrypted ID
                    </th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-white/5">
                  {filteredMitra.length > 0 ? filteredMitra.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-[#002455]/40 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-[#002455] group-hover:text-white dark:group-hover:bg-[#002455] transition-all duration-300 border border-slate-200/80 dark:border-white/10">
                              <Building2 size={20} />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-green-500 border-2 border-white dark:border-[#050E3C] w-4 h-4 rounded-full flex items-center justify-center">
                              <ShieldCheck size={8} className="text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-[#050E3C] dark:text-white text-base tracking-tight leading-none mb-1.5">
                              {item.nama_mitra}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-tight bg-green-500/10 px-2 py-0.5 rounded-md">
                                Verified
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 font-mono text-xs bg-slate-50/80 dark:bg-white/5 px-4 py-2.5 rounded-lg border border-slate-100/80 dark:border-white/8 w-fit">
                          <Fingerprint size={13} className="text-[#DC0000]/60 dark:text-[#DC0000]/70" />
                          {item.id}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="w-9 h-9 bg-white dark:bg-[#002455]/30 text-slate-400 hover:text-[#002455] dark:hover:text-blue-400 rounded-lg shadow-sm border border-slate-200/80 dark:border-white/10 flex items-center justify-center transition-all hover:border-[#002455]/30">
                            <Edit3 size={15} />
                          </button>
                          <button className="w-9 h-9 bg-white dark:bg-[#002455]/30 text-slate-400 hover:text-[#DC0000] rounded-lg shadow-sm border border-slate-200/80 dark:border-white/10 flex items-center justify-center transition-all hover:border-[#DC0000]/30">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="py-24 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <div className="p-5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-4">
                            <Search size={40} className="text-slate-400 dark:text-slate-600" />
                          </div>
                          <p className="font-black uppercase tracking-[0.3em] text-xs text-slate-400">No Results Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-10 flex justify-between items-center opacity-30">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-slate-400 dark:bg-slate-600" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Security Protocol Alpha</p>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">System Integrated © 2026</p>
        </footer>
      </main>
    </div>
  );
}