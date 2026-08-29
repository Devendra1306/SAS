import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User, ArrowRight, ShieldCheck, ScanFace, Sparkles, CheckCircle2 } from 'lucide-react'
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
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#2170e4]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#0058be]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split Container */}
      <motion.main
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-3xl border border-[#e2e8f0] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] overflow-hidden min-h-[580px] z-10"
      >
        {/* Branding Side (Left on Desktop, Top on Mobile) */}
        <section className="w-full md:w-1/2 relative flex flex-col justify-between p-8 md:p-12 bg-[#eff4ff] border-b md:border-b-0 md:border-r border-[#e2e8f0] overflow-hidden">
          {/* Subtle decorative grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#2170e4_1px,transparent_1px)] bg-[size:20px_20px] opacity-15 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-10 h-10 bg-[#0b1c30] text-white rounded-xl flex items-center justify-center shadow-md"
            >
              <ScanFace className="w-5 h-5" />
            </motion.div>
            <div>
              <h1 className="font-display text-xl font-bold text-[#0b1c30] tracking-tight">SAS Portal</h1>
              <span className="text-[11px] font-semibold text-[#0058be]">Staff & Administrator Gateway</span>
            </div>
          </div>

          <div className="relative z-10 my-8 md:my-0 space-y-3">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#0b1c30] leading-tight tracking-tight">
              Intelligent<br />Attendance<br />Tracking.
            </h2>
            <p className="text-sm text-[#45464d] max-w-sm leading-relaxed">
              Secure biometric access for Administrators and Faculty. Role-based permissions and session tokens are assigned dynamically.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-[#0058be]">
            <ShieldCheck className="w-4 h-4 text-[#0058be]" />
            <span>Enterprise-grade biometric security infrastructure.</span>
          </div>
        </section>

        {/* Login Form Side */}
        <section className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center bg-white">
          <div className="w-full max-w-sm space-y-6">
            {/* Headers */}
            <div className="text-left space-y-1">
              <h2 className="font-display text-2xl font-bold text-[#0b1c30] tracking-tight">Welcome Back</h2>
              <p className="text-xs text-[#64748b]">Please enter your staff credentials to access the portal.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username/Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="username">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    required
                    placeholder="admin or FAC001"
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
                  <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="password">
                    Password
                  </label>
                  <span className="text-xs text-[#0058be] hover:underline cursor-pointer">Forgot password?</span>
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

              {/* Action Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full py-2.5 bg-[#0b1c30] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex justify-center items-center gap-1.5 mt-2 shadow-[0_2px_8px_rgba(11,28,48,0.25)]"
                >
                  <span>LOGIN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            </form>

            {/* Quick Demo Autofill */}
            <div className="pt-3 border-t border-[#e2e8f0] space-y-2">
              <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider text-center">
                1-Click Active Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillAdmin}
                  className="border-[#e2e8f0] bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-8 font-medium rounded-lg"
                >
                  Admin Auto-Fill
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillFaculty}
                  className="border-[#e2e8f0] bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-8 font-medium rounded-lg"
                >
                  Faculty Auto-Fill
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-[#e2e8f0]"></div>
              <span className="mx-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-[#e2e8f0]"></div>
            </div>

            {/* Alternative Action */}
            <div className="text-center">
              <Link
                to="/student-login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0058be] hover:text-[#2170e4] transition-colors"
              >
                <span>Are you a Student? Go to Student Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  )
}
