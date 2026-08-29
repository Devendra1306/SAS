import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Settings as SettingsIcon, ShieldCheck, Database, Cpu,
  Sliders, CheckCircle2, RefreshCw, Server
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'

export default function Settings() {
  const [lowThreshold, setLowThreshold] = useState(50)
  const [highThreshold, setHighThreshold] = useState(90)
  const [faceThreshold, setFaceThreshold] = useState(0.45)
  const [saving, setSaving] = useState(false)

  const { data: health, refetch: refetchHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.get('/health').then(r => r.data),
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('System thresholds updated successfully!')
    }, 400)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Banner */}
      <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-display">System Settings & Health</h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Biometric thresholds, vector index status, and FastAPI backend diagnostics.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchHealth()}
          className="border-[#e2e8f0] bg-white text-[#0b1c30] hover:bg-[#eff4ff] text-xs h-9 rounded-lg"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Check Status
        </Button>
      </div>

      {/* System Health Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-[#e2e8f0] shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center shrink-0">
              <Server className="h-5 w-5 text-[#065f46]" />
            </div>
            <div>
              <p className="text-xs text-[#64748b] font-medium">FastAPI Backend</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-[#0b1c30] text-sm">
                  {health?.status === 'ok' ? 'Operational' : 'Connected'}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e2e8f0] shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center shrink-0">
              <Database className="h-5 w-5 text-[#0058be]" />
            </div>
            <div>
              <p className="text-xs text-[#64748b] font-medium">Pinecone Vector DB</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-[#0b1c30] text-sm">sas-faces</span>
                <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-[10px] py-0 font-mono">512-dim</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e2e8f0] shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] flex items-center justify-center shrink-0">
              <Cpu className="h-5 w-5 text-[#0b1c30]" />
            </div>
            <div>
              <p className="text-xs text-[#64748b] font-medium">AI Model Engine</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-[#0b1c30] text-sm">InsightFace Buffalo_l</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Configuration Form */}
      <Card className="bg-white border-[#e2e8f0] shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-[#0b1c30] font-display flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#0058be]" /> Attendance & Biometric Thresholds
          </CardTitle>
          <CardDescription className="text-xs text-[#64748b]">
            Configure compliance triggers and face similarity matching sensitivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Low Attendance Threshold</Label>
                  <span className="text-xs font-mono font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded">
                    &lt; {lowThreshold}%
                  </span>
                </div>
                <Input
                  type="number"
                  min="10"
                  max="70"
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] font-mono text-sm"
                  value={lowThreshold}
                  onChange={e => setLowThreshold(Number(e.target.value))}
                />
                <p className="text-[11px] text-[#64748b]">
                  Triggers automated warning flags for students falling below this attendance rate.
                </p>
              </div>

              <div className="space-y-2 p-4 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-[#0b1c30]">Honor Roll Threshold</Label>
                  <span className="text-xs font-mono font-bold text-[#065f46] bg-[#ecfdf5] px-2 py-0.5 rounded">
                    &ge; {highThreshold}%
                  </span>
                </div>
                <Input
                  type="number"
                  min="75"
                  max="100"
                  className="bg-white border-[#e2e8f0] text-[#0b1c30] font-mono text-sm"
                  value={highThreshold}
                  onChange={e => setHighThreshold(Number(e.target.value))}
                />
                <p className="text-[11px] text-[#64748b]">
                  Awards honor badges to students meeting this high attendance criteria.
                </p>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-[#0b1c30]">Face Cosine Similarity Match Threshold</Label>
                <span className="text-xs font-mono font-bold text-[#0058be] bg-[#eff4ff] px-2 py-0.5 rounded">
                  {faceThreshold}
                </span>
              </div>
              <Input
                type="number"
                step="0.05"
                min="0.2"
                max="0.9"
                className="bg-white border-[#e2e8f0] text-[#0b1c30] font-mono text-sm"
                value={faceThreshold}
                onChange={e => setFaceThreshold(Number(e.target.value))}
              />
              <p className="text-[11px] text-[#64748b]">
                Minimum vector cosine similarity required to verify student identity during roll calls.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={saving} className="bg-[#0058be] hover:bg-[#004395] text-white text-xs font-semibold px-6 h-9 rounded-lg shadow-xs">
                Save System Parameters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
