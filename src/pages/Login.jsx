import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Lock, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050E3C] flex items-center justify-center p-4">
        {/* Background mesh */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#DC0000]/10 blur-[130px]" />
          <div className="absolute bottom-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-[#002455]/60 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-1.5 uppercase tracking-tight">Login Berhasil!</h2>
          <p className="text-sm text-white/50 mb-7 font-medium italic">Sabar ya Daf, lagi disiapin dashboard-nya...</p>
          <Loader2 className="animate-spin text-green-400" size={28} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050E3C] flex items-center justify-center p-4 transition-colors">
      
      {/* BACKGROUND MESH */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#DC0000]/10 blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#002455]/70 blur-[110px]" />
        <div className="absolute top-[30%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#DC0000]/5 blur-[90px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* GLASS CARD */}
        <div className="bg-white/8 backdrop-blur-2xl rounded-2xl border border-white/15 shadow-2xl shadow-black/40 p-10 overflow-hidden relative">
          
          {/* Inner glow top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          {/* Logo area */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1 mb-6">
              <span className="text-2xl font-black text-white tracking-tight">TELKOM</span>
              <span className="text-2xl font-black text-[#DC0000] tracking-tight">SV</span>
            </div>
            <div className="h-px w-full bg-white/10 mb-6" />
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.3em]">
              Internal Supervision System
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <div className="flex items-center gap-3 bg-[#DC0000]/15 border border-[#DC0000]/30 text-red-300 text-xs font-semibold rounded-xl px-4 py-3 mb-6 backdrop-blur-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#DC0000]" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">
                Email Telkom
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#DC0000] transition-colors" size={17} />
                <input
                  type="email"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 bg-white/8 border rounded-xl outline-none transition-all text-white font-medium placeholder:text-white/25 text-sm focus:bg-white/12 focus:ring-2 focus:ring-[#DC0000]/30 ${errorMsg ? 'border-[#DC0000]/50' : 'border-white/12 focus:border-[#DC0000]/50'}`}
                  placeholder="dafa@telkom.co.id"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">
                Password Akun
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#DC0000] transition-colors" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-11 py-3 bg-white/8 border rounded-xl outline-none transition-all text-white font-medium placeholder:text-white/25 text-sm focus:bg-white/12 focus:ring-2 focus:ring-[#DC0000]/30 ${errorMsg ? 'border-[#DC0000]/50' : 'border-white/12 focus:border-[#DC0000]/50'}`}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              disabled={loading}
              className="w-full bg-[#DC0000] text-white py-3.5 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#b50000] active:scale-[0.98] transition-all shadow-lg shadow-[#DC0000]/30 disabled:opacity-60 flex items-center justify-center gap-3 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Tunggu bentar ya...
                </>
              ) : 'Masuk ke Dashboard'}
            </button>
          </form>

          {/* Bottom line glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <p className="mt-6 text-center text-[10px] font-bold text-white/20 uppercase tracking-widest">
          © 2026 Telkom SV Internal System
        </p>
      </div>
    </div>
  )
}