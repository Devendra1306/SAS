import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-100',
  trend,
  className,
  onClick
}) => (
  <div
    className={cn(
      'bg-white rounded-xl border border-slate-200 p-6 shadow-sm',
      onClick && 'cursor-pointer hover:shadow-md transition-shadow',
      className
    )}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        {trend && (
          <p className={cn(
            'mt-1 text-xs font-medium',
            trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
          )}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
      <div className={cn('rounded-xl p-3', iconBg)}>
        <Icon className={cn('h-6 w-6', iconColor)} />
      </div>
    </div>
  </div>
)
