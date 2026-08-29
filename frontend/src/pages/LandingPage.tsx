import React from 'react'
import { Link } from 'react-router-dom'
import {
  ScanFace, ArrowRight, ShieldCheck, Database,
  Lock, BarChart3, Clock, CheckCircle2, Cpu, Zap, Award,
  MapPin, Check, Sparkles, UserCheck, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { motion, type Variants } from 'framer-motion'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function LandingPage() {
  return (
    <div className="text-[#0b1c30] bg-[#f8f9ff] min-h-screen flex flex-col font-sans selection:bg-[#2170e4] selection:text-white">
      {/* Top Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-16 w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] flex justify-between items-center px-6 md:px-12 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="w-9 h-9 rounded-xl bg-[#0058be] text-white flex items-center justify-center font-bold text-sm shadow-[0px_2px_8px_rgba(0,88,190,0.3)]"
          >
            <ScanFace className="w-5 h-5" />
          </motion.div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-[#0b1c30] font-display">SAS Biometrics</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold bg-[#eff4ff] text-[#0058be] px-2 py-0.5 rounded-full border border-[#dce9ff]">
              v2.0 ArcFace
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/student-login">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="sm" className="px-4 py-2 font-semibold text-xs text-[#0b1c30] hover:bg-[#eff4ff] border-[#e2e8f0] rounded-xl transition-all">
                Student Portal
              </Button>
            </motion.div>
          </Link>
          <Link to="/login">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="sm" className="px-4 py-2 font-bold text-xs text-white bg-[#0058be] hover:bg-[#004395] rounded-xl shadow-[0px_2px_8px_rgba(0,88,190,0.35)] transition-all">
                Staff & Admin Portal <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-[#131b2e] text-white py-16 md:py-24 overflow-hidden border-b border-[#e2e8f0]/20">
          {/* Radial Grid Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px] pointer-events-none opacity-50"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2170e4]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0058be]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 md:px-12 max-w-6xl relative z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col lg:flex-row items-center gap-12"
            >
              {/* Left Hero Content */}
              <div className="lg:w-1/2 flex flex-col gap-6 items-start">
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#bec6e0] text-xs font-semibold backdrop-blur-xs">
                  <Zap className="w-3.5 h-3.5 text-[#2170e4]" />
                  <span>v2.0 ArcFace 512-D & Pinecone Vector Cloud</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="font-display text-4xl lg:text-[52px] lg:leading-[58px] font-extrabold text-white tracking-tight">
                  Student Attendance System
                </motion.h1>

                <motion.p variants={itemVariants} className="text-base sm:text-lg text-[#bec6e0] max-w-xl leading-relaxed font-normal">
                  Next-generation automated attendance powered by <strong>real-time ArcFace face recognition</strong>, <strong>GPS classroom geofencing</strong>, and instant <strong>Pinecone vector indexing</strong>.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
                  <Link to="/login">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-[#0b1c30] bg-white rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:bg-slate-100 transition-all flex justify-center items-center gap-2">
                        Admin & Faculty Login <ArrowRight className="w-4 h-4 text-[#0058be]" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/student-login">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-white bg-white/5 border border-white/30 rounded-xl hover:bg-white/15 transition-all flex justify-center items-center">
                        Student Access Portal
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-6 pt-2 text-xs text-[#bec6e0]/80">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#10b981]" /> Anti-Spoofing</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#2170e4]" /> 500m Geofenced</span>
                  <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-[#a855f7]" /> MongoDB Atlas</span>
                </motion.div>
              </div>

              {/* Right Hero Interactive 3D Scanner Display */}
              <motion.div
                variants={itemVariants}
                className="lg:w-1/2 w-full mt-6 lg:mt-0 relative"
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border border-white/20 shadow-[0_22.3px_17.9px_rgba(0,_0,_0,_0.18),_0_100px_80px_rgba(0,_0,_0,_0.3)] bg-slate-950 p-6 flex flex-col justify-between"
                >
                  {/* Glowing Laser Scan Bar */}
                  <motion.div
                    animate={{ y: [0, 240, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2170e4] to-transparent shadow-[0_0_15px_#2170e4] z-20 pointer-events-none"
                  />

                  {/* Top Scan HUD */}
                  <div className="flex justify-between items-center z-10">
                    <div className="flex items-center gap-2 bg-[#0b1c30]/80 px-3 py-1 rounded-lg border border-white/10 text-[11px] font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                      <span>PINECONE LIVE SCAN</span>
                    </div>
                    <Badge className="bg-[#eff4ff]/10 text-[#2170e4] border-[#2170e4]/30 font-mono text-[11px]">
                      512-DIM VECTOR
                    </Badge>
                  </div>

                  {/* Center Face Reticle */}
                  <div className="relative my-auto flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-[#2170e4]/50 rounded-2xl relative flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#2170e4] rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#2170e4] rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#2170e4] rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#2170e4] rounded-br-lg" />

                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-[#0058be]/30 border border-[#2170e4]/60 flex items-center justify-center mx-auto text-[#2170e4]">
                          <UserCheck className="w-8 h-8" />
                        </div>
                        <span className="text-[11px] font-mono text-white/90 block font-semibold">
                          Target Student Locked
                        </span>
                      </div>

                      {/* Match Pill */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute -bottom-3 bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] px-3 py-0.5 rounded-full text-xs font-bold font-mono shadow-md flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> 99.4% Cosine Match
                      </motion.div>
                    </div>
                  </div>

                  {/* Bottom Verification Status */}
                  <div className="z-10 bg-[#0b1c30]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Verification Output</span>
                      <span className="font-bold text-white">Arjun Reddy (23A81A4301)</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#10b981]/20 text-[#10b981] font-mono font-bold text-[11px] border border-[#10b981]/30">
                      PRESENT LOGGED
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Section (6 Cards) */}
        <section className="py-20 bg-[#f8f9ff]">
          <div className="container mx-auto px-6 md:px-12 max-w-6xl space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
                <Sparkles className="w-3 h-3 mr-1" /> Enterprise Architecture
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#0b1c30] tracking-tight">
                Designed for Fast, High-Stakes Institutional Roll Calls
              </h2>
              <p className="text-sm text-[#64748b]">
                Combines edge biometric detection with cloud-native vector search for sub-second student roll calls.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Card 1 */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06)] hover:border-[#2170e4] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
                    <ScanFace className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0b1c30]">One-by-One AI Face Recognition</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    InsightFace ArcFace extracts 512-dimensional vector embeddings in real time directly from camera feeds.
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#0058be] flex items-center gap-1">
                  <span>ArcFace Pipeline</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06)] hover:border-[#2170e4] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0b1c30]">GPS Geofence Verification</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Enforces attendance start only when faculty device is verified within 500m of authorized campus classrooms.
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#0058be] flex items-center gap-1">
                  <span>Tadepalligudem Geofence</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06)] hover:border-[#2170e4] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0b1c30]">Pinecone Vector Search</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Performs cosine similarity search against thousands of student biometric vectors in under 50 milliseconds.
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#0058be] flex items-center gap-1">
                  <span>Cosine Similarity</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Card 4 */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06)] hover:border-[#2170e4] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0b1c30]">Anti-Spoofing & Liveness</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Quality assessment filters reject blurred, photo-on-screen, printed cutouts, and low-resolution imposters.
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#0058be] flex items-center gap-1">
                  <span>Liveness Engine</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Card 5 */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06)] hover:border-[#2170e4] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0b1c30]">Real-Time Telemetry</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Calculates weekly averages, low attendance alerts (&lt; 50%), and high performance badges automatically.
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#0058be] flex items-center gap-1">
                  <span>Live Analytics</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Card 6 */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06)] hover:border-[#2170e4] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0b1c30]">Role-Based Access Control</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Dedicated Admin, Faculty, and Student panels with Argon2id passwords and tamper-proof JWT sessions.
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#0058be] flex items-center gap-1">
                  <span>JWT & Argon2</span> <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white py-8 px-6 md:px-12 text-xs text-[#64748b]">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ScanFace className="w-4 h-4 text-[#0058be]" />
            <span className="font-bold text-[#0b1c30]">SAS • Student Attendance System</span>
          </div>
          <p>© 2026 Biometric Intelligence Infrastructure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
