export function formatDate(date: string | Date | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatTime(date: string | Date | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return '—'
  return `${formatDate(date)} ${formatTime(date)}`
}

export function formatPercentage(value: number | undefined, decimals = 1): string {
  if (value === undefined || value === null) return '0%'
  return `${value.toFixed(decimals)}%`
}

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 75) return 'text-emerald-600'
  if (percentage >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function getAttendanceBgColor(percentage: number): string {
  if (percentage >= 75) return 'bg-emerald-100 text-emerald-800'
  if (percentage >= 50) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}

export function getAttendanceStatus(percentage: number): string {
  if (percentage >= 75) return 'GOOD'
  if (percentage >= 50) return 'WARNING'
  return 'CRITICAL'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
}
