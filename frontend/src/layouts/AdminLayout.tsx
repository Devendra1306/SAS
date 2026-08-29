import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Calendar, AlertTriangle, Award, FileSpreadsheet,
  Settings as SettingsIcon, LogOut, Search, Bell, ShieldCheck, UserPlus, Sparkles, Clock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Student Directory', path: '/admin/students', icon: GraduationCap },
    { label: 'Register Student', path: '/admin/students/register', icon: UserPlus },
    { label: 'Faculty Staff', path: '/admin/faculty', icon: Users },
    { label: 'Subject Catalog', path: '/admin/subjects', icon: BookOpen },
    { label: 'Attendance Records', path: '/admin/attendance', icon: Clock },
    { label: 'Defaulters (<50%)', path: '/admin/attendance/low', icon: AlertTriangle },
    { label: 'Honor Roll (≥90%)', path: '/admin/attendance/high', icon: Award },
    { label: 'Institutional Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'System Settings', path: '/admin/settings', icon: SettingsIcon },
  ]

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans h-screen flex overflow-hidden">
      {/* SideNavBar - 240px Fixed Sidebar matching sas_admin_dashboard/code.html */}
      <nav className="hidden md:flex w-[240px] h-screen fixed left-0 top-0 bg-[#f8f9ff] border-r border-[#e2e8f0] flex-col p-4 z-40">
        {/* Brand Header */}
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-black text-[#0b1c30] leading-none tracking-tighter">SAS</h1>
            <Badge className="bg-[#eff4ff] text-[#0058be] border-[#dce9ff] text-[10px] py-0 font-mono">v2.0</Badge>
          </div>
          <p className="text-xs text-[#64748b] font-medium mt-1">Admin Dashboard</p>
        </div>

        {/* Nav Links */}
        <div className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2170e4] text-white shadow-xs'
                    : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#64748b]'}`} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>

        {/* User Profile Footer */}
        <div className="mt-auto border-t border-[#e2e8f0] pt-3 px-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#0058be] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#0b1c30] truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-[#64748b] truncate">Institutional Control</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-[240px] w-full min-h-screen overflow-hidden">
        {/* TopNavBar matching sas_admin_dashboard/code.html */}
        <header className="h-16 w-full sticky top-0 z-30 bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#e2e8f0] flex justify-between items-center px-6 md:px-8">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-[#0b1c30] md:hidden">SAS Admin</h2>
            <div className="hidden md:flex relative items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search students, subjects, faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-[#eff4ff] border border-[#e2e8f0] rounded-full text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2170e4] focus:border-[#2170e4] transition-all w-[320px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white border border-[#e2e8f0] rounded-full text-xs font-semibold text-[#065f46]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span>Pinecone 512-D Online</span>
            </div>
            <button
              onClick={() => navigate('/admin/settings')}
              className="p-2 text-slate-500 hover:bg-[#eff4ff] rounded-full transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6]/60 border border-[#ffdad6] hover:bg-[#ffdad6] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

        {/* Main Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8f9ff]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
