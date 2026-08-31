import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ScanFace, ArrowRight, ShieldCheck, Database,
  Lock, BarChart3, Clock, CheckCircle2, Cpu, Zap, Award,
  MapPin, Check, Sparkles, UserCheck, Eye, Users, GraduationCap,
  BookOpen, TrendingUp, ChevronRight, Play, Shield, Camera,
  Unlock, Navigation, Brain, Server
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { motion, useInView, type Variants } from 'framer-motion'

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.0 } },
}

// ─── InView Wrapper ───────────────────────────────────────────────────────────
function InViewSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eff4ff] border border-[#dce9ff] text-[#0058be] text-xs font-bold tracking-wide uppercase">
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [workflowStep, setWorkflowStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflowStep(prev => (prev + 1) % 4)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  const workflowSteps = [
    {
      icon: Navigation,
      color: '#0058be',
      bg: 'bg-[#eff4ff]',
      border: 'border-[#dce9ff]',
      label: 'LOCATION VERIFIED',
      sub: '32m from classroom',
      status: 'verified',
      statusColor: 'text-[#0058be]',
      statusBg: 'bg-[#eff4ff] border-[#dce9ff]',
    },
    {
      icon: Unlock,
      color: '#0d9488',
      bg: 'bg-[#f0fdf9]',
      border: 'border-[#99f6e4]',
      label: 'ATTENDANCE UNLOCKED',
      sub: 'Camera access granted',
      status: 'unlocked',
      statusColor: 'text-[#0d9488]',
      statusBg: 'bg-[#f0fdf9] border-[#99f6e4]',
    },
    {
      icon: Camera,
      color: '#7c3aed',
      bg: 'bg-[#f5f3ff]',
      border: 'border-[#ddd6fe]',
      label: 'FACE RECOGNIZED',
      sub: 'Devendra Sagar · 98.6% match',
      status: 'matched',
      statusColor: 'text-[#7c3aed]',
      statusBg: 'bg-[#f5f3ff] border-[#ddd6fe]',
    },
    {
      icon: CheckCircle2,
      color: '#059669',
      bg: 'bg-[#ecfdf5]',
      border: 'border-[#a7f3d0]',
      label: 'ATTENDANCE LOGGED',
      sub: 'PRESENT · 09:02 AM',
      status: 'present',
      statusColor: 'text-[#059669]',
      statusBg: 'bg-[#ecfdf5] border-[#a7f3d0]',
    },
  ]

  const howItWorksSteps = [
    {
      num: '01',
      icon: Navigation,
      title: 'Faculty Reaches Classroom',
      desc: 'Faculty member opens the app and navigates to their subject session.',
      color: '#0058be',
    },
    {
      num: '02',
      icon: MapPin,
      title: 'GPS Location Verified',
      desc: 'The system confirms the device is within the required classroom radius before proceeding.',
      color: '#2170e4',
    },
    {
      num: '03',
      icon: Camera,
      title: 'Attendance Camera Unlocks',
      desc: 'Only after location confirmation does the live camera session become available.',
      color: '#7c3aed',
    },
    {
      num: '04',
      icon: ScanFace,
      title: 'AI Detects Students',
      desc: "Each student's face is detected, checked for liveness, and vectorized in real time.",
      color: '#0d9488',
    },
    {
      num: '05',
      icon: Brain,
      title: 'Instant Identity Match',
      desc: 'The face vector is matched against registered students in milliseconds.',
      color: '#d97706',
    },
    {
      num: '06',
      icon: Server,
      title: 'Attendance Recorded',
      desc: 'Results are saved instantly. Admins, faculty, and students see attendance in real time.',
      color: '#059669',
    },
  ]

  const roles = [
    {
      role: 'ADMIN',
      icon: Shield,
      color: 'text-[#0058be]',
      iconBg: 'bg-[#eff4ff]',
      accent: '#0058be',
      title: 'Institutional Control',
      desc: 'Manage students, faculty, subjects, and departments. View system-wide attendance analytics, flag defaulters, and identify honour roll students.',
      features: ['Student & faculty directory', 'Attendance analytics dashboard', 'Low & high attendance reports', 'System configuration'],
      cta: 'Admin Login',
      href: '/login',
    },
    {
      role: 'FACULTY',
      icon: ScanFace,
      color: 'text-[#7c3aed]',
      iconBg: 'bg-[#f5f3ff]',
      accent: '#7c3aed',
      title: 'Conduct Attendance',
      desc: 'Verify your classroom location, then start an AI-powered attendance session. The camera identifies students automatically — no roll calls needed.',
      features: ['Location-locked sessions', 'Live face recognition', 'Per-subject attendance reports', 'Full attendance history'],
      cta: 'Faculty Login',
      href: '/login',
    },
    {
      role: 'STUDENT',
      icon: GraduationCap,
      color: 'text-[#059669]',
      iconBg: 'bg-[#ecfdf5]',
      accent: '#059669',
      title: 'Track Your Attendance',
      desc: "View today's schedule, subject-wise performance, and monthly trends. Know exactly where you stand before it affects your academics.",
      features: ["Today's class sessions", 'Subject-wise percentage', 'Monthly trend charts', 'Full attendance history'],
      cta: 'Student Portal',
      href: '/student-login',
    },
  ]

  const features = [
    {
      icon: ScanFace,
      title: 'AI Face Recognition',
      desc: 'Students are verified one by one in real time directly from the classroom camera feed.',
      tag: 'ArcFace',
    },
    {
      icon: MapPin,
      title: 'Classroom Location Verification',
      desc: 'Attendance sessions can only begin once the faculty device is confirmed inside the required radius.',
      tag: 'GPS',
    },
    {
      icon: Cpu,
      title: 'Fast Student Matching',
      desc: 'Searches thousands of enrolled student biometric vectors in under 50 milliseconds.',
      tag: 'Pinecone',
    },
    {
      icon: ShieldCheck,
      title: 'Anti-Proxy Protection',
      desc: 'Liveness detection and quality filters reject photos, videos, and low-quality impersonation attempts.',
      tag: 'Anti-Spoofing',
    },
    {
      icon: BarChart3,
      title: 'Live Attendance Analytics',
      desc: 'Real-time dashboards with weekly trends, department breakdowns, and automatic defaulter alerts.',
      tag: 'Analytics',
    },
    {
      icon: Lock,
      title: 'Admin, Faculty & Student Access',
      desc: 'Three independent portals with role-based permissions, Argon2 passwords, and JWT sessions.',
      tag: 'RBAC',
    },
  ]

  const techStack = [
    { name: 'YOLOv8', desc: 'Face detection' },
    { name: 'ArcFace 512-D', desc: 'Embedding model' },
    { name: 'Pinecone', desc: 'Vector similarity' },
    { name: 'MongoDB Atlas', desc: 'Data persistence' },
    { name: 'FastAPI', desc: 'Backend API' },
    { name: 'React + Vite', desc: 'Frontend SPA' },
    { name: 'Argon2id', desc: 'Password hashing' },
    { name: 'JWT', desc: 'Auth tokens' },
  ]

  return (
    <div className="text-[#0b1c30] bg-[#f8f9ff] min-h-screen flex flex-col font-sans selection:bg-[#2170e4] selection:text-white">

      {/* ── Navbar ─────────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="h-16 w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] flex justify-between items-center px-5 md:px-12 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="w-9 h-9 rounded-xl bg-[#0058be] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,88,190,0.3)]"
          >
            <ScanFace className="w-5 h-5" />
          </motion.div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#0b1c30] font-display">SAS</span>
            <span className="hidden sm:inline-block ml-1.5 text-xs text-[#64748b] font-medium">Student Attendance System</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#45464d]">
          <a href="#how-it-works" className="hover:text-[#0058be] transition-colors">How It Works</a>
          <a href="#roles" className="hover:text-[#0058be] transition-colors">Portals</a>
          <a href="#features" className="hover:text-[#0058be] transition-colors">Features</a>
          <a href="#technology" className="hover:text-[#0058be] transition-colors">Technology</a>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link to="/student-login">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex border-[#e2e8f0] text-[#0b1c30] hover:bg-[#eff4ff] text-xs rounded-xl">
              Student Portal
            </Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="text-xs rounded-xl bg-[#0058be] hover:bg-[#004395] text-white shadow-[0_2px_8px_rgba(0,88,190,0.3)]">
              Staff Login <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </motion.header>

      <main className="flex-grow">

        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <section className="relative bg-[#0b1c30] text-white pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:28px_28px] pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#2170e4]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#0058be]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-5 md:px-12 max-w-6xl relative z-10">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col lg:flex-row items-center gap-14"
            >
              {/* Left: Copy */}
              <div className="lg:w-1/2 flex flex-col gap-6 items-start">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#93c5fd] text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5 text-[#60a5fa]" />
                  AI-Powered · Location-Verified · Real-Time
                </motion.div>

                <motion.h1 variants={fadeUp} className="font-display text-4xl lg:text-[54px] lg:leading-[60px] font-extrabold text-white tracking-tight">
                  Smart Classroom<br />
                  <span className="text-[#60a5fa]">Attendance,</span><br />
                  Automated.
                </motion.h1>

                <motion.p variants={fadeUp} className="text-base text-[#94a3b8] max-w-lg leading-relaxed">
                  SAS verifies the <strong className="text-white">classroom location</strong> and securely recognizes students in real time — no roll calls, no proxies, no manual registers.
                </motion.p>

                <motion.p variants={fadeUp} className="text-xs text-[#64748b] max-w-sm leading-relaxed border-l-2 border-[#2170e4]/60 pl-3">
                  Powered by AI face recognition, liveness detection, and vector similarity search.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link to="/login">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-[#0b1c30] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-slate-100 transition-all flex items-center gap-2">
                        Admin &amp; Faculty Login <ArrowRight className="w-4 h-4 text-[#0058be]" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/student-login">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-white/5 border border-white/25 rounded-xl hover:bg-white/15 transition-all">
                        Student Portal
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div variants={fadeUp} className="flex items-center gap-5 pt-1 text-xs text-[#64748b]">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Anti-Proxy</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400" /> Location-Locked</span>
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-purple-400" /> Liveness Check</span>
                </motion.div>
              </div>

              {/* Right: Workflow Visualization */}
              <motion.div variants={fadeUp} className="lg:w-1/2 w-full">
                <div className="relative w-full rounded-2xl border border-white/15 overflow-hidden bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.5)] p-5">
                  {/* Scan bar */}
                  <motion.div
                    animate={{ y: [0, 260, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2170e4] to-transparent shadow-[0_0_12px_#2170e4] z-20 pointer-events-none"
                  />

                  {/* Header */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SAS LIVE SESSION
                    </div>
                    <Badge className="bg-[#1e293b] text-[#60a5fa] border-[#334155] font-mono text-[11px]">CSE-A · 09:00 AM</Badge>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3">
                    {workflowSteps.map((step, i) => {
                      const Icon = step.icon
                      const isActive = i === workflowStep
                      const isDone = i < workflowStep
                      return (
                        <motion.div
                          key={i}
                          animate={{
                            opacity: isActive ? 1 : isDone ? 0.6 : 0.25,
                            scale: isActive ? 1 : 0.98,
                          }}
                          transition={{ duration: 0.35 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isActive ? `${step.bg} ${step.border}` : 'bg-slate-900/40 border-slate-800'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? `${step.bg} border ${step.border}` : 'bg-slate-800 border-slate-700'
                          }`}>
                            <Icon className="w-4 h-4" style={{ color: isActive ? step.color : '#64748b' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold font-mono tracking-wide"
                              style={{ color: isActive ? step.color : '#475569' }}>
                              {step.label}
                            </p>
                            <p className={`text-[11px] truncate ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{step.sub}</p>
                          </div>
                          {isDone && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {isActive && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${step.statusBg} ${step.statusColor}`}>
                              {step.status.toUpperCase()}
                            </span>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Progress dots */}
                  <div className="flex justify-center gap-1.5 mt-4">
                    {workflowSteps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setWorkflowStep(i)}
                        aria-label={`View step ${i + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                          i === workflowStep ? 'w-5 h-1.5 bg-[#2170e4]' : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 md:py-28 bg-white border-b border-[#e2e8f0]">
          <div className="container mx-auto px-5 md:px-12 max-w-6xl">
            <InViewSection className="space-y-14">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <SectionLabel><Play className="w-3 h-3" /> How Attendance Works</SectionLabel>
                <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                  Six Steps. Zero Roll Calls.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-sm text-[#64748b] leading-relaxed">
                  From classroom door to attendance record — completely automated, secure, and tamper-proof.
                </motion.p>
              </div>

              <div className="relative">
                {/* Connecting line desktop */}
                <div className="hidden lg:block absolute top-[26px] left-[calc(8.33%+18px)] right-[calc(8.33%+18px)] h-px bg-gradient-to-r from-[#e2e8f0] via-[#2170e4]/40 to-[#e2e8f0]" />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4">
                  {howItWorksSteps.map((step, i) => {
                    const Icon = step.icon
                    return (
                      <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center gap-3 relative">
                        <div
                          className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md relative z-10"
                          style={{ backgroundColor: step.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-[#94a3b8] tracking-widest font-mono block">{step.num}</span>
                          <h3 className="text-xs font-bold text-[#0b1c30] leading-snug mt-0.5">{step.title}</h3>
                          <p className="text-[11px] text-[#64748b] leading-relaxed mt-1 hidden md:block">{step.desc}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </InViewSection>
          </div>
        </section>

        {/* ── Three Roles ──────────────────────────────────────────────────────── */}
        <section id="roles" className="py-20 md:py-28 bg-[#f8f9ff]">
          <div className="container mx-auto px-5 md:px-12 max-w-6xl">
            <InViewSection className="space-y-12">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <SectionLabel><Users className="w-3 h-3" /> One System. Three Experiences.</SectionLabel>
                <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                  Built for Every Role
                </motion.h2>
                <motion.p variants={fadeUp} className="text-sm text-[#64748b]">
                  Separate portals for Administrators, Faculty, and Students — each designed around their specific workflow.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map((r) => {
                  const Icon = r.icon
                  return (
                    <motion.div
                      key={r.role}
                      variants={fadeUp}
                      whileHover={{ y: -4 }}
                      className="bg-white border-2 border-[#e2e8f0] p-7 rounded-2xl flex flex-col gap-5 transition-all duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                    >
                      <div>
                        <div className={`w-11 h-11 rounded-xl ${r.iconBg} flex items-center justify-center mb-4`}>
                          <Icon className={`w-5 h-5 ${r.color}`} />
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-[#94a3b8] font-mono">{r.role}</span>
                        <h3 className="font-display text-xl font-bold text-[#0b1c30] mt-1">{r.title}</h3>
                        <p className="text-xs text-[#64748b] leading-relaxed mt-2">{r.desc}</p>
                      </div>

                      <ul className="space-y-2 flex-1">
                        {r.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-[#45464d]">
                            <Check className="w-3.5 h-3.5 shrink-0" style={{ color: r.accent }} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <Link to={r.href}>
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: r.accent, color: '#fff' }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2.5 rounded-xl text-xs font-bold border-2 transition-colors flex items-center justify-center gap-1.5"
                          style={{ borderColor: r.accent, color: r.accent, backgroundColor: 'transparent' }}
                        >
                          {r.cta} <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </InViewSection>
          </div>
        </section>

        {/* ── Feature Cards ────────────────────────────────────────────────────── */}
        <section id="features" className="py-20 md:py-28 bg-white border-t border-b border-[#e2e8f0]">
          <div className="container mx-auto px-5 md:px-12 max-w-6xl">
            <InViewSection className="space-y-12">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <SectionLabel><Sparkles className="w-3 h-3" /> Capabilities</SectionLabel>
                <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                  Built for Fast, Secure Classroom Attendance
                </motion.h2>
                <motion.p variants={fadeUp} className="text-sm text-[#64748b]">
                  Every feature designed to eliminate manual errors, proxy attendance, and administrative overhead.
                </motion.p>
              </div>

              <motion.div
                variants={staggerFast}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {features.map((f, i) => {
                  const Icon = f.icon
                  return (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      whileHover={{ y: -3 }}
                      className="bg-[#f8f9ff] border border-[#e2e8f0] hover:border-[#2170e4] hover:bg-white p-6 rounded-2xl flex flex-col gap-4 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#0058be]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#0058be] bg-[#eff4ff] border border-[#dce9ff] px-2 py-0.5 rounded-full">{f.tag}</span>
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-[#0b1c30]">{f.title}</h3>
                        <p className="text-xs text-[#64748b] leading-relaxed mt-1.5">{f.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </InViewSection>
          </div>
        </section>

        {/* ── Technology Stack ─────────────────────────────────────────────────── */}
        <section id="technology" className="py-16 md:py-20 bg-[#f8f9ff]">
          <div className="container mx-auto px-5 md:px-12 max-w-6xl">
            <InViewSection className="space-y-10">
              <div className="text-center space-y-2">
                <SectionLabel><Cpu className="w-3 h-3" /> Technology Stack</SectionLabel>
                <motion.h2 variants={fadeUp} className="font-display text-2xl md:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                  Enterprise-Grade Infrastructure
                </motion.h2>
                <motion.p variants={fadeUp} className="text-sm text-[#64748b] max-w-xl mx-auto">
                  SAS is built on production-ready AI and cloud technologies — the same stack used in real enterprise biometric systems.
                </motion.p>
              </div>

              <motion.div
                variants={staggerFast}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {techStack.map((t, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center hover:border-[#2170e4] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] group cursor-default"
                  >
                    <p className="text-xs font-black text-[#0b1c30] font-mono group-hover:text-[#0058be] transition-colors">{t.name}</p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">{t.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </InViewSection>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
        <section className="py-20 md:py-24 bg-[#0b1c30] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-[#2170e4]/15 blur-3xl rounded-full pointer-events-none" />

          <InViewSection className="container mx-auto px-5 md:px-12 max-w-3xl text-center space-y-6">
            <SectionLabel><Zap className="w-3 h-3 text-[#60a5fa]" /> Ready to Get Started?</SectionLabel>
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Ready to simplify<br />classroom attendance?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-[#94a3b8] max-w-lg mx-auto">
              Deploy SAS and eliminate proxy attendance, manual registers, and administrative overhead — permanently.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="px-8 py-3.5 text-sm font-bold text-[#0b1c30] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-slate-100">
                    Admin &amp; Faculty Login <ArrowRight className="w-4 h-4 text-[#0058be]" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/student-login">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="px-8 py-3.5 text-sm font-bold text-white bg-white/5 border border-white/25 rounded-xl hover:bg-white/15">
                    Student Portal
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </InViewSection>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#e2e8f0] bg-white py-8 px-5 md:px-12">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#64748b]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0058be] flex items-center justify-center">
              <ScanFace className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#0b1c30]">SAS</span>
              <span className="text-[#64748b] ml-1.5">· Student Attendance System</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <a href="#how-it-works" className="hover:text-[#0058be] transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-[#0058be] transition-colors">Portals</a>
            <a href="#features" className="hover:text-[#0058be] transition-colors">Features</a>
            <a href="#technology" className="hover:text-[#0058be] transition-colors">Technology</a>
          </div>
          <p>© 2026 SAS · AI-powered Attendance Management Platform</p>
        </div>
      </footer>
    </div>
  )
}
