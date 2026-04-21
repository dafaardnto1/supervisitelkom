import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  CheckCircle2, Clock, XCircle, Activity, ArrowUpRight
} from 'lucide-react';

export default function Statistik() {
  const [counts, setCounts] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [dataStats, setDataStats] = useState([]);
  
  const trendData = [
    { name: 'Jan', total: 4 }, { name: 'Feb', total: 7 }, { name: 'Mar', total: 5 },
    { name: 'Apr', total: counts.approved + counts.pending + counts.rejected }
  ];

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('files').select('status');
      if (data) {
        const c = data.reduce((acc, f) => {
          acc[f.status] = (acc[f.status] || 0) + 1;
          return acc;
        }, { approved: 0, pending: 0, rejected: 0 });
        setCounts(c);

        setDataStats([
          { name: 'Approved', total: c.approved, color: '#10b981' },
          { name: 'Pending', total: c.pending, color: '#f59e0b' },
          { name: 'Rejected', total: c.rejected, color: '#DC0000' },
        ]);
      }
    }
    fetchStats();
  }, [counts.approved]);

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] dark:bg-[#050E3C] transition-all duration-700 overflow-hidden">
      <Sidebar />
      
      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-8%] w-[50%] h-[50%] bg-[#DC0000]/5 dark:bg-[#DC0000]/8 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-8%] w-[45%] h-[45%] bg-[#002455]/6 dark:bg-[#002455]/25 blur-[120px] rounded-full" />
      </div>

      <main className="flex-1 p-8 lg:p-10 relative z-10 overflow-y-auto pt-16 lg:pt-10">
        
        {/* HEADER */}
        <header className="mb-9 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-[#050E3C] dark:bg-[#DC0000] rounded-xl shadow-lg shadow-[#050E3C]/20 dark:shadow-[#DC0000]/25">
                <Activity className="text-white" size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#050E3C] dark:text-white tracking-tight uppercase">
                  Work Intelligence
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-8 bg-[#DC0000] rounded-full" />
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase">
                    Enterprise Analytics v2.0
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-3">
            <CheckCircle2 size={15} className="text-[#002455] dark:text-blue-400" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Secured Database Access
            </span>
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Approved', val: counts.approved, icon: CheckCircle2, accent: '#10b981', light: 'emerald' },
            { label: 'Pending', val: counts.pending, icon: Clock, accent: '#f59e0b', light: 'amber' },
            { label: 'Rejected', val: counts.rejected, icon: XCircle, accent: '#DC0000', light: 'red' }
          ].map((item, idx) => (
            <div key={idx} className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-sm p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Accent top border */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${item.accent}60, ${item.accent}20)` }} />
              
              <div className="flex items-start justify-between mb-5">
                <div className="p-2.5 rounded-xl" style={{ background: `${item.accent}15` }}>
                  <item.icon size={20} style={{ color: item.accent }} strokeWidth={2} />
                </div>
                <ArrowUpRight size={15} className="text-slate-300 dark:text-white/20 group-hover:text-slate-400 dark:group-hover:text-white/40 transition-colors" />
              </div>
              
              <h3 className="text-4xl font-black text-[#050E3C] dark:text-white mb-1.5 tracking-tighter tabular-nums">
                {item.val}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                {item.label} Documents
              </p>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          
          {/* BAR CHART */}
          <div className="lg:col-span-3 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-2.5 mb-7">
              <div className="h-4 w-0.5 bg-[#DC0000] rounded-full" />
              <h4 className="text-xs font-black text-[#050E3C] dark:text-white uppercase tracking-[0.2em]">
                Performance Overview
              </h4>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataStats} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" opacity={1} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                    dy={12} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      background: '#050E3C', 
                      color: '#fff', 
                      boxShadow: '0 20px 40px -8px rgba(0,0,0,0.4)',
                      fontSize: '12px',
                      fontWeight: 700
                    }} 
                  />
                  <Bar dataKey="total" radius={[8, 8, 4, 4]} barSize={40}>
                    {dataStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="lg:col-span-2 bg-[#050E3C] dark:bg-[#002455]/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#DC0000]/10 to-[#002455]/20 rounded-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-4 w-0.5 bg-[#DC0000] rounded-full" />
                <h4 className="text-xs font-black text-white/80 uppercase tracking-[0.2em]">Work Share</h4>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={dataStats} 
                      cx="50%" cy="50%" 
                      innerRadius={68} 
                      outerRadius={95} 
                      paddingAngle={6} 
                      dataKey="total"
                      stroke="none"
                    >
                      {dataStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#050E3C', color: '#fff', fontSize: '12px', fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-5 mt-4">
                {dataStats.map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* TREND CHART */}
        <div className="mt-5 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-3 w-0.5 bg-[#DC0000] rounded-full" />
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Activity Trend</p>
          </div>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC0000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#DC0000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#DC0000" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorTrend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Health: Operational</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Updated: Just Now</p>
          </div>
        </div>

      </main>
    </div>
  );
}