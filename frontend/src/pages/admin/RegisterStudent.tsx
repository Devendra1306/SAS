import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import {
  UserPlus, Camera, Upload, CheckCircle2, AlertCircle,
  Sparkles, ArrowRight, ArrowLeft, Trash2, RefreshCw, ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { studentsService } from '@/services/students.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'

export default function RegisterStudent() {
  const navigate = useNavigate()
  const webcamRef = useRef<Webcam>(null)

  // Step indicator
  const [step, setStep] = useState<1 | 2>(1)
  const [createdStudent, setCreatedStudent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  // Step 1: Student Details Form
  const [formData, setFormData] = useState({
    student_id: '',
    roll_number: '',
    name: '',
    email: '',
    phone: '',
    department: 'CSE',
    year: 4,
    section: 'A',
    password: 'Student@123',
  })

  // Step 2: Face Images Captured / Uploaded
  const [faceImages, setFaceImages] = useState<{ id: string; base64: string; preview: string; file?: File }[]>([])
  const [enrollmentMethod, setEnrollmentMethod] = useState<'camera' | 'upload'>('camera')

  // Handle Step 1 submit: Create Student in MongoDB
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await studentsService.createStudent({
        ...formData,
        year: Number(formData.year),
      })
      setCreatedStudent(res)
      toast.success(`Student profile created for ${formData.name}!`)
      setStep(2)
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create student'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Handle Camera Frame Capture
  const handleCaptureFrame = () => {
    if (!webcamRef.current) return
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      if (faceImages.length >= 5) {
        toast.error('Maximum 5 face samples allowed')
        return
      }
      const newImg = {
        id: Math.random().toString(36).substring(7),
        base64: imageSrc,
        preview: imageSrc,
      }
      setFaceImages(prev => [...prev, newImg])
      toast.success(`Captured sample #${faceImages.length + 1}`)
    }
  }

  // Handle File Upload Drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (faceImages.length >= 5) return
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaceImages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            base64: reader.result as string,
            preview: reader.result as string,
            file,
          }
        ])
      }
      reader.readAsDataURL(file)
    })
    toast.success('Images added to enrollment queue')
  }

  // Remove sample
  const removeSample = (id: string) => {
    setFaceImages(prev => prev.filter(img => img.id !== id))
  }

  // Handle Step 2 submit: Upload Vectors to Pinecone
  const handleEnrollFaces = async () => {
    if (faceImages.length === 0) {
      toast.error('Please capture or upload at least 1 face image')
      return
    }

    setEnrolling(true)
    try {
      const studentId = createdStudent?.student_id || formData.student_id

      // Convert base64 to Blob files
      const blobFiles = await Promise.all(
        faceImages.map(async (img, idx) => {
          if (img.file) return img.file
          const res = await fetch(img.base64)
          const blob = await res.blob()
          return new File([blob], `face_${idx + 1}.jpg`, { type: 'image/jpeg' })
        })
      )

      const form = new FormData()
      blobFiles.forEach(f => {
        form.append('files', f)
      })

      await studentsService.enrollFace(studentId, form)
      toast.success('Face embeddings generated and stored in Pinecone!')
      navigate('/admin/students')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Face enrollment failed'
      toast.error(msg)
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Banner */}
      <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-xs">
            Step {step} of 2
          </Badge>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">
            {step === 1 ? 'Register New Student' : 'Biometric Face Enrollment'}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#64748b] mt-1">
          {step === 1
            ? 'Enter student identity, academic class allocation, and login credentials.'
            : `Capture face vector samples for ${createdStudent?.name || formData.name} (${createdStudent?.student_id || formData.student_id}).`}
        </p>
      </div>

      {/* STEP 1: Student Information Form */}
      {step === 1 && (
        <Card className="bg-white border-[#e2e8f0] shadow-2xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Student Academic Identity</CardTitle>
            <CardDescription className="text-xs text-[#64748b]">All fields marked with an asterisk (*) are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Student ID *</Label>
                  <Input
                    className="bg-white border-[#e2e8f0] text-[#0b1c30] font-mono text-sm uppercase"
                    placeholder="e.g. 23A81A4325"
                    required
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Roll Number *</Label>
                  <Input
                    className="bg-white border-[#e2e8f0] text-[#0b1c30] font-mono text-sm uppercase"
                    placeholder="e.g. 23A81A4325"
                    required
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Full Name *</Label>
                <Input
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                  placeholder="e.g. Devendra Sagar"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Email Address *</Label>
                  <Input
                    className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                    type="email"
                    placeholder="devendra@sas.edu"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Phone Number</Label>
                  <Input
                    className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Department *</Label>
                  <Select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Year *</Label>
                  <Select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Section *</Label>
                  <Select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0b1c30]">Student Portal Password *</Label>
                <Input
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button type="submit" isLoading={loading} className="bg-[#0058be] hover:bg-[#004395] text-white font-semibold text-xs h-10 px-6 rounded-lg shadow-xs">
                  Continue to Biometric Enrollment <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Biometric Face Vector Enrollment */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="bg-white border-[#e2e8f0] shadow-2xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Capture Face Biometrics</CardTitle>
                <CardDescription className="text-xs text-[#64748b]">
                  Provide 1 to 5 clear frontal photos for 512-dim ArcFace vector extraction
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={enrollmentMethod === 'camera' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEnrollmentMethod('camera')}
                  className={enrollmentMethod === 'camera' ? 'bg-[#0058be] text-white text-xs h-8' : 'border-[#e2e8f0] text-xs h-8'}
                >
                  <Camera className="w-3.5 h-3.5 mr-1" /> Webcam
                </Button>
                <Button
                  type="button"
                  variant={enrollmentMethod === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEnrollmentMethod('upload')}
                  className={enrollmentMethod === 'upload' ? 'bg-[#0058be] text-white text-xs h-8' : 'border-[#e2e8f0] text-xs h-8'}
                >
                  <Upload className="w-3.5 h-3.5 mr-1" /> Upload Photos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollmentMethod === 'camera' ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative w-full max-w-md aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-[#e2e8f0] shadow-sm">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-[#2170e4]/50 rounded-xl pointer-events-none m-6" />
                  </div>
                  <Button
                    type="button"
                    onClick={handleCaptureFrame}
                    className="bg-[#0058be] hover:bg-[#004395] text-white text-xs font-semibold h-9 rounded-lg"
                  >
                    <Camera className="w-4 h-4 mr-1.5" /> Capture Frame ({faceImages.length}/5)
                  </Button>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-[#dce9ff] rounded-xl text-center bg-[#f8f9ff]">
                  <Upload className="w-10 h-10 mx-auto text-[#0058be] mb-2" />
                  <p className="text-sm font-semibold text-[#0b1c30]">Drag & drop student photos here</p>
                  <p className="text-xs text-[#64748b] mt-1">JPEG or PNG format, minimum 200x200px</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="mt-3 max-w-xs mx-auto text-xs bg-white"
                  />
                </div>
              )}

              {/* Sample Previews Grid */}
              {faceImages.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-[#0b1c30]">Captured Samples ({faceImages.length}/5):</p>
                  <div className="grid grid-cols-5 gap-3">
                    {faceImages.map((img, i) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[#e2e8f0] aspect-square bg-slate-100">
                        <img src={img.preview} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSample(img.id)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#e2e8f0] flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-[#e2e8f0] bg-white text-[#0b1c30] text-xs h-9"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/students')}
                    className="border-[#e2e8f0] bg-white text-[#64748b] text-xs h-9"
                  >
                    Skip Biometrics
                  </Button>
                  <Button
                    type="button"
                    onClick={handleEnrollFaces}
                    isLoading={enrolling}
                    className="bg-[#0058be] hover:bg-[#004395] text-white text-xs font-semibold h-9 px-6 rounded-lg shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" /> Save & Enroll Face Vectors
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
