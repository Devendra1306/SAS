import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Camera, CheckCircle2, AlertCircle, ArrowRight, RefreshCw,
  UserCheck, ShieldCheck, UserX, Clock, Users, ArrowLeft,
  Sparkles, Check, ChevronRight, Search, StopCircle, CornerDownRight,
  Eye, Zap, Lock, Unlock, Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import { attendanceService } from '@/services/attendance.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatDate, formatTime } from '@/utils/format'

export default function LiveRecognition() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const webcamRef = useRef<Webcam>(null)

  // Camera & recognition state
  const [capturing, setCapturing] = useState(false)
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [manualSelectId, setManualSelectId] = useState<string>('')
  const [rosterSearch, setRosterSearch] = useState<string>('')
  const [ending, setEnding] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Fetch session details and class roster
  const { data: sessionData, isLoading, refetch: refetchRoster } = useQuery({
    queryKey: ['session-roster', sessionId],
    queryFn: () => attendanceService.getSessionRoster(sessionId || ''),
    enabled: !!sessionId,
    refetchInterval: 4000,
  })

  const session = sessionData?.session
  const roster: any[] = sessionData?.roster || []
  const totalEnrolled = sessionData?.total_enrolled || roster.length || 1
  const totalPresent = sessionData?.total_present || roster.filter(r => r.is_marked && r.status === 'PRESENT').length
  const progressPct = Math.round((totalPresent / (totalEnrolled || 1)) * 100)

  // One-by-One Capture & Recognize
  const handleCaptureAndRecognize = useCallback(async () => {
    if (!webcamRef.current || capturing) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (!imageSrc) {
      toast.error('Could not capture frame from webcam. Ensure camera permissions are granted.')
      return
    }

    setCapturedSnapshot(imageSrc)
    setCapturing(true)
    setLastResult(null)

    try {
      const res = await attendanceService.recognizeOne({
        session_id: sessionId || '',
        frame_base64: imageSrc
      })

      setLastResult(res)
      if (res.matched && res.status === 'PRESENT') {
        toast.success(res.message || 'Student Recognized & Marked Present!')
      } else if (res.matched && res.status === 'DUPLICATE') {
        toast(res.message || 'Student already marked Present', { icon: 'ℹ️' })
      } else {
        toast.error(res.message || 'Student face not recognized in Pinecone')
      }

      refetchRoster()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Recognition failed. Please retry.')
      setLastResult({
        success: false,
        matched: false,
        status: 'ERROR',
        message: 'Server recognition error. You can mark student manually.'
      })
    } finally {
      setCapturing(false)
    }
  }, [capturing, sessionId, refetchRoster])

  // Handle Manual Attendance Mark for a Student
  const handleManualMark = async (studentIdToMark?: string) => {
    const idToMark = studentIdToMark || manualSelectId
    if (!idToMark) {
      toast.error('Please select a student from the list')
      return
    }

    setCapturing(true)
    try {
      const res = await attendanceService.recognizeOne({
        session_id: sessionId || '',
        manual_student_id: idToMark
      })

      setLastResult(res)
      setManualSelectId('')
      toast.success(res.message || 'Student marked present!')
      refetchRoster()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Manual mark failed')
    } finally {
      setCapturing(false)
    }
  }

  // Handle Next Student Reset
  const handleNextStudent = () => {
    setCapturedSnapshot(null)
    setLastResult(null)
    setManualSelectId('')
  }

  // Spacebar Hotkey to Trigger Capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !capturing && e.target === document.body) {
        e.preventDefault()
        if (lastResult?.matched) {
          handleNextStudent()
        } else {
          handleCaptureAndRecognize()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [capturing, lastResult, handleCaptureAndRecognize])

  // Handle End Session
  const handleEndSession = async () => {
    if (!window.confirm('Are you sure you want to end this attendance session?')) return
    setEnding(true)
    try {
      await attendanceService.endSession(sessionId || '')
      toast.success('Attendance session completed!')
      navigate('/faculty/attendance/history')
    } catch (err: any) {
      toast.error('Failed to end session')
    } finally {
      setEnding(false)
    }
  }

  const filteredRoster = roster.filter(st => {
    if (!rosterSearch) return true
    const q = rosterSearch.toLowerCase()
    return st.name.toLowerCase().includes(q) || st.student_id.toLowerCase().includes(q) || (st.roll_number && st.roll_number.toLowerCase().includes(q))
  })

  const unmarkedStudents = roster.filter(st => !st.is_marked || st.status !== 'PRESENT')

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/faculty/attendance/start" className="text-xs text-[#0058be] hover:underline flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Setup
            </Link>
            <span className="text-[#64748b]">•</span>
            <Badge className="bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10b981] mr-1.5 animate-pulse inline-block" /> Live Roll Call Active
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight font-display">
            One-by-One Biometric Attendance
          </h1>
          <p className="text-xs text-[#64748b]">
            Course: <strong>{session?.subject_name || 'Machine Learning'}</strong> • Dept: <strong>{session?.department} Year {session?.year} (Sec {session?.section})</strong>
          </p>
        </div>

        {/* Progress KPI & End Session Button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-xs text-[#64748b] block">Attendance Quota</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-[#0b1c30]">{totalPresent} / {totalEnrolled}</span>
              <span className="text-xs font-mono font-bold text-[#0058be]">({progressPct}%)</span>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndSession}
              isLoading={ending}
              className="border-red-200 text-[#ba1a1a] hover:bg-red-50 text-xs h-10 font-bold rounded-xl"
            >
              <StopCircle className="w-4 h-4 mr-1.5" /> End Lecture Roll Call
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewfinder & Reticle (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-white border-[#e2e8f0] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#e2e8f0] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#0b1c30] font-display flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#0058be]" />
                  <span>Student Face Viewfinder</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#64748b]">
                  Position student inside frame & press <strong>Spacebar</strong> or click Capture
                </CardDescription>
              </div>
              <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs font-mono">
                ArcFace 512-D
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Webcam Viewport with Corner Reticle & Laser Sweep */}
              <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center text-slate-300 space-y-3">
                    <Camera className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="font-bold text-sm text-white">Camera Access Issue</p>
                    <p className="text-xs text-slate-400 max-w-sm">{cameraError}</p>
                    <p className="text-[11px] text-amber-300">
                      You can still take attendance by selecting students directly from the roster on the right.
                    </p>
                  </div>
                ) : capturedSnapshot ? (
                  <img src={capturedSnapshot} alt="Captured Student Snapshot" className="w-full h-full object-cover" />
                ) : (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                    onUserMediaError={(err) => setCameraError(typeof err === 'string' ? err : 'Camera access was denied or device is not available.')}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Laser Scanning Line Sweep */}
                {capturing && (
                  <motion.div
                    animate={{ y: [0, 240, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2170e4] to-transparent shadow-[0_0_20px_#2170e4] z-20 pointer-events-none"
                  />
                )}

                {/* Corner Reticle Frame */}
                <div className="absolute inset-0 p-8 pointer-events-none flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: capturing ? [1, 1.03, 1] : 1,
                      borderColor: lastResult?.matched ? '#10b981' : '#2170e4'
                    }}
                    transition={{ repeat: capturing ? Infinity : 0, duration: 1 }}
                    className="w-56 h-56 border-2 border-dashed border-[#2170e4]/60 rounded-2xl relative flex items-center justify-center"
                  >
                    {/* Reticle Corner Brackets */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-[#2170e4] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-[#2170e4] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-[#2170e4] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-[#2170e4] rounded-br-lg" />

                    {capturing ? (
                      <div className="bg-[#0b1c30]/90 px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2170e4]" />
                        <span>Searching Pinecone...</span>
                      </div>
                    ) : lastResult?.matched ? (
                      <div className="bg-[#10b981] px-3 py-1.5 rounded-full text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                        <Check className="w-4 h-4" />
                        <span>Vector Verified</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-white/70 bg-[#0b1c30]/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                        Align Face Here
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex gap-3">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button
                    type="button"
                    onClick={handleCaptureAndRecognize}
                    disabled={capturing}
                    isLoading={capturing}
                    className="w-full bg-[#0058be] hover:bg-[#004395] text-white text-xs font-bold h-12 rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>📸 CAPTURE & RECOGNIZE STUDENT</span>
                  </Button>
                </motion.div>

                {capturedSnapshot && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleNextStudent}
                      className="border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] text-xs font-semibold h-12 px-5 rounded-xl"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retake
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recognized Student Details & Confirmation Card (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className={`border rounded-2xl shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06)] transition-all ${
            lastResult?.matched
              ? 'bg-white border-[#10b981]'
              : lastResult
              ? 'bg-white border-red-200'
              : 'bg-white border-[#e2e8f0]'
          }`}>
            <CardHeader className="pb-3 border-b border-[#e2e8f0]">
              <CardTitle className="text-base font-bold text-[#0b1c30] font-display flex items-center justify-between">
                <span>Student Identification Details</span>
                {lastResult?.matched && (
                  <Badge className="bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#10b981]" /> Verified
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <AnimatePresence mode="wait">
                {lastResult?.matched && lastResult?.student ? (
                  /* Matched Student Profile View */
                  <motion.div
                    key="matched"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#0058be] text-white flex items-center justify-center font-bold text-xl shadow-md font-display shrink-0">
                        {lastResult.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h2 className="text-lg font-bold text-[#0b1c30] leading-tight font-display">{lastResult.student.name}</h2>
                        <p className="text-xs font-mono font-semibold text-[#0058be] mt-0.5">{lastResult.student.student_id}</p>
                        <p className="text-xs text-[#64748b]">Roll No: {lastResult.student.roll_number || lastResult.student.student_id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
                        <span className="text-[#64748b] block text-[11px]">Academic Class</span>
                        <span className="font-semibold text-[#0b1c30]">{lastResult.student.department} • Y{lastResult.student.year} Sec {lastResult.student.section}</span>
                      </div>
                      <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
                        <span className="text-[#64748b] block text-[11px]">Pinecone Cosine Match</span>
                        <span className="font-mono font-bold text-[#065f46]">{Math.round((lastResult.score || 0.98) * 100)}% Match</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-[#ecfdf5] border-[#a7f3d0] text-xs text-[#065f46] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Attendance Logged: PRESENT</p>
                        <p className="text-[11px] text-[#065f46]/80">{formatTime(lastResult.timestamp || new Date())} • Verified via ArcFace</p>
                      </div>
                    </div>

                    {/* Primary Next Action */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleNextStudent}
                        size="lg"
                        className="w-full bg-[#0058be] hover:bg-[#004395] text-white text-xs font-bold h-12 rounded-xl shadow-md flex items-center justify-center gap-2"
                      >
                        <span>➡️ NEXT STUDENT (SCAN ANOTHER)</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : lastResult && !lastResult.matched ? (
                  /* Unrecognized / Low Match Fallback */
                  <motion.div
                    key="unrecognized"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="space-y-4 text-center py-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
                      <UserX className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#ba1a1a]">Face Not Recognized in Pinecone</h3>
                      <p className="text-xs text-[#64748b] mt-1">{lastResult.message}</p>
                    </div>

                    {/* Manual Selection Fallback Form */}
                    <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0] text-left space-y-2">
                      <label className="text-xs font-semibold text-[#0b1c30] block">
                        Select Student Manually from Class:
                      </label>
                      <Select
                        value={manualSelectId}
                        onChange={e => setManualSelectId(e.target.value)}
                        className="bg-white border-[#e2e8f0] text-xs text-[#0b1c30] h-9 rounded-lg"
                      >
                        <option value="">Choose Student Name...</option>
                        {unmarkedStudents.map(st => (
                          <option key={st.student_id} value={st.student_id}>
                            {st.name} ({st.student_id})
                          </option>
                        ))}
                      </Select>
                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          onClick={() => handleManualMark()}
                          disabled={!manualSelectId}
                          className="bg-[#0058be] hover:bg-[#004395] text-white text-xs font-medium h-8 rounded-lg flex-1"
                        >
                          Mark Present Manually
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleNextStudent}
                          className="border-[#e2e8f0] text-xs h-8 rounded-lg"
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Ready Standby View */
                  <motion.div
                    key="standby"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 text-center text-slate-500 space-y-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#0058be] flex items-center justify-center mx-auto border border-[#dce9ff]">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0b1c30]">Awaiting Next Student</h3>
                      <p className="text-xs text-[#64748b] max-w-xs mx-auto mt-1">
                        Ask the student to stand in the frame, then click <strong>Capture & Recognize</strong>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Live Class Roster Table */}
      <Card className="bg-white border-[#e2e8f0] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#e2e8f0] bg-[#f8f9ff] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Live Class Roster & Roll Call Ledger</CardTitle>
            <CardDescription className="text-xs text-[#64748b]">
              Real-time synchronization for {session?.department} Year {session?.year} Section {session?.section}
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search student or roll no..."
              value={rosterSearch}
              onChange={e => setRosterSearch(e.target.value)}
              className="pl-9 bg-white border-[#e2e8f0] text-xs h-9 rounded-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRoster.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-[#e2e8f0] text-xs font-semibold text-[#64748b]">
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Time Logged</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-xs">
                  {filteredRoster.map((st: any) => {
                    const isPresent = st.is_marked && st.status === 'PRESENT'
                    return (
                      <tr key={st.student_id} className={`hover:bg-[#f8f9ff] transition-colors ${isPresent ? 'bg-[#ecfdf5]/30' : ''}`}>
                        <td className="p-3.5 font-mono font-bold text-[#0b1c30]">{st.roll_number || st.student_id}</td>
                        <td className="p-3.5 font-semibold text-[#0b1c30]">{st.name}</td>
                        <td className="p-3.5 font-mono text-[#64748b]">{st.student_id}</td>
                        <td className="p-3.5 font-mono text-[#64748b]">
                          {st.timestamp ? formatTime(st.timestamp) : '—'}
                        </td>
                        <td className="p-3.5">
                          {st.verification_method ? (
                            <Badge className="bg-slate-100 text-[#0b1c30] border-slate-200 text-[10px]">
                              {st.verification_method}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {isPresent ? (
                            <Badge className="bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] text-xs">
                              <Check className="w-3 h-3 mr-1" /> PRESENT
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleManualMark(st.student_id)}
                              className="h-7 text-xs border-[#e2e8f0] hover:bg-[#eff4ff] text-[#0058be]"
                            >
                              Mark Present
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#64748b]">
              No students enrolled in this section.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
