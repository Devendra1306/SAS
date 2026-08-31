import React from 'react'

export default function ContentLoader() {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col gap-6 animate-pulse p-2">
      {/* Top Header Placeholder */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200/80 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-slate-200/70 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200/70 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-2xs">
            <div className="h-3 w-16 bg-slate-200/80 rounded" />
            <div className="h-6 w-12 bg-slate-200/80 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs" />
        <div className="h-72 bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs" />
      </div>
    </div>
  )
}
