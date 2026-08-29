import React from 'react'
import { Badge } from '@/components/ui/Badge'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'UNKNOWN'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; variant: any }> = {
  PRESENT: { label: 'Present', variant: 'present' },
  ABSENT: { label: 'Absent', variant: 'absent' },
  LATE: { label: 'Late', variant: 'late' },
  EXCUSED: { label: 'Excused', variant: 'excused' },
  UNKNOWN: { label: 'Unknown', variant: 'unknown' },
}

interface Props {
  status: string
}

export const AttendanceStatusBadge: React.FC<Props> = ({ status }) => {
  const config = STATUS_CONFIG[status as AttendanceStatus] || { label: status, variant: 'secondary' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
