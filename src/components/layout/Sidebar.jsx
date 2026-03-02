import React, { useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, AlertTriangle, Shield, BookOpen, Truck,
  Target, Wrench, Package, BarChart3, Settings, LogOut, ChevronDown,
  Brain, ClipboardList, FileCheck, Folder, Mail, Flame, Search,
  CheckCircle, Bell, Award, Users, GitBranch, Sliders, Smartphone,
  MessageSquare, GraduationCap, UserCheck, Boxes, Globe, Gauge,
  Thermometer, FlaskConical, RotateCcw, Clipboard, LineChart,
  Bot, Lightbulb, Cog, PenTool, MonitorSmartphone, HelpCircle,
  ShieldCheck, CalendarCheck, FileBarChart, Layers, ClipboardCheck,
  Beaker, ArrowLeftRight, PlayCircle, TrendingUp, Activity, Zap,
  Building2, Microscope, AlertCircle, FilePlus, Scale, Barcode,
  TrendingDown
} from 'lucide-react'
import { AuthContext } from '../../contexts/AuthContext'

/**
 * MODULE_PERMISSIONS — Sidebar filtering based on RBAC
 * 21 CFR Part 11 §11.10(g) — access limited to authorized individuals
 *
 * Rules:
 * - If permissions array is empty [], module is visible to ALL authenticated users
 * - If permissions array has items, user must have ANY of those permissions
 * - Superusers/admins see everything automatically
 * - Dashboard is ALWAYS visible
 */
