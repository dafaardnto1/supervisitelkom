import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2, Upload, Check, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [mitraId, setMitraId] = useState('');
  const [mitraOptions, setMitraOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMitra, setFetchingMitra] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- CONFIG VALIDASI ---
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  useEffect(() => {
    if (isOpen) {
      const fetchMitra = async () => {
        setFetchingMitra(true);
        const { data, error } = await supabase
          .from('mitra')
          .select('id, nama_mitra')
          .order('nama_mitra', { ascending: true });
        if (!error) setMitraOptions(data || []);
        setFetchingMitra(false);
      };
      fetchMitra();
    } else {
      setFile(null);
      setMitraId('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 1. Validasi Ekstensi & MIME Type
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    const isValidType = ALLOWED_MIME_TYPES.includes(selectedFile.type) || ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isValidType) {
      MySwal.fire({
        title: <span className="text-gray-800 font-black tracking-tight uppercase">Format Ditolak</span>,
        html: <p className="text-sm font-medium text-gray-500 italic">Hanya PDF, Word, atau Excel yang diizinkan ya, Daf.</p>,
        icon: 'error',
        confirmButtonText: 'OKE SIAP',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-red-200',
          popup: 'rounded-[2.5rem] p-10',
        },
        buttonsStyling: false
      });
      e.target.value = '';
      setFile(null);
      return;
    }

    // 2. Validasi Ukuran (100 MB)
    if (selectedFile.size > MAX_FILE_SIZE) {
      MySwal.fire({
        title: <span className="text-gray-800 font-black tracking-tight uppercase">File Kegedean!</span>,
        html: <p className="text-sm font-medium text-gray-500 italic">Maksimal upload 100 MB. File lu { (selectedFile.size / (1024 * 1024)).toFixed(2) } MB.</p>,
        icon: 'warning',
        confirmButtonText: 'SIAP, KECILIN DULU',
        customClass: {
          confirmButton: 'bg-amber-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-amber-100',
          popup: 'rounded-[2.5rem] p-10',
        },
        buttonsStyling: false
      });
      e.target.value = '';
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !mitraId) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `berkas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('supervisi-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('files')
        .insert([{
          file_name: file.name,
          file_path: filePath,
          mitra_id: mitraId,
          status: 'pending',
      }]);

      if (dbError) throw dbError;

      setIsSuccess(true); 
      setTimeout(() => {
        onUploadSuccess(); 
        onClose(); 
      }, 2000);

    } catch (err) {
      alert("Gagal Upload: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
      <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 border dark:border-gray-800">
        
        {/* MODAL SUKSES OVERLAY */}
        {isSuccess && (
          <div className="absolute inset-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md flex flex-col items-center justify-center z-[60] animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-2xl shadow-green-200">
              <Check size={48} strokeWidth={4} />
            </div>
            <h4 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight uppercase italic">Berhasil!</h4>
            <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Menunggu Supervisi Admin</p>
            <div className="mt-10 w-48 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-[progress_2s_ease-in-out]"></div>
            </div>
          </div>
        )}

        {/* HEADER MODAL */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tighter uppercase italic">Upload Berkas</h3>
            <div className="h-1 w-8 bg-red-600 mt-1 rounded-full shadow-[0_0_10px_#dc2626]"></div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-600 rounded-2xl transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-8">
          {/* SELECT MITRA */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1 block">Entitas Mitra</label>
            <select 
              value={mitraId}
              onChange={(e) => setMitraId(e.target.value)}
              className="w-full p-5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-black text-xs uppercase tracking-widest text-gray-700 dark:text-white appearance-none cursor-pointer"
              required
            >
              <option value="">-- Pilih Mitra Kerja --</option>
              {fetchingMitra ? (
                <option disabled>Syncing database...</option>
              ) : (
                mitraOptions.map((m) => (
                  <option key={m.id} value={m.id}>{m.nama_mitra}</option>
                ))
              )}
            </select>
          </div>

          {/* INPUT FILE */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1 block text-left">Dokumen Supervisi</label>
            <div className="flex items-center gap-3">
              <label className={`flex-1 flex items-center justify-between p-5 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${file ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-red-400 bg-gray-50 dark:bg-gray-800'}`}>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf, .doc, .docx, .xls, .xlsx" 
                  onChange={handleFileChange} 
                />
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-all ${file ? 'bg-green-500 text-white shadow-xl rotate-12' : 'bg-white dark:bg-gray-700 text-red-600 shadow-sm group-hover:scale-110'}`}>
                    <Upload size={20} strokeWidth={3} />
                  </div>
                  <div className="max-w-[180px]">
                    <p className="font-black text-[11px] uppercase tracking-widest text-gray-700 dark:text-gray-200 truncate">
                      {file ? file.name : "Pilih Dokumen"}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">MAX: 50MB</p>
                  </div>
                </div>
              </label>

              {file && (
                <button type="button" onClick={() => setFile(null)} className="p-5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-[1.5rem] hover:bg-red-600 hover:text-white transition-all border border-red-100 dark:border-red-900/30 group">
                  <Trash2 size={20} className="group-hover:animate-bounce" />
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file || !mitraId}
            className={`w-full py-5 rounded-[2rem] font-black text-white transition-all flex items-center justify-center gap-3 shadow-2xl uppercase text-[10px] tracking-[0.3em] ${
              loading || !file || !mitraId 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed shadow-none text-gray-300' 
              : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none active:scale-95'
            }`}
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Lagi Upload...</span>
                </>
            ) : (
                <>
                    <Check size={20} strokeWidth={4} /> 
                    <span>Kirim Dokumen</span>
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}