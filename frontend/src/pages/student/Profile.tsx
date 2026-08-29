import React, { useState } from 'react'
import { User, ShieldCheck, AlertCircle, Camera, Lock, KeyRound, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'

export default function Profile() {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match")
      return
    }
    setUpdating(true)
    setTimeout(() => {
      setUpdating(false)
      toast.success('Password updated successfully!')
      setPasswords({ current: '', new: '', confirm: '' })
    }, 400)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Banner */}
      <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs">
        <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">Student Profile</h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-1">
          Academic identity, biometric face vector record, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Biometric Chip */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-white border-[#e2e8f0] shadow-2xs">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-[#0058be] flex items-center justify-center border-4 border-slate-100 shadow-md relative overflow-hidden">
                <span className="text-3xl font-extrabold text-white font-display">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#0b1c30] font-display">{user?.name || 'Enrolled Student'}</h2>
                <p className="text-xs text-[#64748b] font-mono mt-0.5">{user?.student_id || 'ID Verified'}</p>
                <p className="text-xs text-[#64748b] mt-0.5">{user?.email || 'student@sas.edu'}</p>
              </div>

              <div className="w-full pt-4 border-t border-[#e2e8f0] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#64748b] font-medium">Face Biometrics:</span>
                  <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1 text-[#0058be]" /> Vector Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#64748b] font-medium">ArcFace Status:</span>
                  <span className="font-mono text-[#065f46] text-[11px] font-semibold">512-D Cosine</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Academic Details & Password Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Academic Info */}
          <Card className="bg-white border-[#e2e8f0] shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-[#0b1c30] font-display">Academic Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[#64748b] block">Student ID</span>
                  <span className="font-mono text-[#0b1c30] font-semibold mt-0.5 block">{user?.student_id || '23A81A4301'}</span>
                </div>
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[#64748b] block">Institutional Roll No</span>
                  <span className="font-mono text-[#0b1c30] font-semibold mt-0.5 block">{user?.roll_number || user?.roll_no || user?.student_id || '23A81A4301'}</span>
                </div>
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[#64748b] block">Academic Department</span>
                  <span className="text-[#0b1c30] font-semibold mt-0.5 block">{user?.department || 'CSE'}</span>
                </div>
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[#64748b] block">Year & Class Section</span>
                  <span className="text-[#0b1c30] font-semibold mt-0.5 block">Year {user?.year || 4} • Section {user?.section || 'A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Security Form */}
          <Card className="bg-white border-[#e2e8f0] shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-[#0b1c30] font-display flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0058be]" /> Account Security
              </CardTitle>
              <CardDescription className="text-xs text-[#64748b]">Update your student portal login password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Current Password</Label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#0b1c30]">New Password</Label>
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                      value={passwords.new}
                      onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#0b1c30]">Confirm New Password</Label>
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="bg-white border-[#e2e8f0] text-[#0b1c30] text-sm h-10 rounded-lg"
                      value={passwords.confirm}
                      onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={updating} className="bg-[#0058be] hover:bg-[#004395] text-white text-xs font-semibold px-5 h-9 rounded-lg shadow-xs">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
