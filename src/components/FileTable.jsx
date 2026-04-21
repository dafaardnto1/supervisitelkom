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

  // --- LOGIC APPROVE DENGAN SWEETALERT2 ---
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
        popup: 'rounded-[2.5rem] p-10 bg-white dark:bg-[#111827] border dark:border-gray-800 shadow-2xl',
      },
      buttonsStyling: false,
      background: isDarkMode ? '#111827' : '#ffffff',
      backdrop: `rgba(0,0,0,0.6) backdrop-blur-sm`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase
          .from('files')
          .update({ status: 'approved', supervisor_note: 'Dokumen telah disetujui.' })
          .eq('id', id);
        
        if (!error) {
          MySwal.fire({
            title: 'BERHASIL',
            text: 'Berkas telah disetujui.',
            icon: 'success',
            background: isDarkMode ? '#111827' : '#ffffff',
            customClass: { popup: 'rounded-[2.5rem] bg-white dark:bg-[#111827]' }
          });
          fetchFiles();
        }
      }
    });
  };

  // --- LOGIC REJECT DENGAN SWEETALERT2 ---
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
        confirmButton: 'bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 ml-3',
        cancelButton: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest',
        popup: 'rounded-[2.5rem] p-10 bg-white dark:bg-[#111827] border dark:border-gray-800 shadow-2xl',
        input: 'rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-medium p-4 focus:ring-red-500/20'
      },
      buttonsStyling: false,
      background: isDarkMode ? '#111827' : '#ffffff',
      backdrop: `rgba(0,0,0,0.6) backdrop-blur-sm`,
      inputValidator: (value) => {
        if (!value) return 'Alasan penolakan wajib diisi!';
      }
    });

    if (note) {
      const { error } = await supabase
        .from('files')
        .update({ status: 'rejected', supervisor_note: note })
        .eq('id', id);
      
      if (!error) {
        MySwal.fire({
          title: 'DITOLAK',
          text: 'Berkas telah dikembalikan untuk revisi.',
          icon: 'error',
          background: isDarkMode ? '#111827' : '#ffffff',
          customClass: { popup: 'rounded-[2.5rem] bg-white dark:bg-[#111827]' }
        });
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
        <div className="text-left bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border dark:border-gray-800 mt-4">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">File Baru yang dipilih:</p>
          <p className="text-sm font-bold text-red-600 break-all">{file.name}</p>
        </div>
      ),
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'YA, UPLOAD!',
      cancelButtonText: 'BATAL',
      customClass: {
        confirmButton: 'bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 ml-3',
        cancelButton: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest',
        popup: 'rounded-[2.5rem] p-10 bg-white dark:bg-[#111827] border dark:border-gray-800 shadow-2xl',
      },
      buttonsStyling: false,
      background: isDarkMode ? '#111827' : '#ffffff',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setUploading(true);
        MySwal.fire({
          title: <Loader2 className="animate-spin text-red-600 mx-auto" size={48} />,
          html: <p className="text-gray-600 dark:text-gray-400 font-medium">Memperbarui berkas...</p>,
          showConfirmButton: false,
          allowOutsideClick: false,
          background: isDarkMode ? '#111827' : '#ffffff',
          customClass: { popup: 'rounded-[2.5rem] p-10 bg-white dark:bg-[#111827]' },
        });

        try {
          const fileName = `${Date.now()}_${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage.from('supervisi-files').upload(fileName, file);
          if (uploadError) throw uploadError;

          const { error: updateError } = await supabase.from('files').update({
              file_name: file.name,
              file_path: uploadData.path,
              status: 'pending',
              supervisor_note: null
          }).eq('id', reuploadFile.id);

          if (updateError) throw updateError;
          MySwal.fire({ title: 'SUKSES!', icon: 'success', background: isDarkMode ? '#111827' : '#ffffff' });
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
    <div className="flex justify-center items-center h-64 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <>
      {/* TABLET & DESKTOP VIEW - Scroll horizontal jika perlu */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden text-left transition-colors hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-left text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {isSelectionMode && <th className="p-6 w-10"></th>}
                <th className="p-6 min-w-[250px]">Dokumen</th>
                <th className="p-6 min-w-[150px]">Mitra</th>
                <th className="p-6 min-w-[100px]">Status</th>
                <th className="p-6 min-w-[200px] text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {files.map((file) => (
                <tr key={file.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all group ${selectedIds.includes(file.id) ? 'bg-red-50/40 dark:bg-red-900/20' : ''}`}>
                  {isSelectionMode && (
                    <td className="p-6">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(file.id)} 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, file.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== file.id));
                        }} 
                        className="w-5 h-5 accent-red-600 cursor-pointer rounded-lg" 
                      />
                    </td>
                  )}

                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-200 leading-none mb-2 text-left break-words">{file.file_name}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <button 
                            onClick={() => handleOpenPreview(file.file_path, file.id)} 
                            className="text-[10px] text-red-500 dark:text-red-400 font-black hover:underline uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
                          >
                            {loadingFileId === file.id ? <Loader2 size={10} className="animate-spin" /> : <Maximize2 size={10}/>}
                            Lihat PDF
                          </button>
                          {file.status === 'rejected' && file.supervisor_note && (
                            <button 
                              onClick={() => setNoteModal({ isOpen: true, note: file.supervisor_note, fileName: file.file_name })} 
                              className="text-[10px] text-blue-500 dark:text-blue-400 font-black hover:underline uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
                            >
                              <span className="text-gray-300 dark:text-gray-600">•</span> Lihat Revisi
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-6 font-bold text-gray-500 dark:text-gray-400 text-left whitespace-nowrap">
                    {file.mitra?.nama_mitra || '-'}
                  </td>
                  
                  <td className="p-6 text-left">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-block whitespace-nowrap ${
                      file.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                      file.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                      'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {file.status}
                    </span>
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {file.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(file.id, file.file_name)} 
                            className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shrink-0"
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleReject(file.id, file.file_name)} 
                            className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shrink-0"
                          >
                            <X size={18} strokeWidth={3} />
                          </button>
                        </>
                      )}
                      {file.status === 'rejected' && (
                        <button 
                          onClick={() => setReuploadFile(file)} 
                          className="px-4 py-2 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 rounded-xl font-black text-[10px] uppercase hover:bg-orange-600 hover:text-white transition-all border border-orange-100 dark:border-orange-900/30 flex items-center gap-2 whitespace-nowrap"
                        >
                          <FileUp size={14} strokeWidth={3} /> Upload Ulang
                        </button>
                      )}
                      {file.status === 'approved' && (
                        <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest whitespace-nowrap">
                          Selesai
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE VIEW - Card Layout */}
      <div className="block md:hidden space-y-4">
        {files.map((file) => (
          <div 
            key={file.id} 
            className={`bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm transition-all ${
              selectedIds.includes(file.id) ? 'border-red-500 dark:border-red-500 ring-2 ring-red-500/20' : ''
            }`}
          >
            {/* Selection mode checkbox untuk mobile */}
            {isSelectionMode && (
              <div className="mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(file.id)} 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds([...selectedIds, file.id]);
                      else setSelectedIds(selectedIds.filter(id => id !== file.id));
                    }} 
                    className="w-5 h-5 accent-red-600 cursor-pointer rounded-lg" 
                  />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pilih Berkas</span>
                </label>
              </div>
            )}

            {/* Header Card */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 dark:text-gray-200 leading-tight mb-2 break-words">
                  {file.file_name}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button 
                    onClick={() => handleOpenPreview(file.file_path, file.id)} 
                    className="text-xs text-red-500 dark:text-red-400 font-black hover:underline uppercase tracking-wider flex items-center gap-1"
                  >
                    {loadingFileId === file.id ? <Loader2 size={12} className="animate-spin" /> : <Maximize2 size={12}/>}
                    Lihat PDF
                  </button>
                  {file.status === 'rejected' && file.supervisor_note && (
                    <button 
                      onClick={() => setNoteModal({ isOpen: true, note: file.supervisor_note, fileName: file.file_name })} 
                      className="text-xs text-blue-500 dark:text-blue-400 font-black hover:underline uppercase tracking-wider flex items-center gap-1"
                    >
                      <span className="text-gray-300 dark:text-gray-600">•</span> Lihat Revisi
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Detail Card */}
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mitra</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 text-right">
                  {file.mitra?.nama_mitra || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-block ${
                  file.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                  file.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {file.status}
                </span>
              </div>
            </div>

            {/* Action Buttons Mobile */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              {file.status === 'pending' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApprove(file.id, file.file_name)} 
                    className="flex-1 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={16} strokeWidth={3} /> Setujui
                  </button>
                  <button 
                    onClick={() => handleReject(file.id, file.file_name)} 
                    className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <X size={16} strokeWidth={3} /> Tolak
                  </button>
                </div>
              )}
              {file.status === 'rejected' && (
                <button 
                  onClick={() => setReuploadFile(file)} 
                  className="w-full py-3 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 rounded-xl font-black text-xs uppercase hover:bg-orange-600 hover:text-white transition-all border border-orange-100 dark:border-orange-900/30 flex items-center justify-center gap-2"
                >
                  <FileUp size={16} strokeWidth={3} /> Upload Ulang Berkas
                </button>
              )}
              {file.status === 'approved' && (
                <div className="py-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl text-center">
                  <span className="text-xs font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                    ✓ Telah Disetujui
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL UPLOAD ULANG --- */}
      {reuploadFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
          <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border dark:border-gray-800 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800 dark:text-white">Ganti Berkas</h3>
              <button onClick={() => setReuploadFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24}/>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6 font-medium text-left">
              Berkas yang diperbarui: <br/>
              <span className="text-red-600 font-bold break-words">{reuploadFile.file_name}</span>
            </p>
            <label className="group cursor-pointer block">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-10 flex flex-col items-center justify-center hover:border-red-500 hover:bg-red-50/30 transition-all">
                <Upload className="text-gray-300 group-hover:text-red-500 mb-2" size={32} />
                <span className="text-xs font-black text-gray-400 group-hover:text-red-600 uppercase tracking-widest text-center">
                  Pilih PDF Baru
                </span>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={handleReupload} 
                  disabled={uploading} 
                />
              </div>
            </label>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW PDF */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-[#111827] rounded-[2rem] w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h4 className="font-black text-gray-800 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
                <FileText className="text-red-500" size={18}/> Pratinjau
              </h4>
              <button 
                onClick={() => setPreviewUrl(null)} 
                className="px-6 py-2 bg-red-600 text-white font-black text-xs rounded-xl hover:bg-red-700 transition-all uppercase tracking-widest"
              >
                TUTUP
              </button>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900">
              <iframe 
                src={`${previewUrl}#toolbar=0`} 
                className="w-full h-full border-none" 
                title="PDF Preview" 
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTE REVISI */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[210] p-4">
          <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border dark:border-gray-800 animate-in fade-in zoom-in duration-200 text-left">
            <div className="bg-blue-600 p-8 text-white relative">
              <div className="absolute -bottom-6 right-8 p-4 bg-white dark:bg-[#111827] rounded-2xl shadow-lg text-blue-600 dark:text-blue-400">
                <FileText size={32} />
              </div>
              <h4 className="text-2xl font-black tracking-tight">Catatan Revisi</h4>
            </div>
            <div className="p-8 pt-10">
              <div className="mb-6">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">
                  Nama Berkas
                </label>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  {noteModal.fileName}
                </p>
              </div>
              <div className="mb-8">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">
                  Pesan Supervisor
                </label>
                <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-5 rounded-2xl">
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                    "{noteModal.note}"
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setNoteModal({ isOpen: false, note: '', fileName: '' })} 
                className="w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:bg-black dark:hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}