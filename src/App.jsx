import React, { useContext, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext'
import useSessionTimeout from './hooks/useSessionTimeout'
import { usePermission } from './hooks/usePermission'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import SessionTimeoutWarning from './components/common/SessionTimeoutWarning'
import LoadingSpinner from './components/common/LoadingSpinner'
import Dashboard from './pages/dashboard/Dashboard'

// Lazy-loaded module pages (code splitting — reduces initial bundle)
const Documents = lazy(() => import('./pages/documents/Documents'))
const Capa = lazy(() => import('./pages/capa/Capa'))
const Deviations = lazy(() => import('./pages/deviations/Deviations'))
const ChangeControls = lazy(() => import('./pages/change-controls/ChangeControls'))
const Complaints = lazy(() => import('./pages/complaints/Complaints'))
const Training = lazy(() => import('./pages/training/Training'))
const Audits = lazy(() => import('./pages/audits/Audits'))
const Suppliers = lazy(() => import('./pages/suppliers/Suppliers'))
const Risk = lazy(() => import('./pages/risk/Risk'))
const Equipment = lazy(() => import('./pages/equipment/Equipment'))
const Production = lazy(() => import('./pages/production/Production'))
const Analytics = lazy(() => import('./pages/analytics/Analytics'))
const Admin = lazy(() => import('./pages/admin/Admin'))

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) {
    return (
      <div className="min-h-screen bg-eqms-dark flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

/**
 * RBAC Route Guard — 21 CFR Part 11 §11.10(g)
 * Restricts route access based on user permissions
 */
function RBACRoute({ permission, children }) {
  const { can } = usePermission()

  if (permission && !can(permission)) {
    return (
      <div className="p-8 text-center">
        <div className="card p-12 max-w-md mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-400">
            You do not have permission to access this module.
            Contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function SessionManager() {
  const { logout, isAuthenticated } = useContext(AuthContext)
  const { showWarning, extendSession } = useSessionTimeout(logout, isAuthenticated)
  if (!showWarning) return null
  return <SessionTimeoutWarning onExtend={extendSession} />
}

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner message="Loading module..." />
  </div>
)

export default function App() {
  return (
    <>
    <SessionManager />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="documents" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_documents"><Documents /></RBACRoute>
          </Suspense>
        } />
        <Route path="capa" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_capa"><Capa /></RBACRoute>
          </Suspense>
        } />
        <Route path="deviations" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_deviations"><Deviations /></RBACRoute>
          </Suspense>
        } />
        <Route path="change-controls" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_change_controls"><ChangeControls /></RBACRoute>
          </Suspense>
        } />
        <Route path="complaints" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_complaints"><Complaints /></RBACRoute>
          </Suspense>
        } />
        <Route path="training" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_training"><Training /></RBACRoute>
          </Suspense>
        } />
        <Route path="audits" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_audits"><Audits /></RBACRoute>
          </Suspense>
        } />
        <Route path="suppliers" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_suppliers"><Suppliers /></RBACRoute>
          </Suspense>
        } />
        <Route path="risk" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_risk"><Risk /></RBACRoute>
          </Suspense>
        } />
        <Route path="equipment" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_equipment"><Equipment /></RBACRoute>
          </Suspense>
        } />
        <Route path="production" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_production"><Production /></RBACRoute>
          </Suspense>
        } />
        <Route path="analytics" element={
          <Suspense fallback={<PageLoader />}>
            <Analytics />
          </Suspense>
        } />
        <Route path="admin" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_admin"><Admin /></RBACRoute>
          </Suspense>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
