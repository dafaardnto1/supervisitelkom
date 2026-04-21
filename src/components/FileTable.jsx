import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Loader2, Check, X, Maximize2, FileUp, Upload } from 'lucide-react';

// --- IMPORT SWEETALERT2 ---
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function FileTable({ refreshKey, filterStatus, searchQuery, isSelectionMode, selectedIds, setSelectedIds }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFileId, setLoadingFileId] = useState(null);
  
  // State Modals
  const [previewUrl, setPreviewUrl] = useState(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, note: '', fileName: '' });
  
  // State Upload Ulang
  const [reuploadFile, setReuploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('files')
        .select(`*, mitra (nama_mitra), supervisor_note`)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') query = query.eq('status', filterStatus);
      if (searchQuery) query = query.ilike('file_name', `%${searchQuery}%`);

      const { data, error } = await query;
      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error("Gagal ambil data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [refreshKey, filterStatus, searchQuery]);

  // --- LOGIC APPROVE ---
  const handleApprove = async (id, fileName) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    MySwal.fire({
      title: <span className="text-gray-800 dark:text-white font-black text-xl tracking-tight text-left block w-full">Setujui Berkas?</span>,
      html: <p className="text-left text-gray-600 dark:text-gray-400 font-medium">Kamu akan menyetujui berkas <span className="text-green-600 font-bold">{fileName}</span>. Lanjutkan?</p>,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'YA, SETUJUI',
      cancelButtonText: 'BATAL',
      customClass: {
        confirmButton: 'bg-green-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-700 ml-3',
        cancelButton: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest',
        popup: 'rounded-[2.5rem] p-10 bg-white dark:bg-[#050E3C] border dark:border-white/10 shadow-2xl',
      },
      buttonsStyling: false,
      background: isDarkMode ? '#050E3C' : '#ffffff',
      backdrop: `rgba(5,14,60,0.5) backdrop-blur-sm`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase
          .from('files')
          .update({ status: 'approved', supervisor_note: 'Dokumen telah disetujui.' })
          .eq('id', id);
        if (!error) {
          MySwal.fire({ title: 'BERHASIL', text: 'Berkas telah disetujui.', icon: 'success', background: isDarkMode ? '#050E3C' : '#ffffff', customClass: { popup: 'rounded-[2.5rem]' } });
          fetchFiles();
        }
      }
    });
  };

  // --- LOGIC REJECT ---
  const handleReject = async (id, fileName) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const { value: note } = await MySwal.fire({
      title: <span className="text-gray-800 dark:text-white font-black text-xl tracking-tight text-left block w-full">Tolak & Beri Catatan</span>,
      input: 'textarea',
      inputPlaceholder: 'Tulis alasan penolakan di sini...',
      inputAttributes: { 'aria-label': 'Tulis alasan penolakan di sini' },
      showCancelButton: true,
      confirmButtonText: 'TOLAK BERKAS',
      cancelButtonText: 'BATAL',
      customClass: {
        confirmButton: 'bg-[#DC0000] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#b50000] ml-3',
        cancelButton: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest',
        popup: 'rounded-[2.5rem] p-10 bg-white dark:bg-[#050E3C] border dark:border-white/10 shadow-2xl',
        input: 'rounded-2xl border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white font-medium p-4 focus:ring-[#DC0000]/20'
      },
      buttonsStyling: false,
      background: isDarkMode ? '#050E3C' : '#ffffff',
      backdrop: `rgba(5,14,60,0.5) backdrop-blur-sm`,
      inputValidator: (value) => { if (!value) return 'Alasan penolakan wajib diisi!'; }
    });

    if (note) {
      const { error } = await supabase.from('files').update({ status: 'rejected', supervisor_note: note }).eq('id', id);
      if (!error) {
        MySwal.fire({ title: 'DITOLAK', text: 'Berkas telah dikembalikan untuk revisi.', icon: 'error', background: isDarkMode ? '#050E3C' : '#ffffff' });
        fetchFiles();
      }
    }
  };

  // --- LOGIC REUPLOAD ---
  const handleReupload = async (e) => {
    const file = e.target.files[0];
    if (!file || !reuploadFile) return;
    const isDarkMode = document.documentElement.classList.contains('dark');

    MySwal.fire({
      title: <span className="text-gray-800 dark:text-white font-black text-xl tracking-tight text-left block w-full">Konfirmasi Upload</span>,
      html: (
        <div className="text-left bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 mt-4">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">File Baru yang dipilih:</p>
          <p className="text-sm font-bold text-[#DC0000] break-all">{file.name}</p>
        </div>
      ),
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'YA, UPLOAD!',
      cancelButtonText: 'BATAL',
      customClass: {
        confirmButton: 'bg-[#DC0000] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#b50000] ml-3',
        cancelButton: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest',
        popup: 'rounded-[2.5rem] p-10 bg-white dark:bg-[#050E3C] border dark:border-white/10 shadow-2xl',
      },
      buttonsStyling: false,
      background: isDarkMode ? '#050E3C' : '#ffffff',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setUploading(true);
        MySwal.fire({
          title: <Loader2 className="animate-spin text-[#DC0000] mx-auto" size={48} />,
          html: <p className="text-gray-600 dark:text-gray-400 font-medium">Memperbarui berkas...</p>,
          showConfirmButton: false,
          allowOutsideClick: false,
          background: isDarkMode ? '#050E3C' : '#ffffff',
          customClass: { popup: 'rounded-[2.5rem] p-10' },
        });
        try {
          const fileName = `${Date.now()}_${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage.from('supervisi-files').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { error: updateError } = await supabase.from('files').update({ file_name: file.name, file_path: uploadData.path, status: 'pending', supervisor_note: null }).eq('id', reuploadFile.id);
          if (updateError) throw updateError;
          MySwal.fire({ title: 'SUKSES!', icon: 'success', background: isDarkMode ? '#050E3C' : '#ffffff' });
          setReuploadFile(null);
          fetchFiles();
        } catch (err) {
          MySwal.fire({ title: 'Gagal', text: err.message, icon: 'error' });
        } finally {
          setUploading(false);
        }
      } else { e.target.value = ""; }
    });
  };

  const handleOpenPreview = async (filePath, fileId) => {
    try {
      setLoadingFileId(fileId);
      const { data, error } = await supabase.storage.from('supervisi-files').createSignedUrl(filePath, 60);
      if (error) throw error;
      if (data?.signedUrl) setPreviewUrl(data.signedUrl);
    } catch (err) {
      alert("Gagal memuat preview: " + err.message);
    } finally {
      setLoadingFileId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-white/10 transition-colors">
      <Loader2 className="animate-spin text-[#DC0000]" size={40} />
    </div>
  );

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div 
          key={file.id} 
          className={`bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5 border shadow-sm transition-all ${
            selectedIds.includes(file.id) 
              ? 'border-[#DC0000]/50 ring-2 ring-[#DC0000]/15' 
              : 'border-slate-200/80 dark:border-white/10'
          }`}
        >
          {/* Selection mode checkbox */}
          {isSelectionMode && (
            <div className="mb-4 pb-3 border-b border-slate-100 dark:border-white/8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(file.id)} 
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, file.id]);
                    else setSelectedIds(selectedIds.filter(id => id !== file.id));
                  }} 
                  className="w-5 h-5 accent-[#DC0000] cursor-pointer rounded-lg" 
                />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih Berkas</span>
              </label>
            </div>
          )}

          {/* Icon dan Nama File */}
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-[#DC0000]/10 dark:bg-[#DC0000]/15 text-[#DC0000] rounded-xl shrink-0">
              <FileText size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#050E3C] dark:text-slate-200 leading-tight mb-2 break-words text-sm">
                {file.file_name}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => handleOpenPreview(file.file_path, file.id)} 
                  className="text-xs text-[#DC0000] font-black hover:underline uppercase tracking-wider flex items-center gap-1"
                >
                  {loadingFileId === file.id ? <Loader2 size={12} className="animate-spin" /> : <Maximize2 size={12}/>}
                  LIHAT PDF
                </button>
                {file.status === 'rejected' && file.supervisor_note && (
                  <button 
                    onClick={() => setNoteModal({ isOpen: true, note: file.supervisor_note, fileName: file.file_name })} 
                    className="text-xs text-[#002455] dark:text-blue-400 font-black hover:underline uppercase tracking-wider flex items-center gap-1"
                  >
                    LIHAT REVISI
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info Mitra dan Status */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50/80 dark:bg-white/5 rounded-xl border border-slate-100/80 dark:border-white/8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MITRA</p>
              <p className="text-sm font-bold text-[#050E3C] dark:text-slate-300">
                {file.mitra?.nama_mitra || '-'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">STATUS</p>
              <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                file.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                file.status === 'rejected' ? 'bg-[#DC0000]/10 text-[#DC0000] dark:bg-[#DC0000]/20' : 
                'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {file.status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/8">
            {file.status === 'pending' && (
              <div className="flex gap-3">
                <button 
                  onClick={() => handleApprove(file.id, file.file_name)} 
                  className="flex-1 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Check size={15} strokeWidth={3} /> SETUJUI
                </button>
                <button 
                  onClick={() => handleReject(file.id, file.file_name)} 
                  className="flex-1 py-2.5 bg-[#DC0000]/8 dark:bg-[#DC0000]/15 text-[#DC0000] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#DC0000] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <X size={15} strokeWidth={3} /> TOLAK
                </button>
              </div>
            )}
            {file.status === 'rejected' && (
              <button 
                onClick={() => setReuploadFile(file)} 
                className="w-full py-2.5 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 rounded-xl font-black text-xs uppercase hover:bg-orange-600 hover:text-white transition-all border border-orange-100 dark:border-orange-900/30 flex items-center justify-center gap-2"
              >
                <FileUp size={15} strokeWidth={3} /> UPLOAD ULANG BERKAS
              </button>
            )}
            {file.status === 'approved' && (
              <div className="py-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-center">
                <span className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  ✓ Telah Disetujui
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* MODAL UPLOAD ULANG — z-[9999] agar di atas sidebar */}
      {reuploadFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-[#050E3C] rounded-2xl w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[#050E3C] dark:text-white">Ganti Berkas</h3>
              <button onClick={() => setReuploadFile(null)} className="text-slate-400 hover:text-[#DC0000] transition-colors p-1">
                <X size={22}/>
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium text-left">
              Berkas yang diperbarui:<br/>
              <span className="text-[#DC0000] font-bold break-words">{reuploadFile.file_name}</span>
            </p>
            <label className="group cursor-pointer block">
              <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center hover:border-[#DC0000] hover:bg-[#DC0000]/5 transition-all">
                <Upload className="text-slate-300 group-hover:text-[#DC0000] mb-2 transition-colors" size={28} />
                <span className="text-xs font-black text-slate-400 group-hover:text-[#DC0000] uppercase tracking-widest text-center transition-colors">
                  Pilih PDF Baru
                </span>
                <input type="file" accept=".pdf" className="hidden" onChange={handleReupload} disabled={uploading} />
              </div>
            </label>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW PDF — z-[9999] agar di atas sidebar */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-[#050E3C] rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/5 flex-shrink-0">
              <h4 className="font-black text-[#050E3C] dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
                <FileText className="text-[#DC0000]" size={17}/> Pratinjau PDF
              </h4>
              <div className="flex gap-2">
                <a 
                  href={previewUrl} 
                  download 
                  className="px-4 py-2 bg-[#002455] text-white font-black text-xs rounded-xl hover:bg-[#001a3d] transition-all uppercase tracking-widest"
                >
                  DOWNLOAD PDF
                </a>
                <button 
                  onClick={() => setPreviewUrl(null)} 
                  className="px-5 py-2 bg-[#DC0000] text-white font-black text-xs rounded-xl hover:bg-[#b50000] transition-all uppercase tracking-widest"
                >
                  TUTUP
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-[#030b2e] overflow-hidden">
              <object data={previewUrl} type="application/pdf" className="w-full h-full">
                <embed src={previewUrl} type="application/pdf" className="w-full h-full" />
                <p className="text-center p-8 text-slate-500">
                  Browser tidak support preview PDF.{' '}
                  <a href={previewUrl} download className="text-[#DC0000] font-bold hover:underline">Download PDF</a>
                </p>
              </object>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTE REVISI — z-[9999] agar di atas sidebar */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-[#050E3C] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200 text-left">
            <div className="bg-[#002455] p-7 text-white relative">
              <div className="absolute -bottom-5 right-7 p-3.5 bg-white dark:bg-[#050E3C] rounded-xl shadow-lg text-[#002455] dark:text-blue-400">
                <FileText size={26} />
              </div>
              <h4 className="text-xl font-black tracking-tight">Catatan Revisi</h4>
            </div>
            <div className="p-7 pt-9">
              <div className="mb-5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  Nama Berkas
                </label>
                <p className="text-sm font-bold text-[#050E3C] dark:text-slate-300 truncate bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  {noteModal.fileName}
                </p>
              </div>
              <div className="mb-7">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  Pesan Supervisor
                </label>
                <div className="bg-[#002455]/8 dark:bg-[#002455]/30 border border-[#002455]/15 dark:border-[#002455]/40 p-4 rounded-xl">
                  <p className="text-[#050E3C] dark:text-slate-300 font-medium leading-relaxed italic text-sm">
                    "{noteModal.note}"
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setNoteModal({ isOpen: false, note: '', fileName: '' })} 
                className="w-full py-3.5 bg-[#050E3C] dark:bg-[#002455] text-white font-black rounded-xl hover:bg-[#002455] transition-all uppercase text-xs tracking-widest"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}