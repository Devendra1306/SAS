import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  allowedRoles: string[]
}

const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#2170e4] border-t-transparent shadow-xs" />
          <p className="text-xs font-semibold text-[#64748b] font-mono tracking-wider">AUTHENTICATING...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    const loginPath = allowedRoles.includes('STUDENT') ? '/student-login' : '/login'
    return <Navigate to={loginPath} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
