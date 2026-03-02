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
const Labeling = lazy(() => import('./pages/documents/Labeling'))
const Forms = lazy(() => import('./pages/documents/Forms'))
const DMR = lazy(() => import('./pages/documents/DMR'))
const Validation = lazy(() => import('./pages/documents/Validation'))
const Correspondence = lazy(() => import('./pages/documents/Correspondence'))

const Capa = lazy(() => import('./pages/capa/Capa'))
const Deviations = lazy(() => import('./pages/deviations/Deviations'))
const ChangeControls = lazy(() => import('./pages/change-controls/ChangeControls'))
const Complaints = lazy(() => import('./pages/complaints/Complaints'))
const PMS = lazy(() => import('./pages/complaints/PMS'))
const SafetyEHS = lazy(() => import('./pages/safety/Safety'))
const Recalls = lazy(() => import('./pages/recalls/Recalls'))

const Training = lazy(() => import('./pages/training/Training'))
const Succession = lazy(() => import('./pages/training/Succession'))

const Audits = lazy(() => import('./pages/audits/Audits'))
const AuditReadiness = lazy(() => import('./pages/audits/Readiness'))
const RegulatorySubmissions = lazy(() => import('./pages/regulatory/Submissions'))
const RegulatoryIntelligence = lazy(() => import('./pages/regulatory/Intelligence'))
const CertificatesLicenses = lazy(() => import('./pages/regulatory/Certificates'))

const Suppliers = lazy(() => import('./pages/suppliers/Suppliers'))
const SupplyChainIntelligence = lazy(() => import('./pages/suppliers/Intelligence'))

const Risk = lazy(() => import('./pages/risk/Risk'))
const DesignControls = lazy(() => import('./pages/risk/DesignControls'))
const FMEA = lazy(() => import('./pages/risk/FMEA'))
const APQPPAP = lazy(() => import('./pages/risk/APQP'))
const PerformanceEval = lazy(() => import('./pages/risk/PerformanceEval'))

const Equipment = lazy(() => import('./pages/equipment/Equipment'))
const EnvironmentalMonitoring = lazy(() => import('./pages/equipment/Environmental'))

const Production = lazy(() => import('./pages/production/Production'))
const Inspection = lazy(() => import('./pages/production/Inspection'))
const Stability = lazy(() => import('./pages/production/Stability'))
const Returns = lazy(() => import('./pages/production/Returns'))
const ValidationExecution = lazy(() => import('./pages/production/Validation'))
const UDI = lazy(() => import('./pages/production/UDI'))

const Analytics = lazy(() => import('./pages/analytics/Analytics'))
const ManagementReview = lazy(() => import('./pages/analytics/Review'))
const PredictiveAnalytics = lazy(() => import('./pages/analytics/Predictive'))
const AIAssistant = lazy(() => import('./pages/analytics/Assistant'))

