import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { 
  Folder, FileText, ChevronRight, HardDrive, 
  Loader2, Search, Trash2, Filter, MoreVertical, 
  FolderOpen, ArrowLeft, Download, SortAsc, SortDesc
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import * as XLSX from 'xlsx';

const MySwal = withReactContent(Swal);

// Helper icons (local, tidak diimport dari lucide untuk menghindari nama konflik)
function LayoutGrid(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
  );
}
function ClockIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function CheckCircleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

export default function Storage() {
  const [mitraList, setMitraList] = useState([]);
  const [selectedMitra, setSelectedMitra] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [filterMitraId, setFilterMitraId] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({ totalFiles: 0, needReview: 0, completed: 0 });

  useEffect(() => {
    async function fetchMitra() {
      setLoading(true);
      const { data } = await supabase.from('mitra').select('*').order('nama_mitra');
      setMitraList(data || []);
      setLoading(false);
    }
    fetchMitra();
  }, []);

  useEffect(() => {
    async function fetchDashboardStats() {
      const { data } = await supabase.from('files').select('status');
      if (data) {
        const total = data.length;
        const needReview = data.filter(f => f.status === 'pending' || f.status === 'rejected').length;
        const completed = data.filter(f => f.status === 'approved').length;
        setDashboardStats({ totalFiles: total, needReview, completed });
      }
    }
    fetchDashboardStats();
  }, []);

  const fetchFiles = async () => {
    if (!selectedMitra) return;
    setLoadingFiles(true);
    const { data } = await supabase.from('files').select('*').eq('mitra_id', selectedMitra.id);
    setFiles(data || []);
    setLoadingFiles(false);
  };

  useEffect(() => {
    fetchFiles();
    setIsSelectionMode(false);
    setSelectedIds([]);
    setSearchQuery('');
    setFilterMitraId('all');
    setSortBy('newest');
  }, [selectedMitra]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const isDarkMode = document.documentElement.classList.contains('dark');
    MySwal.fire({
      title: <span className="text-slate-800 dark:text-white font-black text-xl tracking-tight">Hapus Berkas?</span>,
      html: <p className="text-slate-500 dark:text-slate-400 font-medium italic">"{selectedIds.length} file akan dihapus dari storage & database."</p>,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YA, HAPUS',
      cancelButtonText: 'BATAL',
      customClass: {
        confirmButton: 'bg-[#DC0000] text-white px-7 py-2.5 rounded-xl font-black ml-3 shadow-lg shadow-red-200 text-sm',
        cancelButton: 'bg-slate-100 dark:bg-slate-800 text-slate-500 px-7 py-2.5 rounded-xl font-bold text-sm',
        popup: 'rounded-2xl p-8 bg-white dark:bg-[#050E3C] border border-slate-200 dark:border-white/10',
      },
      buttonsStyling: false,
      background: isDarkMode ? '#050E3C' : '#ffffff',
      backdrop: `rgba(5,14,60,0.5) backdrop-blur-sm`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data: filesToDelete } = await supabase.from('files').select('file_path').in('id', selectedIds);
          if (filesToDelete) {
            const paths = filesToDelete.map(f => f.file_path);
            await supabase.storage.from('supervisi-files').remove(paths);
          }
          await supabase.from('files').delete().in('id', selectedIds);
          MySwal.fire({ title: 'Success!', icon: 'success', background: isDarkMode ? '#050E3C' : '#ffffff' });
          setSelectedIds([]);
          setIsSelectionMode(false);
          fetchFiles();
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const exportToExcel = async () => {
    try {
      const { data: allFiles, error } = await supabase.from('files').select(`*, mitra:mitra_id (nama_mitra)`);
      if (error) throw error;
      if (!allFiles || allFiles.length === 0) {
        MySwal.fire({ title: 'Tidak Ada Data', text: 'Tidak ada data yang bisa diexport', icon: 'info', background: document.documentElement.classList.contains('dark') ? '#050E3C' : '#ffffff' });
        return;
      }
      const exportData = allFiles.map(file => ({
        'Nama File': file.file_name || '-',
        'Status': file.status === 'approved' ? 'Selesai' : file.status === 'pending' ? 'Perlu Review' : file.status === 'rejected' ? 'Ditolak' : file.status || '-',
        'Tanggal Upload': file.created_at ? new Date(file.created_at).toLocaleDateString('id-ID') : '-',
        'Mitra': file.mitra?.nama_mitra || '-',
        'File URL': file.file_url || '-'
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 50 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Data');
      XLSX.writeFile(wb, `Rekap_Data_${new Date().toLocaleDateString('id-ID')}.xlsx`);
      MySwal.fire({ title: 'Berhasil!', text: `${exportData.length} data berhasil diexport`, icon: 'success', timer: 2000, showConfirmButton: false, background: document.documentElement.classList.contains('dark') ? '#050E3C' : '#ffffff' });
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const getFilteredAndSortedFiles = () => {
    let filtered = [...files];
    if (searchQuery) filtered = filtered.filter(file => file.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
    switch(sortBy) {
      case 'newest': filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
      case 'oldest': filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
      case 'az': filtered.sort((a, b) => a.file_name.localeCompare(b.file_name)); break;
      case 'za': filtered.sort((a, b) => b.file_name.localeCompare(a.file_name)); break;
    }
    return filtered;
  };

  const filteredAndSortedFiles = getFilteredAndSortedFiles();

  const getSortIcon = () => {
    if (sortBy === 'newest' || sortBy === 'za') return <SortDesc size={15} />;
    return <SortAsc size={15} />;
  };

  const getSortLabel = () => {
    const labels = { newest: 'Terbaru', oldest: 'Terlama', az: 'A-Z', za: 'Z-A' };
    return labels[sortBy] || 'Urutkan';
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] dark:bg-[#050E3C] transition-all duration-500">
      <Sidebar />

      {/* AMBIENT BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#DC0000]/5 dark:bg-[#DC0000]/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[10%] w-[35%] h-[35%] bg-[#002455]/5 dark:bg-[#002455]/20 blur-[100px] rounded-full" />
      </div>

      <main className="flex-1 p-8 lg:p-10 relative z-10 overflow-y-auto pt-16 lg:pt-10">
        
        {/* HEADER */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-[#DC0000] rounded-xl shadow-lg shadow-[#DC0000]/25">
                <HardDrive className="text-white" size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#050E3C] dark:text-white tracking-tight uppercase">
                  Cloud Storage
                </h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase ml-0.5">
                  Centralized Digital Assets
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center gap-2"
            >
              <Download size={15} />
              Export Excel
            </button>
            
            {selectedMitra && (
              <div className="flex gap-2 p-1 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                <button 
                  onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }} 
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${isSelectionMode ? 'bg-[#050E3C] dark:bg-[#DC0000] text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <Filter size={13} />
                  {isSelectionMode ? 'Cancel' : 'Select'}
                </button>
                {selectedIds.length > 0 && (
                  <button 
                    onClick={handleBulkDelete} 
                    className="bg-[#DC0000] text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-md shadow-[#DC0000]/25 flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    Delete ({selectedIds.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Berkas', val: dashboardStats.totalFiles, icon: Folder, accent: '#002455', iconColor: 'text-[#002455] dark:text-blue-400' },
            { label: 'Perlu Review', val: dashboardStats.needReview, icon: ClockIcon, accent: '#f59e0b', iconColor: 'text-amber-500' },
            { label: 'Selesai', val: dashboardStats.completed, icon: CheckCircleIcon, accent: '#10b981', iconColor: 'text-emerald-500' }
          ].map((item, i) => (
            <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: item.accent }}>{item.label}</p>
                <p className="text-3xl font-black text-[#050E3C] dark:text-white tabular-nums">{item.val}</p>
              </div>
              <div className="p-3.5 rounded-xl" style={{ background: `${item.accent}15` }}>
                <item.icon size={26} className={item.iconColor} />
              </div>
            </div>
          ))}
        </div>

        {/* BREADCRUMB & CONTROLS */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
              <button 
                onClick={() => setSelectedMitra(null)}
                className={`p-2 rounded-lg transition-all ${!selectedMitra ? 'bg-[#DC0000] text-white shadow-md shadow-[#DC0000]/25' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
              >
                <LayoutGrid size={17} />
              </button>
              <ChevronRight size={14} className="text-slate-300 dark:text-white/20" />
              <div className="px-3 py-1.5 font-black text-[11px] uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400">
                {selectedMitra ? selectedMitra.nama_mitra : 'All Folders'}
              </div>
            </div>

            {selectedMitra && (
              <>
                <div className="relative flex-1 group min-w-[200px]">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#DC0000] transition-colors" />
                  <input 
                    type="text" 
                    placeholder={`Cari file di ${selectedMitra.nama_mitra}...`} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#DC0000]/20 transition-all font-medium dark:text-white placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                {/* SORT DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200/80 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all font-black text-[11px] uppercase tracking-widest text-slate-600 dark:text-slate-400 shadow-sm"
                  >
                    {getSortIcon()}
                    {getSortLabel()}
                  </button>
                  
                  {showFilterPanel && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowFilterPanel(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#050E3C] rounded-xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden z-50">
                        <div className="p-2">
                          <div className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Urutkan</div>
                          {[
                            { key: 'newest', label: 'Terbaru', icon: SortDesc },
                            { key: 'oldest', label: 'Terlama', icon: SortAsc },
                            { key: 'az', label: 'A-Z', icon: SortAsc },
                            { key: 'za', label: 'Z-A', icon: SortDesc }
                          ].map(({ key, label, icon: Icon }) => (
                            <button
                              key={key}
                              onClick={() => { setSortBy(key); setShowFilterPanel(false); }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2.5 ${sortBy === key ? 'bg-[#DC0000]/10 text-[#DC0000] dark:bg-[#DC0000]/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                              <Icon size={14} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedMitra && (
            <p className="text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Menampilkan {filteredAndSortedFiles.length} dari {files.length} file
              {searchQuery && ` • Pencarian: "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-[#DC0000]" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
            {!selectedMitra ? (
              // FOLDER VIEW
              mitraList.map((mitra) => (
                <div 
                  key={mitra.id} 
                  onClick={() => setSelectedMitra(mitra)} 
                  className="group cursor-pointer bg-white/80 dark:bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-[#DC0000]/30 dark:hover:border-[#DC0000]/30 shadow-sm hover:shadow-lg hover:shadow-[#DC0000]/5 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors duration-300">
                      <Folder size={36} className="text-amber-500 fill-amber-400/20" />
                    </div>
                  </div>
                  <span className="font-bold text-[#050E3C] dark:text-slate-200 text-xs uppercase tracking-wide text-center truncate w-full">
                    {mitra.nama_mitra}
                  </span>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase mt-1 tracking-wider">Storage Folder</p>
                </div>
              ))
            ) : loadingFiles ? (
              <div className="col-span-full py-20 text-center">
                <Loader2 className="animate-spin text-[#DC0000] mx-auto" size={32} />
              </div>
            ) : (
              filteredAndSortedFiles.length > 0 ? (
                filteredAndSortedFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className={`group relative bg-white/80 dark:bg-white/5 backdrop-blur-sm p-6 rounded-2xl border transition-all duration-300 hover:shadow-md flex flex-col items-center ${
                      selectedIds.includes(file.id) 
                        ? 'border-[#DC0000]/50 bg-[#DC0000]/5 dark:bg-[#DC0000]/10' 
                        : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {isSelectionMode && (
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(file.id)} 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, file.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== file.id));
                        }} 
                        className="absolute top-4 left-4 w-5 h-5 accent-[#DC0000] cursor-pointer z-20 rounded" 
                      />
                    )}
                    
                    <div className="relative mb-4">
                      <div className="p-4 bg-[#DC0000]/8 dark:bg-[#DC0000]/15 rounded-xl group-hover:bg-[#DC0000]/15 dark:group-hover:bg-[#DC0000]/25 transition-colors duration-300">
                        <FileText size={32} className="text-[#DC0000]" />
                      </div>
                    </div>

                    <span className="font-semibold text-[#050E3C] dark:text-slate-300 text-[11px] text-center line-clamp-2 leading-tight mb-2">
                      {file.file_name}
                    </span>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black bg-slate-100 dark:bg-white/8 text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {file.file_name.split('.').pop() || 'PDF'}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(file.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    {!isSelectionMode && (
                      <button 
                        onClick={() => window.open(file.file_url, '_blank')} 
                        className="absolute inset-0 bg-transparent cursor-pointer z-10" 
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center flex flex-col items-center">
                  <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-2xl mb-4">
                    <Search size={36} className="text-slate-300 dark:text-slate-700" />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Tidak ada file yang ditemukan</p>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="mt-3 text-[#DC0000] text-xs font-bold hover:underline">
                      Hapus pencarian
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}