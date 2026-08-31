import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ScanFace, ArrowRight, ShieldCheck, Database,
  Lock, BarChart3, Clock, CheckCircle2, Cpu, Zap, Award,
  MapPin, Check, Sparkles, UserCheck, Eye, Users, GraduationCap,
  BookOpen, TrendingUp, ChevronRight, Play, Shield, Camera,
  Unlock, Navigation, Brain, Server, RefreshCw, Activity,
  CheckCircle, Radio, Compass, Layers, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'

// ─── Animation Curves & Variants (Taste & Animate Skills) ─────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } 
  },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 350, damping: 25 } 
  },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08, delayChildren: 0.05 } 
  },
}

const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05, delayChildren: 0.02 } 
  },
}

// ─── Reusable InView Section ──────────────────────────────────────────────────
function InViewSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ─── Editorial Section Header Pill ───────────────────────────────────────────
function SectionBadge({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <motion.div 
      variants={fadeUp} 
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eff4ff] border border-[#dce9ff] text-[#0058be] text-xs font-bold tracking-wider uppercase shadow-[0_1px_2px_rgba(0,88,190,0.05)]"
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-[#2170e4]" />}
      <span>{children}</span>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LANDING PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  // Live workflow state
  const [activeWorkflow, setActiveWorkflow] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)
  const [activeStepTab, setActiveStepTab] = useState(0)

  // Auto-cycle workflow simulator unless manually interacted
  useEffect(() => {
    if (isSimulating) return
    const timer = setInterval(() => {
      setActiveWorkflow((prev) => (prev + 1) % 4)
    }, 2800)
    return () => clearInterval(timer)
  }, [isSimulating])

  // Trigger manual simulation demo
  const triggerSimulation = () => {
    setIsSimulating(true)
    setActiveWorkflow(0)
    
    setTimeout(() => setActiveWorkflow(1), 800)
    setTimeout(() => setActiveWorkflow(2), 1600)
    setTimeout(() => setActiveWorkflow(3), 2400)
    setTimeout(() => setIsSimulating(false), 3800)
  }

  // 4-Stage Live Workflow Definition
  const workflowStages = [
    {
      id: 0,
      icon: Navigation,
      tag: 'STAGE 01',
      title: 'GPS Location Lock',
      telemetry: 'LAT 16.8183° N · LON 81.5284° E',
      status: 'VERIFIED',
      detail: 'Device confirmed within 32m of authorized classroom hall.',
      badgeColor: 'text-[#0058be] bg-[#eff4ff] border-[#dce9ff]',
      accentColor: '#0058be',
    },
    {
      id: 1,
      icon: Unlock,
      tag: 'STAGE 02',
      title: 'Biometric Camera Armed',
      telemetry: 'WebRTC HD Stream · 60 FPS Optical Check',
      status: 'UNLOCKED',
      detail: 'Anti-spoofing liveness verification active. Ready for roll call.',
      badgeColor: 'text-[#0d9488] bg-[#f0fdf9] border-[#99f6e4]',
      accentColor: '#0d9488',
    },
    {
      id: 2,
      icon: Camera,
      tag: 'STAGE 03',
      title: 'ArcFace 512-D Identity Match',
      telemetry: 'Cosine Similarity: 0.994 · Latency: 38ms',
      status: 'IDENTIFIED',
      detail: 'Biometric vector resolved to registered student: Devendra Sagar.',
      badgeColor: 'text-[#7c3aed] bg-[#f5f3ff] border-[#ddd6fe]',
      accentColor: '#7c3aed',
    },
    {
      id: 3,
      icon: CheckCircle2,
      tag: 'STAGE 04',
      title: 'Immutable Ledger Log',
      telemetry: 'MongoDB Atlas Write · Status: PRESENT',
      status: 'RECORDED',
      detail: 'Timestamp 09:02:14 AM logged. Telemetry broadcasted to portal.',
      badgeColor: 'text-[#059669] bg-[#ecfdf5] border-[#a7f3d0]',
      accentColor: '#059669',
    },
  ]

  // Detailed "How It Works" 6-Step Workflow
  const howItWorksData = [
    {
      step: '01',
      title: 'Faculty Enters Classroom',
      category: 'Session Initiation',
      icon: Navigation,
      desc: 'Faculty opens the SAS mobile or desktop interface and activates the registered subject session.',
      highlight: 'Session Token Generated',
    },
    {
      step: '02',
      title: 'Geofence Boundary Verified',
      category: 'Location Security',
      icon: MapPin,
      desc: 'High-precision device telemetry verifies the device is inside authorized classroom coordinates before enabling camera.',
      highlight: 'Haversine Radius Check Passed',
    },
    {
      step: '03',
      title: 'Secure Optical Feed Armed',
      category: 'Biometric Capture',
      icon: Camera,
      desc: 'The HD camera feed unlocks with active anti-spoofing filters, rejecting photos, screen replays, and cutouts.',
      highlight: 'Liveness Detection Active',
    },
    {
      step: '04',
      title: 'AI Face Vector Extraction',
      category: 'InsightFace ArcFace',
      icon: ScanFace,
      desc: 'InsightFace neural network detects face boundaries and extracts a normalized 512-dimensional vector embedding.',
      highlight: '512-D Vector Computed',
    },
    {
      step: '05',
      title: 'Sub-50ms Vector Search',
      category: 'Pinecone Index',
      icon: Brain,
      desc: 'Vector is queried against thousands of enrolled institutional vectors using cosine similarity search in under 50ms.',
      highlight: 'Cosine Similarity > 0.85',
    },
    {
      step: '06',
      title: 'Real-Time Attendance Logged',
      category: 'Telemetry & Reports',
      icon: Server,
      desc: 'Attendance status is instantly committed to MongoDB Atlas. Live dashboards for Admin, Faculty, and Students update in real time.',
      highlight: 'Live Dashboard Synchronized',
    },
  ]

  // 3-Role Ecosystem Cards
  const roleCards = [
    {
      role: 'ADMINISTRATOR',
      icon: Shield,
      accent: '#0058be',
      bgGlow: 'bg-[#eff4ff]',
      borderHover: 'hover:border-[#0058be]',
      tagline: 'Institutional Governance & Analytics',
      desc: 'Complete oversight of students, faculty rosters, subject mappings, and global attendance health across all academic departments.',
      metrics: [
        { label: 'Department Analytics', val: 'Real-Time' },
        { label: 'Defaulter Alerts', val: '< 75% Threshold' },
        { label: 'Roster Management', val: 'Bulk CSV / API' },
      ],
      features: [
        'Institutional attendance health index',
        'Automated defaulter & honour roll detection',
        'Student, Faculty & Subject management',
        'Audit logs & exportable regulatory reports',
      ],
      cta: 'Admin Portal Access',
      link: '/login',
    },
    {
      role: 'FACULTY MEMBER',
      icon: ScanFace,
      accent: '#7c3aed',
      bgGlow: 'bg-[#f5f3ff]',
      borderHover: 'hover:border-[#7c3aed]',
      tagline: 'Zero-Friction Classroom Attendance',
      desc: 'Conduct high-speed roll calls in seconds. Verify classroom location, start the optical stream, and let AI mark students one by one.',
      metrics: [
        { label: 'Attendance Speed', val: '~1.2s / student' },
        { label: 'Proxy Rate', val: '0.00%' },
        { label: 'Export Formats', val: 'PDF / Excel' },
      ],
      features: [
        'Geofenced session unlocking',
        'One-by-one real-time face verification',
        'Subject-wise session analytics & history',
        'Manual override with faculty signature log',
      ],
      cta: 'Faculty Portal Access',
      link: '/login',
    },
    {
      role: 'STUDENT',
      icon: GraduationCap,
      accent: '#059669',
      bgGlow: 'bg-[#ecfdf5]',
      borderHover: 'hover:border-[#059669]',
      tagline: 'Transparent Academic Tracking',
      desc: 'Stay informed with personal real-time attendance percentages, monthly performance trends, and daily class schedules.',
      metrics: [
        { label: 'Live Status', val: 'Instant Updates' },
        { label: 'Minimum Goal', val: '75% Required' },
        { label: 'Weekly Summary', val: 'Every Monday' },
      ],
      features: [
        'Live session-by-session status tracking',
        'Subject-wise attendance breakdown & gauge',
        'Monthly trajectory & attendance history',
        'Class schedule & upcoming session notifications',
      ],
      cta: 'Student Portal Access',
      link: '/student-login',
    },
  ]

  // 6 Core Architectural Capabilities
  const coreFeatures = [
    {
      icon: ScanFace,
      tag: 'ARCFACE 512-D',
      title: 'Precision Face Recognition',
      desc: 'Extracts deep 512-dimensional facial embeddings resistant to varying lighting, angles, and facial expressions.',
    },
    {
      icon: MapPin,
      tag: 'GPS GEOFENCE',
      title: 'Classroom Location Lock',
      desc: 'Enforces attendance initiation strictly within designated geographic campus coordinates with GPS telemetry validation.',
    },
    {
      icon: Cpu,
      tag: 'PINECONE VECTOR',
      title: 'Sub-50ms Vector Search',
      desc: 'Performs lightning-fast cosine similarity lookups across thousands of registered students in institutional indexes.',
    },
    {
      icon: ShieldCheck,
      tag: 'ANTI-SPOOFING',
      title: 'Zero-Proxy Protection',
      desc: 'Multi-layer liveness detection and optical quality filters automatically reject smartphone photos, videos, and printed cutouts.',
    },
    {
      icon: BarChart3,
      tag: 'LIVE TELEMETRY',
      title: 'Real-Time Telemetry & Insights',
      desc: 'Automatic aggregate calculations, weekly trend curves, defaulter alerts (< 75%), and honour roll badges.',
    },
    {
      icon: Lock,
      tag: 'RBAC SECURITY',
      title: 'Role-Based Access Control',
      desc: 'Strict segregation between Admin, Faculty, and Student portals with Argon2id password hashing and cryptographic JWT tokens.',
    },
  ]

  // Technology Stack Badges
  const techStack = [
    { name: 'YOLOv8', role: 'Face Detection', latency: '12ms', status: 'Operational' },
    { name: 'ArcFace 512-D', role: 'Deep Embedding', latency: '24ms', status: 'Operational' },
    { name: 'Pinecone Cloud', role: 'Vector Search', latency: '< 30ms', status: 'Operational' },
    { name: 'MongoDB Atlas', role: 'Data Persistence', latency: '15ms', status: 'Operational' },
    { name: 'FastAPI (Python)', role: 'Core Backend Engine', latency: '8ms', status: 'Operational' },
    { name: 'React 18 + Vite', role: 'High-Speed SPA', latency: 'Instant', status: 'Operational' },
    { name: 'Argon2id', role: 'Password Hashing', latency: 'Secure', status: 'Operational' },
    { name: 'JWT Sessions', role: 'Stateless Auth', latency: 'Instant', status: 'Operational' },
  ]

  return (
    <div className="text-[#0b1c30] bg-[#f8f9ff] min-h-screen flex flex-col font-sans selection:bg-[#2170e4] selection:text-white">

      {/* ── TOP FLOATING NAVBAR (Glass & Layered Elevation) ────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="h-16 w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] flex justify-between items-center px-5 md:px-12 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
      >
        {/* Brand Logo & Identifier */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-[#0058be] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,88,190,0.35)] cursor-pointer"
          >
            <ScanFace className="w-5 h-5" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#0b1c30] font-display">SAS</span>
              <span className="text-[10px] font-mono font-bold text-[#0058be] bg-[#eff4ff] border border-[#dce9ff] px-2 py-0.5 rounded-full hidden sm:inline-block">
                v2.0 BIOMETRICS
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] font-medium leading-none hidden sm:block mt-0.5">
              Student Attendance System
            </p>
          </div>
        </div>

        {/* Anchored Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#45464d]">
          <a href="#how-it-works" className="hover:text-[#0058be] transition-colors py-1">How It Works</a>
          <a href="#roles" className="hover:text-[#0058be] transition-colors py-1">Role Portals</a>
          <a href="#capabilities" className="hover:text-[#0058be] transition-colors py-1">Capabilities</a>
          <a href="#infrastructure" className="hover:text-[#0058be] transition-colors py-1">Technology</a>
          <a href="#security" className="hover:text-[#0058be] transition-colors py-1">Security</a>
        </nav>

        {/* Action Gateways */}
        <div className="flex items-center gap-2.5">
          <Link to="/student-login">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:inline-flex border-[#e2e8f0] text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#0058be] text-xs rounded-xl font-semibold transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-[#059669]" />
                Student Portal
              </Button>
            </motion.div>
          </Link>
          <Link to="/login">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                size="sm" 
                className="text-xs rounded-xl bg-[#0058be] hover:bg-[#004395] text-white shadow-[0_2px_10px_rgba(0,88,190,0.3)] font-semibold transition-all flex items-center gap-1.5"
              >
                Staff Login <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.header>

      <main className="flex-grow">

        {/* ── HERO SECTION (Atmospheric Void & Live Biometric Simulator) ─────── */}
        <section className="relative bg-[#0b1c30] text-white pt-14 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          {/* Layered Atmospheric Glows & Grid (Atmosphere-Background Skill) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px] pointer-events-none opacity-60" />
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-[#2170e4]/18 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-[#0058be]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-5 md:px-12 max-w-6xl relative z-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col lg:flex-row items-center gap-12 lg:gap-14"
            >
              {/* Left Column: Editorial Headline & Actions */}
              <div className="lg:w-1/2 flex flex-col gap-6 items-start">
                
                {/* Live Pill Status */}
                <motion.div 
                  variants={fadeUp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#93c5fd] text-xs font-semibold backdrop-blur-md"
                >
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                  <span>Institutional Biometrics v2.0 Active</span>
                </motion.div>

                {/* Hero Title (Editorial Typography with Tight Tracking) */}
                <motion.h1 
                  variants={fadeUp} 
                  className="font-display text-4xl sm:text-5xl lg:text-[56px] lg:leading-[62px] font-extrabold text-white tracking-tight"
                >
                  Smart Classroom<br />
                  <span className="bg-gradient-to-r from-[#60a5fa] via-[#93c5fd] to-white bg-clip-text text-transparent">
                    Attendance,
                  </span><br />
                  Fully Automated.
                </motion.h1>

                {/* Value Proposition */}
                <motion.p variants={fadeUp} className="text-base sm:text-lg text-[#94a3b8] max-w-lg leading-relaxed font-normal">
                  SAS verifies classroom <strong className="text-white font-semibold">location telemetry</strong> and recognizes students in real time — eliminating roll calls, proxy entries, and paper registers.
                </motion.p>

                {/* Security Spec Callout */}
                <motion.div 
                  variants={fadeUp} 
                  className="flex items-center gap-3 py-2 px-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 font-mono"
                >
                  <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span>ArcFace 512-D + GPS Geofence + Pinecone Vector Cloud</span>
                </motion.div>

                {/* Dual Gateway CTA Buttons */}
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto pt-1">
                  <Link to="/login">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-[#0b1c30] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        Admin & Faculty Portal <ArrowRight className="w-4 h-4 text-[#0058be]" />
                      </Button>
                    </motion.div>
                  </Link>

                  <Link to="/student-login">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-white/5 border border-white/20 rounded-xl hover:bg-white/15 transition-all flex items-center justify-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4 text-[#10b981]" />
                        Student Portal
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Trust Metrics */}
                <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5 pt-2 text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Anti-Proxy Liveness</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400" /> Geofence Verified</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-purple-400" /> &lt; 50ms Match</span>
                </motion.div>
              </div>

              {/* Right Column: Interactive Biometric HUD & Simulation Deck */}
              <motion.div variants={fadeUp} className="lg:w-1/2 w-full">
                <div className="relative w-full rounded-2xl border border-white/15 overflow-hidden bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-5 corner-crosshair">
                  
                  {/* Laser Scan Sweep Bar */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2170e4] to-transparent shadow-[0_0_15px_#2170e4] z-20 pointer-events-none animate-laser" />

                  {/* Header HUD Status */}
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[11px] font-mono font-bold text-slate-300 tracking-wider">
                        SAS LIVE HUD · CSE-A (HALL 302)
                      </span>
                    </div>
                    
                    <button
                      onClick={triggerSimulation}
                      disabled={isSimulating}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
                      title="Run Live Verification Simulation"
                    >
                      <RefreshCw className={`w-3 h-3 text-[#60a5fa] ${isSimulating ? 'animate-spin' : ''}`} />
                      <span>{isSimulating ? 'Simulating...' : 'Test Sim'}</span>
                    </button>
                  </div>

                  {/* Interactive Facial Viewfinder Frame */}
                  <div className="relative h-48 sm:h-52 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between p-4 overflow-hidden mb-4">
                    {/* Viewfinder Corner Reticles */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#2170e4]" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#2170e4]" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#2170e4]" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#2170e4]" />

                    {/* Target Lock Center Graphic */}
                    <div className="relative my-auto flex flex-col items-center justify-center">
                      <div className="relative w-20 h-20 rounded-full border border-dashed border-[#2170e4]/50 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[#0058be]/20 border border-[#60a5fa]/40 flex items-center justify-center text-[#60a5fa]">
                          <UserCheck className="w-7 h-7" />
                        </div>
                        {/* Radar Scan Ring */}
                        <div className="absolute inset-0 rounded-full border border-[#2170e4] animate-radar pointer-events-none" />
                      </div>

                      {/* Dynamic Verification Output Pill */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeWorkflow}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mt-2 text-center"
                        >
                          <span className="text-xs font-mono font-bold text-white tracking-wide">
                            {activeWorkflow === 0 && 'Target: Student Geofence In-Range'}
                            {activeWorkflow === 1 && 'Optical Stream: Liveness Confirmed'}
                            {activeWorkflow === 2 && 'Identity: Devendra Sagar (23A81A4301)'}
                            {activeWorkflow === 3 && 'Result: PRESENT (09:02 AM) Logged'}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                      <span>Telemetry: 16.8183° N, 81.5284° E</span>
                      <span className="text-emerald-400 font-bold">MATCH: 99.4% COSINE</span>
                    </div>
                  </div>

                  {/* 4 Interactive Progression Stages */}
                  <div className="space-y-2">
                    {workflowStages.map((stage, idx) => {
                      const Icon = stage.icon
                      const isActive = idx === activeWorkflow
                      const isPast = idx < activeWorkflow

                      return (
                        <motion.div
                          key={stage.id}
                          onClick={() => setActiveWorkflow(idx)}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-slate-900 border-[#2170e4]/80 shadow-[0_0_15px_rgba(33,112,228,0.2)]'
                              : isPast
                              ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                              : 'bg-slate-950/30 border-slate-900 opacity-40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div 
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                isActive ? 'bg-[#0058be] border-[#60a5fa] text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <p className={`text-xs font-bold font-mono tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                {stage.title}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate font-mono">
                                {stage.telemetry}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 ml-2">
                            {isPast && <Check className="w-4 h-4 text-emerald-400" />}
                            {isActive && (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#2170e4]/20 border border-[#2170e4]/40 text-[#60a5fa]">
                                {stage.status}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* ── LIVE TELEMETRY TICKER BAR (High-Density Metrics) ─────────────── */}
        <section className="bg-white border-b border-[#e2e8f0] py-6 px-5 md:px-12">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-[#e2e8f0]">
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-extrabold text-[#0b1c30] font-display">&lt; 50ms</p>
                <p className="text-xs font-semibold text-[#64748b]">Vector Recognition Latency</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-extrabold text-[#0058be] font-display">99.8%</p>
                <p className="text-xs font-semibold text-[#64748b]">Spoof & Impersonation Rejection</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-extrabold text-[#059669] font-display">100%</p>
                <p className="text-xs font-semibold text-[#64748b]">Geofence Location Lock</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-extrabold text-[#7c3aed] font-display">0.00%</p>
                <p className="text-xs font-semibold text-[#64748b]">Proxy Attendance Tolerance</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS SECTION (Interactive Workflow Experience) ────────── */}
        <InViewSection id="how-it-works" className="py-20 md:py-28 bg-[#f8f9ff]">
          <div className="container mx-auto px-5 md:px-12 max-w-6xl space-y-14">
            
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <SectionBadge icon={Play}>How Attendance Works</SectionBadge>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                Six Steps. Zero Roll Calls.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sm sm:text-base text-[#64748b] leading-relaxed">
                From classroom entrance to persistent database record — completely automated, secure, and tamper-proof.
              </motion.p>
            </div>

            {/* 6 Step Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {howItWorksData.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.step}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#2170e4] hover:shadow-[0_8px_24px_rgba(33,112,228,0.08)] transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-black text-[#94a3b8] bg-slate-100 px-2.5 py-1 rounded-md">
                          STEP {item.step}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#0058be] uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h3 className="font-display text-base font-bold text-[#0b1c30] mt-0.5">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#64748b] leading-relaxed mt-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#f1f5f9] flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#059669]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.highlight}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

          </div>
        </InViewSection>

        {/* ── THREE-ROLE INSTITUTIONAL ECOSYSTEM (Bento Cards) ─────────────── */}
        <InViewSection id="roles" className="py-20 md:py-28 bg-white border-t border-b border-[#e2e8f0]">
          <div className="container mx-auto px-5 md:px-12 max-w-6xl space-y-12">
            
            {/* Section Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <SectionBadge icon={Users}>Role Portals</SectionBadge>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                One System. Three Dedicated Portals.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sm sm:text-base text-[#64748b]">
                Tailored interfaces for Administrators, Faculty, and Students — each engineered around their specific academic responsibilities.
              </motion.p>
            </div>

            {/* Bento Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {roleCards.map((r) => {
                const Icon = r.icon
                return (
                  <motion.div
                    key={r.role}
                    variants={fadeUp}
                    whileHover={{ y: -5 }}
                    className="bg-[#f8f9ff] border-2 border-[#e2e8f0] p-7 rounded-2xl flex flex-col justify-between transition-all duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#0058be]"
                  >
                    <div className="space-y-5">
                      {/* Role Header */}
                      <div>
                        <div className={`w-12 h-12 rounded-xl ${r.bgGlow} flex items-center justify-center mb-3.5`}>
                          <Icon className="w-6 h-6" style={{ color: r.accent }} />
                        </div>
                        <span className="text-[10px] font-mono font-black tracking-widest text-[#94a3b8]">
                          {r.role}
                        </span>
                        <h3 className="font-display text-xl font-bold text-[#0b1c30] mt-0.5">
                          {r.tagline}
                        </h3>
                        <p className="text-xs text-[#64748b] leading-relaxed mt-2">
                          {r.desc}
                        </p>
                      </div>

                      {/* Feature Bullets */}
                      <div className="space-y-2 pt-2 border-t border-[#e2e8f0]/80">
                        {r.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-xs text-[#45464d]">
                            <Check className="w-3.5 h-3.5 shrink-0" style={{ color: r.accent }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-6">
                      <Link to={r.link}>
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: r.accent, color: '#ffffff' }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5"
                          style={{
                            borderColor: r.accent,
                            color: r.accent,
                            backgroundColor: 'transparent',
                          }}
                        >
                          <span>{r.cta}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>

          </div>
        </InViewSection>

        {/* ── CORE CAPABILITIES GRID (Precision Grid) ────────────────────────── */}
        <InViewSection id="capabilities" className="py-20 md:py-28 bg-[#f8f9ff]">
          <div className="container mx-auto px-5 md:px-12 max-w-6xl space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <SectionBadge icon={Sparkles}>Core Capabilities</SectionBadge>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                Engineered for High-Stakes Institutional Accuracy
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sm text-[#64748b]">
                Combining cutting-edge computer vision with cloud-native vector similarity indexing.
              </motion.p>
            </div>

            {/* 6 Capabilities Cards */}
            <motion.div
              variants={staggerFast}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {coreFeatures.map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    whileHover={{ y: -3 }}
                    className="bg-white border border-[#e2e8f0] hover:border-[#2170e4] p-6 rounded-2xl flex flex-col gap-4 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#0058be]" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#0058be] bg-[#eff4ff] border border-[#dce9ff] px-2.5 py-0.5 rounded-full">
                        {f.tag}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-[#0b1c30]">{f.title}</h3>
                      <p className="text-xs text-[#64748b] leading-relaxed mt-1.5">{f.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

          </div>
        </InViewSection>

        {/* ── TECHNOLOGY STACK MATRIX (Technical Transparency) ─────────────── */}
        <InViewSection id="infrastructure" className="py-20 md:py-24 bg-white border-t border-b border-[#e2e8f0]">
          <div className="container mx-auto px-5 md:px-12 max-w-6xl space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <SectionBadge icon={Cpu}>Enterprise Technology Stack</SectionBadge>
              <motion.h2 variants={fadeUp} className="font-display text-2xl md:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                Production-Grade Infrastructure
              </motion.h2>
              <motion.p variants={fadeUp} className="text-xs sm:text-sm text-[#64748b]">
                SAS is built on battle-tested AI and cloud architecture — providing sub-second vector lookups and cryptographic data privacy.
              </motion.p>
            </div>

            {/* 8 Technology Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {techStack.map((tech, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl p-4.5 hover:border-[#2170e4] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-[#0058be] font-bold">{tech.latency}</span>
                  </div>
                  <p className="text-xs font-black font-mono text-[#0b1c30] group-hover:text-[#0058be] transition-colors">
                    {tech.name}
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    {tech.role}
                  </p>
                </motion.div>
              ))}
            </div>

          </div>
        </InViewSection>

        {/* ── SECURITY & COMPLIANCE SECTION ─────────────────────────────────── */}
        <InViewSection id="security" className="py-16 md:py-20 bg-[#f8f9ff]">
          <div className="container mx-auto px-5 md:px-12 max-w-5xl">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff4ff] border border-[#dce9ff] text-[#0058be] text-[11px] font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Biometric Privacy & Compliance</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0b1c30]">
                  Cryptographic Biometric Vault
                </h3>
                <p className="text-xs sm:text-sm text-[#64748b] max-w-xl leading-relaxed">
                  Raw facial photographs are never permanently stored. Only irreversible, mathematically projected 512-dimensional vector embeddings are encrypted in Pinecone vector storage.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-xs font-mono text-[#0b1c30]">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>AES-256 Vector Vault</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-xs font-mono text-[#0b1c30]">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Argon2id Salted Passwords</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-xs font-mono text-[#0b1c30]">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>JWT Ephemeral Tokens</span>
                </div>
              </div>
            </div>
          </div>
        </InViewSection>

        {/* ── ATMOSPHERIC CTA BANNER ────────────────────────────────────────── */}
        <section className="py-20 md:py-24 bg-[#0b1c30] relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-56 bg-[#2170e4]/18 blur-3xl rounded-full pointer-events-none" />

          <div className="container mx-auto px-5 md:px-12 max-w-3xl relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#93c5fd] text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#60a5fa]" />
              <span>Ready for Rollout</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Transform your classroom<br />
              attendance today.
            </h2>

            <p className="text-sm sm:text-base text-[#94a3b8] max-w-lg mx-auto leading-relaxed">
              Deploy SAS and eliminate proxy attendance, manual roll call friction, and administrative paperwork across your entire campus.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-2">
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="px-8 py-3.5 text-sm font-bold text-[#0b1c30] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-slate-100 flex items-center gap-2">
                    Admin & Faculty Login <ArrowRight className="w-4 h-4 text-[#0058be]" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/student-login">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="px-8 py-3.5 text-sm font-bold text-white bg-white/5 border border-white/25 rounded-xl hover:bg-white/15">
                    Student Portal Gateway
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── INSTITUTIONAL FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-[#e2e8f0] bg-white py-10 px-5 md:px-12">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#64748b]">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0058be] text-white flex items-center justify-center shadow-sm">
              <ScanFace className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-extrabold text-[#0b1c30] font-display text-sm">SAS</span>
              <span className="text-[#64748b] ml-2">Student Attendance System</span>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <a href="#how-it-works" className="hover:text-[#0058be] transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-[#0058be] transition-colors">Role Portals</a>
            <a href="#capabilities" className="hover:text-[#0058be] transition-colors">Capabilities</a>
            <a href="#infrastructure" className="hover:text-[#0058be] transition-colors">Technology</a>
            <a href="#security" className="hover:text-[#0058be] transition-colors">Security</a>
          </div>

          {/* System Heartbeat */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-medium">All Systems Operational</span>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#94a3b8]">
          <p>© 2026 SAS · AI-Powered Student Attendance Management System</p>
          <p className="mt-2 sm:mt-0 font-mono">ArcFace 512-D · GPS Geofenced · Pinecone Vector Index</p>
        </div>
      </footer>

    </div>
  )
}
