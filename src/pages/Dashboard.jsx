import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; 
import UploadModal from '../components/UploadModal';
import FileTable from '../components/FileTable';
import { FileUp, Filter, Search, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1); 
  
  const slides = [
    { id: 1, url: '/slide1.jpg' }, 
    { id: 2, url: '/slide2.jpg' },
    { id: 3, url: '/slide3.jpg' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev === slides.length - 1 && direction === 1) {
          setDirection(-1);
          return prev - 1;
        }
        if (prev === 0 && direction === -1) {
          setDirection(1);
          return prev + 1;
        }
        return prev + direction;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [direction, slides.length]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmHapus = window.confirm(`Hapus ${selectedIds.length} berkas terpilih?`);
    if (!confirmHapus) return;

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      alert("Berkas berhasil dihapus!");
      setSelectedIds([]);
      setIsSelectionMode(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] dark:bg-[#050E3C] transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-8 pb-24 overflow-y-auto pt-16 lg:pt-8">
        
        {/* SUBTLE BACKGROUND MESH */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-[#DC0000]/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[15%] w-[35%] h-[35%] rounded-full bg-[#002455]/8 blur-[100px]" />
        </div>

        {/* HEADER */}
        <header className="relative z-10 flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-6 w-1 rounded-full bg-[#DC0000]" />
              <h2 className="text-2xl font-black text-[#050E3C] dark:text-white tracking-tight uppercase">
                Dashboard
              </h2>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium ml-4">
              Monitoring berkas supervisi secara realtime.
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all border backdrop-blur-sm ${
                isSelectionMode 
                ? 'bg-[#050E3C] text-white border-[#050E3C] shadow-lg shadow-[#050E3C]/20' 
                : 'bg-white/80 dark:bg-white/5 text-[#050E3C] dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 shadow-sm'
              }`}
            >
              <Filter size={16} />
              <span>{isSelectionMode ? 'Batal Pilih' : 'Pilih File'}</span>
            </button>

            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="bg-red-50 dark:bg-red-900/20 text-[#DC0000] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#DC0000] hover:text-white transition-all shadow-sm border border-red-200/80 dark:border-red-900/30"
              >
                <Trash2 size={16} />
                <span>Hapus ({selectedIds.length})</span>
              </button>
            )}

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#DC0000] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#b50000] transition-all shadow-lg shadow-[#DC0000]/25"
            >
              <FileUp size={17} strokeWidth={2.5} />
              <span>Upload Berkas</span>
            </button>
          </div>
        </header>

        {/* SEARCH & FILTER */}
        <div className="relative z-10 flex items-center justify-between mb-7 flex-wrap gap-4">
          <div className="relative group flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#DC0000] transition-colors" />
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200/80 dark:border-white/10 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-sm dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DC0000]/20 focus:border-[#DC0000]/40 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center p-1 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm gap-0.5">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button 
                key={f}
                onClick={() => setCurrentFilter(f)}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  currentFilter === f 
                  ? 'bg-[#DC0000] text-white shadow-md shadow-[#DC0000]/30' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-[#050E3C] dark:hover:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* IMAGE SLIDER */}
        <div className="relative z-10 w-full mb-8 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg bg-slate-200 dark:bg-[#002455]/40 backdrop-blur-sm">
          <div className="relative w-full pb-[33.33%] h-0">
            <div 
              className="absolute inset-0 flex h-full transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="min-w-full h-full">
                  <img 
                    src={slide.url} 
                    className="w-full h-full object-cover select-none" 
                    alt="Dashboard Banner" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x400?text=Slide' }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setDirection(index === slides.length - 1 ? -1 : 1);
                }}
                className={`h-1 transition-all rounded-full ${
                  currentSlide === index ? 'w-7 bg-[#DC0000]' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* FILE TABLE */}
        <div className="relative z-10">
          <FileTable 
            refreshKey={refreshKey} 
            filterStatus={currentFilter}
            searchQuery={searchQuery}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        </div>

        <UploadModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onUploadSuccess={() => setRefreshKey(prev => prev + 1)} 
        />
      </main>
    </div>
  );
}