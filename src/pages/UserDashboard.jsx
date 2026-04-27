import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  FileUp, FileText, Loader2, Maximize2, Clock,
  CheckCircle2, XCircle, Search, Upload
} from 'lucide-react';

export default function UserDashboard() {
  const { session } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingFileId, setLoadingFileId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('files')
        .select('*, mitra(nama_mitra)')
        .order('created_at', { ascending: false });

      // User hanya lihat file milik sendiri
      // Kalau kamu punya kolom uploaded_by di tabel files, uncomment ini:
      // query = query.eq('uploaded_by', session?.user?.id);

      if (filterStatus !== 'all') query = query.eq('status', filterStatus);
      if (searchQuery) query = query.ilike('file_name', `%${searchQuery}%`);

      const { data, error } = await query;
      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error('Gagal ambil data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [refreshKey, filterStatus, searchQuery]);

  const handleOpenPreview = async (filePath, fileId) => {
    try {
      setLoadingFileId(fileId);
      const { data, error } = await supabase.storage
        .from('supervisi-files')
        .createSignedUrl(filePath, 60);
      if (error) throw error;
      if (data?.signedUrl) setPreviewUrl(data.signedUrl);
    } catch (err) {
      alert('Gagal memuat preview: ' + err.message);
    } finally {
      setLoadingFileId(null);
    }
  };

  const statusConfig = {
    approved: {
      label: 'Disetujui',
      icon: CheckCircle2,
      cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    pending: {
      label: 'Menunggu',
      icon: Clock,
      cls: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      dot: 'bg-amber-400',
    },
    rejected: {
      label: 'Ditolak',
      icon: XCircle,
      cls: 'bg-red-100 text-[#DC0000] dark:bg-red-900/30 dark:text-red-400',
      dot: 'bg-[#DC0000]',
    },
  };

  const counts = {
    all: files.length,
    approved: files.filter(f => f.status === 'approved').length,
    pending: files.filter(f => f.status === 'pending').length,
    rejected: files.filter(f => f.status === 'rejected').length,
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] dark:bg-[#050E3C] transition-colors duration-300">
      <Sidebar />

      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-[#DC0000]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[15%] w-[35%] h-[35%] rounded-full bg-[#002455]/8 blur-[100px]" />
      </div>

      <main className="flex-1 p-6 lg:p-8 pb-24 overflow-y-auto pt-16 lg:pt-8 relative z-10">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-6 w-1 rounded-full bg-[#DC0000]" />
              <h2 className="text-2xl font-black text-[#050E3C] dark:text-white tracking-tight uppercase">
                Berkas Saya
              </h2>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-4">
              Upload dan pantau status berkas supervisi kamu.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto bg-[#DC0000] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#b50000] transition-all shadow-lg shadow-[#DC0000]/25"
          >
            <FileUp size={17} strokeWidth={2.5} />
            Upload Berkas
          </button>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {[
            { key: 'all', label: 'Total', color: '#050E3C' },
            { key: 'pending', label: 'Menunggu', color: '#f59e0b' },
            { key: 'approved', label: 'Disetujui', color: '#10b981' },
            { key: 'rejected', label: 'Ditolak', color: '#DC0000' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`p-5 rounded-2xl border text-left transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                filterStatus === key
                  ? 'border-[#DC0000]/40 bg-white dark:bg-white/8 ring-2 ring-[#DC0000]/15'
                  : 'border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5'
              }`}
            >
              <p className="text-2xl font-black tabular-nums" style={{ color }}>
                {counts[key]}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {label}
              </p>
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="relative group mb-6 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#DC0000] transition-colors" />
          <input
            type="text"
            placeholder="Cari dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200/80 dark:border-white/10 rounded-xl bg-white/70 dark:bg-white/5 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DC0000]/20 focus:border-[#DC0000]/40 transition-all font-medium placeholder:text-slate-400"
          />
        </div>

        {/* FILE LIST */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-[#DC0000]" size={40} />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
            <div className="p-6 bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10">
              <Upload size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada berkas</p>
              <p className="text-slate-400 text-sm mt-1">Klik "Upload Berkas" untuk mulai mengirim dokumen.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => {
              const st = statusConfig[file.status] || statusConfig.pending;
              const Icon = st.icon;
              return (
                <div
                  key={file.id}
                  className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
                >
                  {/* File icon */}
                  <div className="p-3 bg-[#DC0000]/10 dark:bg-[#DC0000]/15 text-[#DC0000] rounded-xl shrink-0">
                    <FileText size={22} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#050E3C] dark:text-slate-200 text-sm truncate mb-1">
                      {file.file_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{file.mitra?.nama_mitra || '-'}</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString('id-ID')}</span>
                    </div>

                    {/* Catatan revisi */}
                    {file.status === 'rejected' && file.supervisor_note && (
                      <div className="mt-2 text-xs text-[#DC0000] font-semibold bg-[#DC0000]/8 dark:bg-[#DC0000]/15 px-3 py-2 rounded-xl border border-[#DC0000]/15">
                        📝 {file.supervisor_note}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>

                    {/* Preview button */}
                    <button
                      onClick={() => handleOpenPreview(file.file_path, file.id)}
                      className="text-[10px] text-[#DC0000] font-black hover:underline uppercase tracking-wider flex items-center gap-1"
                    >
                      {loadingFileId === file.id
                        ? <Loader2 size={11} className="animate-spin" />
                        : <Maximize2 size={11} />}
                      LIHAT PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL PREVIEW PDF */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-[#050E3C] rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/5 flex-shrink-0">
              <h4 className="font-black text-[#050E3C] dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
                <FileText className="text-[#DC0000]" size={17} /> Pratinjau PDF
              </h4>
              <div className="flex gap-2">
                <a href={previewUrl} download className="px-4 py-2 bg-[#002455] text-white font-black text-xs rounded-xl hover:bg-[#001a3d] transition-all uppercase tracking-widest">
                  DOWNLOAD
                </a>
                <button onClick={() => setPreviewUrl(null)} className="px-5 py-2 bg-[#DC0000] text-white font-black text-xs rounded-xl hover:bg-[#b50000] transition-all uppercase tracking-widest">
                  TUTUP
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-[#030b2e] overflow-hidden">
              <object data={previewUrl} type="application/pdf" className="w-full h-full">
                <embed src={previewUrl} type="application/pdf" className="w-full h-full" />
              </object>
            </div>
          </div>
        </div>
      )}

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}