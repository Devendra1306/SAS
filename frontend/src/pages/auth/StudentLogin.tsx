import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, GraduationCap, ArrowRight, ShieldCheck, UserCheck, Sparkles, ChevronRight, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function StudentLogin() {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { studentLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await studentLogin({ student_id_or_email: studentId, password })
      toast.success('Welcome to Student Portal!')
      navigate('/student/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid Student ID or password')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoStudent = () => {
    setStudentId('23A81A4301')
    setPassword('Student@123')
    toast.success('Demo Student credentials populated')
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-[#059669] selection:text-white">
      {/* Soft Glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#059669]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#0058be]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Split Container */}
      <motion.main
        initial={{ opacity: 0, scale: 0.97, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-3xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_36px_-4px_rgba(5,150,105,0.08)] overflow-hidden min-h-[590px] z-10 corner-crosshair"
      >
        {/* Branding Side (Left on Desktop, Top on Mobile) */}
        <section className="w-full md:w-1/2 relative flex flex-col justify-between p-8 md:p-12 bg-gradient-to-b from-[#062c21] to-[#041d16] text-white border-b md:border-b-0 md:border-r border-emerald-950 overflow-hidden">
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.08 }}
                className="w-10 h-10 bg-[#059669] text-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-[#10b981] transition-colors"
              >
                <GraduationCap className="w-6 h-6" />
              </motion.div>
              <div>
                <h1 className="font-display text-lg font-extrabold text-white tracking-tight">SAS</h1>
                <span className="text-[10px] font-mono text-[#a7f3d0] tracking-wide block">Student Portal</span>
              </div>
            </Link>

            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-700/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STUDENT HUB
            </span>
          </div>

          {/* Middle Pitch */}
          <div className="relative z-10 my-10 md:my-0 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#a7f3d0] font-mono font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Attendance Telemetry</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Track Your<br />Academic<br />Attendance.
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] max-w-sm leading-relaxed">
              View your live biometric logs, subject percentages, and semester targets verified via facial recognition.
            </p>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 flex items-center gap-2.5 text-xs font-mono text-[#a7f3d0]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted Biometric Index · Student Records Safe</span>
          </div>
        </section>

        {/* Student Login Form Side (Right) */}
        <section className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center bg-white">
          <div className="w-full max-w-sm space-y-6">
            {/* Headers */}
            <div className="text-left space-y-1">
              <h2 className="font-display text-2xl font-bold text-[#0b1c30] tracking-tight">Student Sign In</h2>
              <p className="text-xs text-[#64748b]">Enter your registered Student ID to access your personal dashboard.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0b1c30]" htmlFor="studentId">
                  Student ID / Roll Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                  </div>
                  <Input
                    id="studentId"
                    name="studentId"
                    required
                    placeholder="e.g. 23A81A4301"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-[#059669] text-sm text-[#0b1c30]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-[#0b1c30]" htmlFor="password">
                    Password
                  </label>
                  <span className="text-xs text-[#059669] hover:underline cursor-pointer font-medium">Need help?</span>
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
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-[#059669] text-sm text-[#0b1c30]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full py-2.5 bg-[#059669] text-white rounded-xl text-xs font-bold hover:bg-[#047857] transition-all flex justify-center items-center gap-1.5 mt-2 shadow-[0_2px_8px_rgba(5,150,105,0.3)]"
                >
                  <span>VIEW ATTENDANCE DASHBOARD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            </form>

            {/* 1-Click Demo Credential */}
            <div className="pt-4 border-t border-[#e2e8f0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDemoStudent}
                className="w-full border-[#e2e8f0] bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#ecfdf5] hover:text-[#059669] text-xs h-9 font-semibold rounded-xl"
              >
                <span className="w-2 h-2 rounded-full bg-[#059669] mr-2 shrink-0" />
                Auto-Fill Demo Student (23A81A4301)
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-[#e2e8f0]"></div>
              <span className="mx-3 text-[10px] font-mono font-bold text-[#94a3b8] uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-[#e2e8f0]"></div>
            </div>

            {/* Switch to Staff Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0058be] hover:text-[#2170e4] transition-colors"
              >
                <span>Faculty or Administrator? Switch to Staff Login</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  )
}
