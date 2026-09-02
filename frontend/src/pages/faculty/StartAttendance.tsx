import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin, ShieldCheck, CheckCircle2, XCircle, Lock, Unlock,
  RefreshCw, Navigation, PlayCircle, Sparkles, Camera, ArrowRight,
  AlertTriangle, Building2, Compass, Check, BookmarkPlus, Zap, ToggleLeft, ToggleRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { subjectsService } from '@/services/subjects.service'
import { attendanceService } from '@/services/attendance.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { locationService } from '@/services/location.service'

export default function StartAttendance() {
  const navigate = useNavigate()
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0])
  const [starting, setStarting] = useState(false)
  const [calibrating, setCalibrating] = useState(false)

  // Location Geofencing States
  const [gpsLoading, setGpsLoading] = useState(true)
  const [facultyCoords, setFacultyCoords] = useState<{ lat: number; lon: number; accuracy?: number } | null>(null)
  const [locationResult, setLocationResult] = useState<any>(null)
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('AUTO')
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [bypassGeofence, setBypassGeofence] = useState<boolean>(false)

  // Fetch subjects
  const { data: rawSubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['start-attendance-subjects'],
    queryFn: () => subjectsService.getSubjects(),
  })

  // Fetch authorized campus locations
  const { data: rawLocations, refetch: refetchLocations } = useQuery({
    queryKey: ['authorized-locations'],
    queryFn: () => attendanceService.getAuthorizedLocations(),
  })

  const subjectsList: any[] = useMemo(() => {
    return Array.isArray(rawSubjects) ? rawSubjects : (rawSubjects?.subjects || rawSubjects?.data || [])
  }, [rawSubjects])

  const locationsList: any[] = useMemo(() => {
    return Array.isArray(rawLocations) ? rawLocations : []
  }, [rawLocations])

  const selectedSubject = useMemo(() => {
    return subjectsList.find(s => (s.id || s._id) === selectedSubjectId)
  }, [subjectsList, selectedSubjectId])

  // Select first subject on load
  useEffect(() => {
    if (subjectsList.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjectsList[0].id || subjectsList[0]._id)
    }
  }, [subjectsList.length, selectedSubjectId])

  // Verification helper function
  const runVerifyLocation = useCallback(async (
    lat: number,
    lon: number,
    accuracy?: number,
    classroomId?: string,
    showToast = false
  ) => {
    setGpsLoading(true)
    setGpsError(null)
    try {
      const res = await attendanceService.verifyLocation({
        latitude: lat,
        longitude: lon,
        classroom_id: classroomId === 'AUTO' ? undefined : classroomId,
        accuracy
      })
      setLocationResult(res)
      if (showToast) {
        if (res.verified) {
          toast.success(`✓ Location Verified (${Math.round(res.distance_meters)}m from ${res.classroom_name})`)
        } else {
          toast.error(`Outside campus range: ${Math.round(res.distance_meters)}m away`)
        }
      }
      return res
    } catch (err: any) {
      setGpsError('Could not verify coordinates with server')
      return null
    } finally {
      setGpsLoading(false)
    }
  }, [])

  // Acquire current location
  const handleAcquireLocation = useCallback(async (showToast = false) => {
    setGpsLoading(true)
    setGpsError(null)
    try {
      const loc = await locationService.getCurrentLocation(false)
      const coords = {
        lat: loc.latitude,
        lon: loc.longitude,
        accuracy: loc.accuracy
      }
      setFacultyCoords(coords)
      await runVerifyLocation(coords.lat, coords.lon, coords.accuracy, selectedClassroomId, showToast)
    } catch (err: any) {
      console.warn('GPS Error:', err)
      setGpsError('Unable to acquire GPS coordinates from browser.')
      setGpsLoading(false)
    }
  }, [runVerifyLocation, selectedClassroomId])

  // Run location detection ONCE on mount
  useEffect(() => {
    handleAcquireLocation(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // When classroom selection changes, re-verify existing coordinates without re-requesting browser GPS
  const handleClassroomChange = (newClassroomId: string) => {
    setSelectedClassroomId(newClassroomId)
    if (facultyCoords) {
      runVerifyLocation(facultyCoords.lat, facultyCoords.lon, facultyCoords.accuracy, newClassroomId, false)
    }
  }

  // Calibrate / Save current GPS pin to MongoDB
  const handleCalibrateCurrentLocation = async () => {
    if (!facultyCoords) {
      toast.error('No GPS coordinates acquired yet')
      return
    }
    setCalibrating(true)
    try {
      const res = await attendanceService.calibrateLocation({
        name: `Calibrated Pin (${facultyCoords.lat.toFixed(4)}, ${facultyCoords.lon.toFixed(4)})`,
        latitude: facultyCoords.lat,
        longitude: facultyCoords.lon,
        allowed_radius_meters: 500.0
      })
      toast.success(res.message || 'Current location saved as authorized campus classroom!')
      await refetchLocations()
      await runVerifyLocation(facultyCoords.lat, facultyCoords.lon, facultyCoords.accuracy, selectedClassroomId, true)
    } catch (err: any) {
      toast.error('Failed to calibrate location pin')
    } finally {
      setCalibrating(false)
    }
  }

  // Simulation Helpers for quick testing/demo
  const handleSimulateArrive = async (campusId: 'CAMPUS-PEDATADEPALLI' | 'CAMPUS-MAHALAXMI-NAGAR') => {
    let mockCoords: { lat: number; lon: number; accuracy: number }
    if (campusId === 'CAMPUS-PEDATADEPALLI') {
      mockCoords = { lat: 16.80940, lon: 81.54420, accuracy: 5 }
    } else {
      mockCoords = { lat: 16.81655, lon: 81.52840, accuracy: 5 }
    }
    setFacultyCoords(mockCoords)
    await runVerifyLocation(mockCoords.lat, mockCoords.lon, mockCoords.accuracy, selectedClassroomId, false)
    toast.success(`Simulated arriving at ${campusId === 'CAMPUS-PEDATADEPALLI' ? 'Pedatadepalli Campus' : 'Maha Laxmi Nagar Campus'}`)
  }

  const handleSimulateFarAway = async () => {
    const mockCoords = { lat: 16.83500, lon: 81.51000, accuracy: 10 }
    setFacultyCoords(mockCoords)
    await runVerifyLocation(mockCoords.lat, mockCoords.lon, mockCoords.accuracy, selectedClassroomId, false)
    toast.error('Simulated outside location (2.8 km away)')
  }

  // Verification status
  const isPhysicallyVerified = locationResult?.verified === true
  const isUnlocked = isPhysicallyVerified || bypassGeofence

  // Handle Session Start
  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject) {
      toast.error('Please select a course to start attendance')
      return
    }

    if (!isUnlocked) {
      toast.error('Please verify your location or enable Remote / Bypass mode below.')
      return
    }

    setStarting(true)
    try {
      const payload = {
        subject_id: selectedSubject.id || selectedSubject._id,
        department: selectedSubject.department,
        year: Number(selectedSubject.year),
        section: selectedSubject.section,
        date: sessionDate,
        classroom_id: locationResult?.classroom_id || selectedClassroomId,
        faculty_latitude: facultyCoords?.lat,
        faculty_longitude: facultyCoords?.lon,
        location_bypass: bypassGeofence || !isPhysicallyVerified
      }

      const session = await attendanceService.startSession(payload)
      const sessionId = session.id || session._id
      toast.success('Attendance session created! Launching scanner...')
      navigate(`/faculty/attendance/live/${sessionId}`)
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to start session'
      toast.error(msg)
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-2xs">
        <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs mb-2">
          <Sparkles className="w-3 h-3 mr-1" /> Biometric Lecture Session Setup
        </Badge>
        <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Configure Attendance Session</h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-1">
          Select course parameters and verify your classroom geofence pin to launch the biometric camera roll call.
        </p>
      </div>

      <form onSubmit={handleStartSession} className="space-y-6">
        {/* Step 1: Course & Class Parameters */}
        <Card className="bg-white border-[#e2e8f0] shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-[#0b1c30] font-display flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0058be] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Course & Schedule Parameters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-[#0b1c30]">Assigned Course / Subject *</Label>
                <Select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  disabled={subjectsLoading}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] font-medium text-sm h-10 rounded-lg"
                >
                  {subjectsList.map((s: any) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.subject_code || s.code} — {s.subject_name || s.name} ({s.department} • Y{s.year} Sec {s.section})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Session Date *</Label>
                <Input
                  type="date"
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Target Campus Boundary *</Label>
                <Select
                  value={selectedClassroomId}
                  onChange={e => handleClassroomChange(e.target.value)}
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] font-medium text-sm h-10 rounded-lg"
                >
                  <option value="AUTO">✨ Auto-Detect Nearest Authorized Campus</option>
                  <option value="CAMPUS-PEDATADEPALLI">Pedatadepalli Campus (Ramannagudam Rd, VF5V+GR)</option>
                  <option value="CAMPUS-MAHALAXMI-NAGAR">Maha Laxmi Nagar Campus (Rd Number 8)</option>
                </Select>
              </div>
            </div>

            {/* Target Class Preview */}
            {selectedSubject && (
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0] flex flex-wrap items-center justify-between text-xs gap-2">
                <div>
                  <span className="text-[#64748b] block text-[11px]">Class Dept & Section:</span>
                  <span className="font-semibold text-[#0b1c30]">{selectedSubject.department} • Year {selectedSubject.year} (Section {selectedSubject.section})</span>
                </div>
                <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
                  Active Faculty Assignment
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Location Geofence Verification Status Card */}
        <Card className={`border shadow-2xs transition-all ${
          isUnlocked
            ? 'bg-white border-[#10b981]'
            : 'bg-white border-[#ba1a1a]/40'
        }`}>
          <CardHeader className="pb-3 border-b border-[#e2e8f0]">
            <CardTitle className="text-base font-bold text-[#0b1c30] font-display flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold ${
                  isUnlocked ? 'bg-[#10b981]' : 'bg-[#ba1a1a]'
                }`}>2</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className={`w-4 h-4 ${isUnlocked ? 'text-[#10b981]' : 'text-[#ba1a1a]'}`} />
                  GPS Status & Classroom Geofence (500m)
                </span>
              </div>

              <Badge className={isUnlocked
                ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] text-xs font-semibold'
                : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6] text-xs font-semibold'
              }>
                {bypassGeofence ? (
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-600" /> Remote Mode Active</span>
                ) : isPhysicallyVerified ? (
                  <span className="flex items-center gap-1"><Unlock className="w-3 h-3 text-emerald-600" /> In Campus Geofence</span>
                ) : (
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Outside Geofence</span>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Status Display */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isUnlocked
                ? 'bg-[#ecfdf5]/50 border-[#a7f3d0]'
                : 'bg-[#ffdad6]/30 border-[#ffdad6]'
            }`}>
              <div className="flex items-center gap-2.5">
                {isUnlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#ba1a1a] shrink-0" />
                )}
                <div>
                  <h3 className={`font-bold text-sm ${isUnlocked ? 'text-[#065f46]' : 'text-[#ba1a1a]'}`}>
                    {bypassGeofence
                      ? '⚡ Remote / Test Mode: Geofence restriction bypassed'
                      : isPhysicallyVerified
                        ? '✅ Verified within authorized campus classroom'
                        : '❌ Device outside 500m campus boundary'}
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    {locationResult?.message || (gpsLoading ? 'Acquiring device GPS coordinates...' : 'GPS telemetry synchronized.')}
                  </p>
                </div>
              </div>

              {locationResult && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#e2e8f0]/60 text-xs">
                  <div>
                    <span className="text-[#64748b] block text-[11px]">Current Distance</span>
                    <span className={`font-mono font-bold text-sm ${isPhysicallyVerified ? 'text-[#065f46]' : 'text-[#ba1a1a]'}`}>
                      {Math.round(locationResult.distance_meters)} meters
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[11px]">Allowed Geofence</span>
                    <span className="font-semibold text-[#0b1c30]">Within 500 meters</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[#64748b] block text-[11px]">Nearest Campus</span>
                    <span className="font-medium text-[#0b1c30] truncate block">{locationResult.classroom_name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live GPS Diagnostics & Coordinates */}
            <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0] space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#0058be]" /> Live Coordinates:
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcquireLocation(true)}
                  disabled={gpsLoading}
                  className="h-7 text-xs border-[#e2e8f0] bg-white text-[#0058be]"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${gpsLoading ? 'animate-spin' : ''}`} /> Refresh GPS
                </Button>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-[#e2e8f0] font-mono text-[11px] text-[#0b1c30] space-y-1">
                <div className="flex justify-between">
                  <span>Latitude: <strong>{facultyCoords?.lat ? facultyCoords.lat.toFixed(6) : 'Acquiring...'}</strong></span>
                  <span>Longitude: <strong>{facultyCoords?.lon ? facultyCoords.lon.toFixed(6) : 'Acquiring...'}</strong></span>
                </div>
                {facultyCoords?.accuracy && (
                  <div className="text-[#64748b] text-[10px]">
                    Accuracy Radius: ±{Math.round(facultyCoords.accuracy)} meters
                  </div>
                )}
              </div>

              {/* One-Click Options if Outside Campus */}
              {!isPhysicallyVerified && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">Currently outside campus boundary ({Math.round(locationResult?.distance_meters || 0)}m)</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        If you are testing from home/remote or present in another hall, choose an option below:
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setBypassGeofence(!bypassGeofence)}
                      className={`h-8 text-xs font-bold rounded-lg flex-1 ${
                        bypassGeofence
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      {bypassGeofence ? '✓ Remote Mode Enabled' : 'Enable Remote / Test Mode'}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCalibrateCurrentLocation}
                      isLoading={calibrating}
                      className="h-8 text-xs font-semibold bg-white border-amber-300 text-amber-900 hover:bg-amber-100 flex-1"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Set Location as Campus Pin
                    </Button>
                  </div>
                </div>
              )}

              {/* Simulation Quick-Test Buttons */}
              <div className="pt-2 border-t border-[#e2e8f0]">
                <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
                  1-Click Testing / Demo Pins:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSimulateArrive('CAMPUS-PEDATADEPALLI')}
                    className="h-7 text-[11px] border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46] hover:bg-[#d1fae5]"
                  >
                    📍 Simulate: At Pedatadepalli (24m away)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSimulateArrive('CAMPUS-MAHALAXMI-NAGAR')}
                    className="h-7 text-[11px] border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46] hover:bg-[#d1fae5]"
                  >
                    📍 Simulate: At Maha Laxmi Nagar (30m away)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSimulateFarAway}
                    className="h-7 text-[11px] border-[#ffdad6] bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ffdad6]"
                  >
                    ❌ Simulate: Outside (2.8km)
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={!isUnlocked || starting}
                isLoading={starting}
                className={`w-full font-bold h-12 text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isUnlocked
                    ? 'bg-[#0058be] hover:bg-[#004395] text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>START ATTENDANCE (LAUNCH BIOMETRIC SCANNER)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>LOCKED — ENABLE REMOTE MODE OR BE WITHIN 500M</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