export const MODULE_PERMISSIONS = {
  documents: ['can_view_documents'],
  capa: ['can_view_capa'],
  deviations: ['can_view_deviations'],
  change_controls: ['can_view_change_controls'],
  complaints: ['can_view_complaints'],
  training: ['can_view_training'],
  audits: ['can_view_audits'],
  suppliers: ['can_view_suppliers'],
  risk: ['can_view_risk'],
  equipment: ['can_view_equipment'],
  production: ['can_view_production'],
  analytics: [], // visible to all authenticated users
  admin: ['can_manage_system'],
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout, hasAnyPermission } = useContext(AuthContext)
  const location = useLocation()
  const [expandedMenu, setExpandedMenu] = useState(null)

  const menuItems = [
    // 1. Dashboard - always visible
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      permission: null, // Always visible
      submenu: [
        { icon: Activity, label: 'Overview & KPIs', href: '/' },
        { icon: Sliders, label: 'Customizable Widgets', href: '/dashboard/widgets' },
      ]
    },
    // 2. Document Control & Labeling
    {
      icon: FileText,
      label: 'Document Control & Labeling',
      permission: null,
      moduleKey: 'documents',
      submenu: [
        { icon: FileText, label: 'Documents', href: '/documents' },
        { icon: ClipboardList, label: 'Electronic Forms', href: '/documents/forms' },
        { icon: Folder, label: 'Device Master Record', href: '/documents/dmr' },
        { icon: FileCheck, label: 'Validation Docs', href: '/documents/validation' },
        { icon: Mail, label: 'Correspondence', href: '/documents/correspondence' },
        { icon: Barcode, label: 'Labels & IFU', href: '/documents/labeling' },
      ]
    },
    // 3. Quality Events
    {
      icon: AlertTriangle,
      label: 'Quality Events',
      permission: null,
      moduleKey: 'capa',
      submenu: [
        { icon: Zap, label: 'CAPA', href: '/capa' },
        { icon: AlertCircle, label: 'Deviations', href: '/deviations' },
        { icon: GitBranch, label: 'Change Control', href: '/change-controls' },
        { icon: MessageSquare, label: 'Post-Market Surveillance', href: '/complaints' },
        { icon: Flame, label: 'Safety & EHS', href: '/safety' },
        { icon: TrendingDown, label: 'Recall Management', href: '/recalls' },
      ]
    },
    // 4. Audit & Regulatory
    {
      icon: Shield,
      label: 'Audit & Regulatory',
      permission: null,
      moduleKey: 'audits',
      submenu: [
        { icon: ClipboardCheck, label: 'Audit Management', href: '/audits' },
        { icon: Search, label: 'Audit Readiness', href: '/audits/readiness' },
        { icon: FilePlus, label: 'Regulatory Submissions', href: '/regulatory/submissions' },
        { icon: Globe, label: 'Regulatory Intelligence', href: '/regulatory/intelligence' },
        { icon: CalendarCheck, label: 'Certificates & Licenses', href: '/regulatory/certificates' },
      ]
    },
    // 5. Training & Competence
    {
      icon: BookOpen,
      label: 'Training',
      permission: null,
      moduleKey: 'training',
      submenu: [
        { icon: GraduationCap, label: 'Training Management', href: '/training' },
        { icon: UserCheck, label: 'Succession Planning', href: '/training/succession' },
      ]
    },
    // 6. Supplier Management
    {
      icon: Truck,
      label: 'Supplier Management',
      permission: null,
      moduleKey: 'suppliers',
      submenu: [
        { icon: CheckCircle, label: 'Supplier Quality', href: '/suppliers' },
        { icon: Globe, label: 'Supply Chain Intel', href: '/suppliers/intelligence' },
      ]
    },
    // 7. Risk & Design
    {
      icon: Target,
      label: 'Risk & Design',
      permission: null,
      moduleKey: 'risk',
      submenu: [
        { icon: Scale, label: 'Risk Management', href: '/risk' },
        { icon: Layers, label: 'Design Controls (IEC 62304)', href: '/risk/design' },
        { icon: Brain, label: 'FMEA + AI', href: '/risk/fmea' },
        { icon: Award, label: 'APQP & PPAP', href: '/risk/apqp' },
        { icon: Gauge, label: 'Performance Evaluation', href: '/risk/performance-eval' },
      ]
    },
    // 8. Equipment & Facilities
    {
      icon: Wrench,
      label: 'Equipment & Facilities',
      permission: null,
      moduleKey: 'equipment',
      submenu: [
        { icon: Wrench, label: 'Equipment & Calibration', href: '/equipment' },
        { icon: Thermometer, label: 'Environmental Monitoring', href: '/equipment/environmental' },
      ]
    },
    // 9. Production & QA
    {
      icon: Package,
      label: 'Production & QA',
      permission: null,
      moduleKey: 'production',
      submenu: [
        { icon: Clipboard, label: 'Batch Records', href: '/production' },
        { icon: Microscope, label: 'Inspection Management', href: '/production/inspection' },
        { icon: Beaker, label: 'Stability & Shelf-Life', href: '/production/stability' },
        { icon: RotateCcw, label: 'Returns & Refurbishment', href: '/production/returns' },
        { icon: PlayCircle, label: 'Validation Execution', href: '/production/validation' },
        { icon: Barcode, label: 'UDI Management', href: '/production/udi' },
      ]
    },
    // 10. Management Review & Analytics - always visible to authenticated users
    {
      icon: BarChart3,
      label: 'Analytics & Review',
      permission: null,
      moduleKey: 'analytics',
      submenu: [
        { icon: FileBarChart, label: 'Management Review', href: '/analytics/review' },
        { icon: TrendingUp, label: 'Predictive Analytics', href: '/analytics/predictive' },
        { icon: Lightbulb, label: 'AI Insights', href: '/analytics' },
        { icon: Bot, label: 'AI Assistant', href: '/analytics/assistant' },
      ]
    },
    // 11. Administration
    {
      icon: Settings,
      label: 'Administration',
      permission: null,
      moduleKey: 'admin',
      submenu: [
        { icon: Users, label: 'Users & Roles', href: '/admin' },
        { icon: GitBranch, label: 'Workflow Builder', href: '/admin/workflows' },
        { icon: PenTool, label: 'No-Code Config', href: '/admin/config' },
        { icon: MonitorSmartphone, label: 'Mobile / Wearable', href: '/admin/mobile' },
        { icon: Cog, label: 'Admin Settings', href: '/admin/settings' },
        { icon: HelpCircle, label: 'Feedback', href: '/admin/feedback' },
      ]
    },
  ]

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  const isMenuActive = (item) => {
    if (item.href) return isActive(item.href)
    if (item.submenu) return item.submenu.some(sub => isActive(sub.href))
    return false
  }

  const toggleMenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  const shouldShowMenu = (item) => {
    // Dashboard always visible
    if (item.permission === null) return true

    // Superusers/admins see everything
    if (user?.is_superuser || user?.role === 'admin') return true

    // Check if user has any of the required permissions
    const requiredPermissions = MODULE_PERMISSIONS[item.moduleKey] || []
    if (requiredPermissions.length === 0) return true // No permissions required = visible to all

    return user && hasAnyPermission(requiredPermissions)
  }

  // Auto-expand the active menu on mount
  React.useEffect(() => {
    for (const item of menuItems) {
      if (item.submenu && item.submenu.some(sub => isActive(sub.href))) {
        setExpandedMenu(item.label)
        break
      }
    }
  }, [location.pathname])

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed lg:static left-0 top-0 h-screen w-64 bg-[#0F172A] border-r border-eqms-border flex flex-col transform transition-transform duration-200 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-4 py-3.5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck size={16} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white">ARNI MEDICA</div>
              <div className="text-[10px] text-blue-400 tracking-widest font-semibold">AI-EQMS</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-1.5 px-2 scrollbar-thin">
          {menuItems.map((item, idx) => (
            shouldShowMenu(item) && (
              <div key={idx} className="mb-0.5">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    isMenuActive(item)
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={16} className={isMenuActive(item) ? 'text-blue-400' : ''} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      expandedMenu === item.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {/* Submenu with animation */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    expandedMenu === item.label ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="ml-5 pl-3 border-l border-white/10 space-y-0.5 py-1">
                    {item.submenu?.map((sub, i) => (
                      <Link
                        key={i}
                        to={sub.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          isActive(sub.href)
                            ? 'text-blue-400 bg-blue-500/10 font-medium'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {sub.icon && <sub.icon size={13} />}
                        <span>{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              {user?.first_name?.[0] || 'M'}{user?.last_name?.[0] || 'K'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate text-white">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : 'MK Parvathaneni'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {user?.email || 'admin@arnimedica.com'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
