import React, { useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, LayoutDashboard, FileText, AlertTriangle, Zap, MessageSquare, CheckSquare, Users, Briefcase, TrendingUp, Wrench, Package, BarChart3, Settings, LogOut, ChevronDown, Shield, Target, GitBranch, BookOpen, Truck, Brain } from 'lucide-react'
import { AuthContext } from '../../contexts/AuthContext'

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const [expandedMenu, setExpandedMenu] = useState(null)

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: FileText, label: 'Documents', href: '/documents' },
    {
      label: 'Quality Events',
      icon: AlertTriangle,
      submenu: [
        { label: 'CAPA', href: '/capa' },
        { label: 'Deviations', href: '/deviations' },
        { label: 'Change Control', href: '/change-controls' },
        { label: 'Complaints', href: '/complaints' },
      ]
    },
    { icon: Shield, label: 'Audits', href: '/audits' },
    { icon: BookOpen, label: 'Training', href: '/training' },
    { icon: Truck, label: 'Suppliers', href: '/suppliers' },
    { icon: Target, label: 'Risk & Design', href: '/risk' },
    { icon: Wrench, label: 'Equipment', href: '/equipment' },
    { icon: Package, label: 'Production', href: '/production' },
    { icon: Brain, label: 'AI Analytics', href: '/analytics' },
    { icon: Users, label: 'Administration', href: '/admin' },
  ]

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed lg:static left-0 top-0 h-screen w-60 bg-[#0F172A] border-r border-eqms-border flex flex-col transform transition-transform duration-200 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight">ARNI MEDICA</div>
              <div className="text-[10px] text-blue-400 tracking-widest font-semibold">AI-EQMS</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {menuItems.map((item, idx) => (
            <div key={idx}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-3 py-2 my-0.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform ${expandedMenu === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMenu === item.label && (
                    <div className="ml-7 border-l border-eqms-border space-y-0.5 mb-1">
                      {item.submenu.map((sub, i) => (
                        <Link key={i} to={sub.href} className={`block px-3 py-1.5 text-xs rounded-r-lg transition-colors ${isActive(sub.href) ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 my-0.5 rounded-lg text-sm transition-colors ${isActive(item.href) ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5'}`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              {user?.first_name?.[0] || 'M'}{user?.last_name?.[0] || 'K'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'MK Parvathaneni'}</div>
              <div className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@arnimedica.com'}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
