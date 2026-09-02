import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService } from '@/services/auth.service'
import { locationService, LocationData } from '@/services/location.service'

export interface AuthUser {
  id: string
  username: string
  email: string
  name: string
  role: 'ADMIN' | 'FACULTY' | 'STUDENT'
  student_id?: string
  roll_number?: string
  roll_no?: string
  department?: string
  year?: number
  section?: string
  faculty_id?: string
  face_enrolled?: boolean
  last_location?: any
  [key: string]: any
}

interface AuthContextType {
  user: AuthUser | null
  role: string | null
  isAuthenticated: boolean
  isLoading: boolean
  currentLocation: LocationData | null
  isLocationActive: boolean
  refreshLocation: () => Promise<LocationData | null>
  login: (credentials: { username_or_email: string; password: string }) => Promise<any>
  studentLogin: (credentials: { student_id_or_email: string; password: string }) => Promise<any>
  logout: () => void
  refreshToken?: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(locationService.getCachedLocation())
  const [isLocationActive, setIsLocationActive] = useState<boolean>(false)

  // Listen to locationService updates
  useEffect(() => {
    const unsub = locationService.subscribe((loc) => {
      if (loc) {
        setCurrentLocation(loc)
        setIsLocationActive(true)
      }
    })
    return unsub
  }, [])

  const refreshLocation = useCallback(async () => {
    try {
      const loc = await locationService.getCurrentLocation(true)
      await locationService.syncWithBackend(loc)
      setCurrentLocation(loc)
      setIsLocationActive(true)
      return loc
    } catch (e) {
      console.warn('Failed to refresh location:', e)
      return null
    }
  }, [])

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token || token === 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('role')
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const profile = await authService.getMe()
      setUser(profile)
      // Automatically sync location telemetry on app load
      locationService.syncWithBackend().catch(() => {})
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('role')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (credentials: { username_or_email: string; password: string }) => {
    const data = await authService.login(credentials)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('role', data.role)
    try {
      const profile = await authService.getMe()
      setUser(profile)
    } catch {
      setUser({
        id: data.user_id,
        username: data.name || credentials.username_or_email,
        email: '',
        name: data.name || credentials.username_or_email,
        role: data.role,
      })
    }
    // Automatically capture and record location immediately upon login
    locationService.syncWithBackend().catch(err => console.warn('Login location sync warning:', err))
    return data
  }

  const studentLogin = async (credentials: { student_id_or_email: string; password: string }) => {
    const data = await authService.studentLogin(credentials)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('role', 'STUDENT')
    try {
      const profile = await authService.getMe()
      setUser(profile)
    } catch {
      setUser({
        id: data.user_id,
        username: credentials.student_id_or_email,
        email: '',
        name: data.name || 'Student',
        role: 'STUDENT',
        student_id: credentials.student_id_or_email,
      })
    }
    // Automatically capture and record location immediately upon login
    locationService.syncWithBackend().catch(err => console.warn('Student login location sync warning:', err))
    return data
  }

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('role')
    setUser(null)
    window.location.href = '/'
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || localStorage.getItem('role'),
        isAuthenticated: !!user || !!localStorage.getItem('access_token'),
        isLoading,
        currentLocation,
        isLocationActive,
        refreshLocation,
        login,
        studentLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
