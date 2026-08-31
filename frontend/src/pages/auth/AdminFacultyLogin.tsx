import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, ArrowRight, ShieldCheck, ScanFace, Sparkles, CheckCircle2, Shield, KeyRound, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AdminFacultyLogin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login({ username_or_email: usernameOrEmail, password })
      toast.success('Successfully authenticated!')
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (data.role === 'FACULTY') {
        navigate('/faculty/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  const fillAdmin = () => {
    setUsernameOrEmail('admin')
    setPassword('Admin@SAS2024')
    toast.success('Admin demo credentials populated')
  }

  const fillFaculty = () => {
    setUsernameOrEmail('FAC001')
    setPassword('Faculty@123')
    toast.success('Faculty demo credentials populated')
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-[#2170e4] selection:text-white">
      {/* Layered Atmospheric Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2170e4]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0058be]/12 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.main
        initial={{ opacity: 0, scale: 0.97, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-3xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_36px_-4px_rgba(0,88,190,0.08)] overflow-hidden min-h-[590px] z-10 corner-crosshair"
      >
        {/* Branding Side (Left on Desktop, Top on Mobile) */}
        <section className="w-full md:w-1/2 relative flex flex-col justify-between p-8 md:p-12 bg-gradient-to-b from-[#0b1c30] to-[#0d223a] text-white border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2170e4]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.08 }}
                className="w-10 h-10 bg-[#0058be] text-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-[#2170e4] transition-colors"
              >
                <ScanFace className="w-5 h-5" />
              </motion.div>
              <div>
                <h1 className="font-display text-lg font-extrabold text-white tracking-tight">SAS</h1>
                <span className="text-[10px] font-mono text-[#93c5fd] tracking-wide block">Staff Gateway</span>
              </div>
            </Link>

            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AUTH ONLINE
            </span>
          </div>

          {/* Middle Pitch */}
          <div className="relative z-10 my-10 md:my-0 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#93c5fd] font-mono font-medium">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Role-Based Cryptographic Access</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Intelligent<br />Classroom<br />Control.
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] max-w-sm leading-relaxed">
              Administrative telemetry, roster management, and AI-powered roll call sessions for authorized institutional personnel.
            </p>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 flex items-center gap-2.5 text-xs font-mono text-[#93c5fd]">
            <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
            <span>Argon2id Salted · JWT Stateless Session</span>
          </div>
        </section>

        {/* Login Form Side (Right) */}
        <section className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center bg-white">
          <div className="w-full max-w-sm space-y-6">
            {/* Headers */}
            <div className="text-left space-y-1">
              <h2 className="font-display text-2xl font-bold text-[#0b1c30] tracking-tight">Staff Authentication</h2>
              <p className="text-xs text-[#64748b]">Enter your institutional administrator or faculty credentials.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username/Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0b1c30]" htmlFor="username">
                  Username or Institutional ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    required
                    placeholder="e.g. admin or FAC001"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#2170e4] focus:border-[#2170e4] text-sm text-[#0b1c30]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-[#0b1c30]" htmlFor="password">
                    Password
                  </label>
                  <span className="text-xs text-[#0058be] hover:underline cursor-pointer font-medium">Forgot key?</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#2170e4] focus:border-[#2170e4] text-sm text-[#0b1c30]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full py-2.5 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#004395] transition-all flex justify-center items-center gap-1.5 mt-2 shadow-[0_2px_8px_rgba(0,88,190,0.3)]"
                >
                  <span>AUTHORIZE & ENTER</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            </form>

            {/* 1-Click Demo Credentials */}
            <div className="pt-4 border-t border-[#e2e8f0] space-y-2.5">
              <p className="text-[10px] font-mono font-bold text-[#64748b] uppercase tracking-wider text-center">
                1-Click Preset Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillAdmin}
                  className="border-[#e2e8f0] bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#0058be] text-xs h-8.5 font-semibold rounded-xl"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0058be] mr-1.5 shrink-0" />
                  Admin Auto-Fill
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillFaculty}
                  className="border-[#e2e8f0] bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#7c3aed] text-xs h-8.5 font-semibold rounded-xl"
                >
                  <span className="w-2 h-2 rounded-full bg-[#7c3aed] mr-1.5 shrink-0" />
                  Faculty Auto-Fill
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-[#e2e8f0]"></div>
              <span className="mx-3 text-[10px] font-mono font-bold text-[#94a3b8] uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-[#e2e8f0]"></div>
            </div>

            {/* Alternative Student Portal Link */}
            <div className="text-center">
              <Link
                to="/student-login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0058be] hover:text-[#2170e4] transition-colors"
              >
                <span>Are you a Student? Switch to Student Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  )
}
