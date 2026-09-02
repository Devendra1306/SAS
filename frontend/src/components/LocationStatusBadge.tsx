import React, { useState } from 'react'
import { MapPin, Navigation, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export const LocationStatusBadge: React.FC = () => {
  const { currentLocation, isLocationActive, refreshLocation } = useAuth()
  const [open, setOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setRefreshing(true)
    try {
      const loc = await refreshLocation()
      if (loc) {
        toast.success(`Location synced: ${loc.city || 'Tadepalligudem'}`)
      } else {
        toast.error('Failed to sync location')
      }
    } finally {
      setRefreshing(false)
    }
  }

  const isVerified = currentLocation?.verified_on_campus
  const sourceLabel = currentLocation?.source?.toUpperCase() || 'GPS'
  const distance = currentLocation?.distance_meters != null ? Math.round(currentLocation.distance_meters) : null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Click to view real-time location telemetry"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all bg-white border border-[#e2e8f0] hover:border-[#2170e4]/40 hover:bg-[#eff4ff]/60 shadow-2xs text-[#0b1c30]"
      >
        <span className="relative flex h-2 w-2">
          {isLocationActive ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          )}
        </span>

        <MapPin className="w-3.5 h-3.5 text-[#2170e4]" />

        <span className="hidden sm:inline font-mono text-[11px] font-semibold text-[#1e293b]">
          {currentLocation ? (
            isVerified ? (
              <span className="text-emerald-700">Campus Pin ({distance != null ? `${distance}m` : 'Verified'})</span>
            ) : (
              <span>
                {currentLocation.city || 'Tadepalligudem'} ({sourceLabel})
              </span>
            )
          ) : (
            'Syncing Location...'
          )}
        </span>

        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#0058be] font-bold border border-[#dce9ff]">
          LIVE
        </span>
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl p-4 z-50 font-sans"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#eff4ff] text-[#0058be] flex items-center justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0b1c30]">Location Telemetry</h4>
                    <span className="text-[10px] text-[#64748b]">Real-Time Attendance Geofence</span>
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-1.5 rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#64748b] hover:text-[#0058be] transition-colors"
                  title="Force re-acquire coordinates"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0058be]' : ''}`} />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                {currentLocation ? (
                  <>
                    <div className="flex justify-between items-center py-1 border-b border-[#f8fafc]">
                      <span className="text-[#64748b]">Coordinates:</span>
                      <span className="font-mono text-[11px] font-semibold text-[#0f172a]">
                        {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#f8fafc]">
                      <span className="text-[#64748b]">Accuracy:</span>
                      <span className="font-mono text-[11px] text-[#0f172a]">
                        ±{Math.round(currentLocation.accuracy)}m ({currentLocation.source})
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#f8fafc]">
                      <span className="text-[#64748b]">Nearest Campus:</span>
                      <span className="font-medium text-[11px] text-[#0f172a] text-right truncate max-w-[160px]">
                        {currentLocation.nearest_campus || 'Pedatadepalli Campus'}
                      </span>
                    </div>

                    {distance != null && (
                      <div className="flex justify-between items-center py-1 border-b border-[#f8fafc]">
                        <span className="text-[#64748b]">Distance to Pin:</span>
                        <span className="font-mono text-[11px] font-bold text-[#0058be]">
                          {distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} meters`}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[#64748b]">Spot Attendance:</span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Within Perimeter
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Tracking Active
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-[#64748b]">
                    <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-[#2170e4]" />
                    <p className="text-xs">Acquiring current GPS pin...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