const Admin = lazy(() => import('./pages/admin/Admin'))
const Workflows = lazy(() => import('./pages/admin/Workflows'))
const NoCodeConfig = lazy(() => import('./pages/admin/Config'))
const MobileWearable = lazy(() => import('./pages/admin/Mobile'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const Feedback = lazy(() => import('./pages/admin/Feedback'))

const Widgets = lazy(() => import('./pages/dashboard/Widgets'))

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
        <Route path="dashboard/widgets" element={
          <Suspense fallback={<PageLoader />}>
            <Widgets />
          </Suspense>
        } />

        {/* Document Control & Labeling */}
        <Route path="documents" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_documents"><Documents /></RBACRoute>
          </Suspense>
        } />
        <Route path="documents/labeling" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_documents"><Labeling /></RBACRoute>
          </Suspense>
        } />
        <Route path="documents/forms" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_documents"><Forms /></RBACRoute>
          </Suspense>
        } />
        <Route path="documents/dmr" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_documents"><DMR /></RBACRoute>
          </Suspense>
        } />
        <Route path="documents/validation" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_documents"><Validation /></RBACRoute>
          </Suspense>
        } />
        <Route path="documents/correspondence" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_documents"><Correspondence /></RBACRoute>
          </Suspense>
        } />

        {/* Quality Events */}
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
        <Route path="complaints/pms" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_complaints"><PMS /></RBACRoute>
          </Suspense>
        } />
        <Route path="safety" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_capa"><SafetyEHS /></RBACRoute>
          </Suspense>
        } />
        <Route path="recalls" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_capa"><Recalls /></RBACRoute>
          </Suspense>
        } />

        {/* Training & Competence */}
        <Route path="training" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_training"><Training /></RBACRoute>
          </Suspense>
        } />
        <Route path="training/succession" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_training"><Succession /></RBACRoute>
          </Suspense>
        } />

        {/* Audit & Regulatory */}
        <Route path="audits" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_audits"><Audits /></RBACRoute>
          </Suspense>
        } />
        <Route path="audits/readiness" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_audits"><AuditReadiness /></RBACRoute>
          </Suspense>
        } />
        <Route path="regulatory/submissions" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_audits"><RegulatorySubmissions /></RBACRoute>
          </Suspense>
        } />
        <Route path="regulatory/intelligence" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_audits"><RegulatoryIntelligence /></RBACRoute>
          </Suspense>
        } />
        <Route path="regulatory/certificates" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_audits"><CertificatesLicenses /></RBACRoute>
          </Suspense>
        } />

        {/* Supplier Management */}
        <Route path="suppliers" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_suppliers"><Suppliers /></RBACRoute>
          </Suspense>
        } />
        <Route path="suppliers/intelligence" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_suppliers"><SupplyChainIntelligence /></RBACRoute>
          </Suspense>
        } />

        {/* Risk & Design */}
        <Route path="risk" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_risk"><Risk /></RBACRoute>
          </Suspense>
        } />
        <Route path="risk/design" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_risk"><DesignControls /></RBACRoute>
          </Suspense>
        } />
        <Route path="risk/fmea" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_risk"><FMEA /></RBACRoute>
          </Suspense>
        } />
        <Route path="risk/apqp" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_risk"><APQPPAP /></RBACRoute>
          </Suspense>
        } />
        <Route path="risk/performance-eval" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_risk"><PerformanceEval /></RBACRoute>
          </Suspense>
        } />

        {/* Equipment & Facilities */}
        <Route path="equipment" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_equipment"><Equipment /></RBACRoute>
          </Suspense>
        } />
        <Route path="equipment/environmental" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_equipment"><EnvironmentalMonitoring /></RBACRoute>
          </Suspense>
        } />

        {/* Production & QA */}
        <Route path="production" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_production"><Production /></RBACRoute>
          </Suspense>
        } />
        <Route path="production/inspection" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_production"><Inspection /></RBACRoute>
          </Suspense>
        } />
        <Route path="production/stability" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_production"><Stability /></RBACRoute>
          </Suspense>
        } />
        <Route path="production/returns" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_production"><Returns /></RBACRoute>
          </Suspense>
        } />
        <Route path="production/validation" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_production"><ValidationExecution /></RBACRoute>
          </Suspense>
        } />
        <Route path="production/udi" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_production"><UDI /></RBACRoute>
          </Suspense>
        } />

        {/* Analytics & Review — Visible to all authenticated users */}
        <Route path="analytics" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission={null}>
              <Analytics />
            </RBACRoute>
          </Suspense>
        } />
        <Route path="analytics/review" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission={null}>
              <ManagementReview />
            </RBACRoute>
          </Suspense>
        } />
        <Route path="analytics/predictive" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission={null}>
              <PredictiveAnalytics />
            </RBACRoute>
          </Suspense>
        } />
        <Route path="analytics/assistant" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission={null}>
              <AIAssistant />
            </RBACRoute>
          </Suspense>
        } />

        {/* Administration */}
        <Route path="admin" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_view_admin"><Admin /></RBACRoute>
          </Suspense>
        } />
        <Route path="admin/workflows" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_manage_system"><Workflows /></RBACRoute>
          </Suspense>
        } />
        <Route path="admin/config" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_manage_system"><NoCodeConfig /></RBACRoute>
          </Suspense>
        } />
        <Route path="admin/mobile" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_manage_system"><MobileWearable /></RBACRoute>
          </Suspense>
        } />
        <Route path="admin/settings" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_manage_system"><AdminSettings /></RBACRoute>
          </Suspense>
        } />
        <Route path="admin/feedback" element={
          <Suspense fallback={<PageLoader />}>
            <RBACRoute permission="can_manage_system"><Feedback /></RBACRoute>
          </Suspense>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
