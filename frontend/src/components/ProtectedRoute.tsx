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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
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
