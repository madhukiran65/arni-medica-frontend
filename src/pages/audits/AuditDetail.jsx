import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, ChevronDown, ChevronRight, CheckCircle, AlertCircle,
  FileText, Settings, TrendingUp, Lock, Zap, User, Calendar, MapPin,
  Download, Share2, MessageSquare, Clock, Flag,
} from 'lucide-react'
import { auditsAPI } from '../../api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'


export default function AuditDetail() {
  const { auditId } = useParams()
  const navigate = useNavigate()
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedChecklists, setExpandedChecklists] = useState({})
  const [expandedFindings, setExpandedFindings] = useState({})

  useEffect(() => { fetchAudit() }, [auditId])

  const fetchAudit = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await auditsAPI.get(auditId)
      setAudit(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load audit details')
      console.error('Failed to load audit:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-8 text-red-400">{error}</div>
  if (!audit) return <div className="p-8 text-slate-400">Audit not found</div>

  return (
    <div className="min-h-screen bg-eqms-dark">
      {/* Header */}
      <div className="bg-slate-900 border-b border-eqms-border p-6">
        <button
          onClick={() => navigate('/audits')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
        >
          <ArrowLeft size={18} /> Back to Audits
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{audit.title}</h1>
            <p className="text-slate-400">{audit.audit_id}</p>
          </div>
          <StatusBadge status={audit.current_stage} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-eqms-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {['overview', 'checklists', 'findings', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && <OverviewTab audit={audit} />}
        {activeTab === 'checklists' && <ChecklistsTab audit={audit} expandedChecklists={expandedChecklists} setExpandedChecklists={setExpandedChecklists} />}
        {activeTab === 'findings' && <FindingsTab audit={audit} expandedFindings={expandedFindings} setExpandedFindings={setExpandedFindings} />}
        {activeTab === 'reports' && <ReportsTab audit={audit} />}
      </div>
    </div>
  )
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ audit }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-slate-400 text-sm mb-2">Checklist Items</div>
          <div className="text-2xl font-bold">{audit.checklists?.reduce((sum, c) => sum + (c.items?.length || 0), 0) || 0}</div>
          <div className="text-xs text-slate-500 mt-1">
            {audit.checklists?.reduce((sum, c) => sum + (c.items?.filter(i => i.status !== 'not_assessed').length || 0), 0) || 0} completed
          </div>
        </div>
        <div className="card p-4">
          <div className="text-slate-400 text-sm mb-2">Findings</div>
          <div className="text-2xl font-bold text-red-400">{audit.findings?.length || 0}</div>
          <div className="text-xs text-slate-500 mt-1">
            {audit.major_nc_count || 0} major, {audit.minor_nc_count || 0} minor
          </div>
        </div>
        <div className="card p-4">
          <div className="text-slate-400 text-sm mb-2">Stage</div>
          <div className="text-2xl font-bold">{audit.current_stage_display || audit.current_stage}</div>
          <div className="text-xs text-slate-500 mt-1">
            Entered {new Date(audit.stage_entered_at).toLocaleDateString()}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-slate-400 text-sm mb-2">Duration</div>
          <div className="text-2xl font-bold">
            {audit.planned_end_date ? Math.ceil((new Date(audit.planned_end_date) - new Date(audit.planned_start_date)) / (1000 * 60 * 60 * 24)) : '—'} days
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {new Date(audit.planned_start_date).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Audit Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Audit Information</h3>
          <div className="space-y-3">
            <DetailRow label="Audit Type" value={audit.audit_type_display} />
            <DetailRow label="Priority" value={audit.priority_display} />
            <DetailRow label="Lead Auditor" value={audit.lead_auditor_name} icon={<User size={16} />} />
            <DetailRow label="Department" value={audit.department_name} icon={<MapPin size={16} />} />
            {audit.auditee_department_name && (
              <DetailRow label="Auditee Department" value={audit.auditee_department_name} />
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Schedule</h3>
          <div className="space-y-3">
            <DetailRow label="Planned Start" value={new Date(audit.planned_start_date).toLocaleDateString()} icon={<Calendar size={16} />} />
            <DetailRow label="Planned End" value={new Date(audit.planned_end_date).toLocaleDateString()} />
            {audit.actual_start_date && (
              <DetailRow label="Actual Start" value={new Date(audit.actual_start_date).toLocaleDateString()} icon={<CheckCircle size={16} className="text-green-400" />} />
            )}
            {audit.actual_end_date && (
              <DetailRow label="Actual End" value={new Date(audit.actual_end_date).toLocaleDateString()} />
            )}
          </div>
        </div>
      </div>

      {/* Scope & Criteria */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Scope & Criteria</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Scope</label>
            <p className="text-slate-300 whitespace-pre-wrap">{audit.scope}</p>
          </div>
          {audit.criteria && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Criteria</label>
              <p className="text-slate-300 whitespace-pre-wrap">{audit.criteria}</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {audit.executive_summary && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Executive Summary</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{audit.executive_summary}</p>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value, icon }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-slate-400 text-sm flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-slate-200 font-medium">{value || '—'}</span>
    </div>
  )
}

// ============================================================================
// CHECKLISTS TAB
// ============================================================================

function ChecklistsTab({ audit, expandedChecklists, setExpandedChecklists }) {
  const [showCreateChecklist, setShowCreateChecklist] = useState(false)

  if (!audit.checklists || audit.checklists.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FileText size={48} className="mx-auto mb-4 text-slate-600" />
        <p className="text-slate-400 mb-4">No checklists created yet</p>
        <button
          onClick={() => setShowCreateChecklist(true)}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <Plus size={18} /> Create Checklist
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreateChecklist(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Checklist
        </button>
      </div>

      {audit.checklists.map((checklist) => (
        <ChecklistCard
          key={checklist.id}
          checklist={checklist}
          isExpanded={expandedChecklists[checklist.id]}
          onToggle={() =>
            setExpandedChecklists({
              ...expandedChecklists,
              [checklist.id]: !expandedChecklists[checklist.id],
            })
          }
        />
      ))}
    </div>
  )
}

function ChecklistCard({ checklist, isExpanded, onToggle }) {
  const items = checklist.items || []
  const completedItems = items.filter((i) => i.status !== 'not_assessed').length
  const completionPercent = items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0

  const statusColors = {
    conforming: 'bg-green-500/20 text-green-400 border-green-500/30',
    non_conforming: 'bg-red-500/20 text-red-400 border-red-500/30',
    observation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    not_applicable: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    not_assessed: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition"
      >
        <div className="flex items-center gap-3 flex-1">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <div className="text-left flex-1">
            <h3 className="font-semibold">{checklist.title}</h3>
            <p className="text-sm text-slate-400">{checklist.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-sm font-mono text-slate-400">{completionPercent}%</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-eqms-border p-4 bg-slate-900/50 space-y-2">
          {items.length === 0 ? (
            <p className="text-slate-400 text-sm">No items in this checklist</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`border rounded p-3 ${statusColors[item.status || 'not_assessed']}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.question}</p>
                    {item.clause_reference && (
                      <p className="text-xs mt-1 opacity-75">{item.clause_reference}</p>
                    )}
                    {item.evidence && (
                      <p className="text-xs mt-2 opacity-75">Evidence: {item.evidence}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">{item.status?.replace('_', ' ')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// FINDINGS TAB
// ============================================================================

function FindingsTab({ audit, expandedFindings, setExpandedFindings }) {
  const [showCreateFinding, setShowCreateFinding] = useState(false)

  const findings = audit.findings || []

  const severityColors = {
    major_nc: 'bg-red-500/20 text-red-400 border-red-500/30',
    minor_nc: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    observation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    opportunity: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  const stageColors = {
    open: 'bg-red-500/20 text-red-400',
    investigation: 'bg-orange-500/20 text-orange-400',
    capa_assigned: 'bg-purple-500/20 text-purple-400',
    remediation: 'bg-yellow-500/20 text-yellow-400',
    verification: 'bg-blue-500/20 text-blue-400',
    closed: 'bg-green-500/20 text-green-400',
  }

  if (findings.length === 0) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-slate-600" />
        <p className="text-slate-400 mb-4">No findings recorded</p>
        <button
          onClick={() => setShowCreateFinding(true)}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <Plus size={18} /> Create Finding
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreateFinding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Create Finding
        </button>
      </div>

      {findings.map((finding) => (
        <FindingCard
          key={finding.id}
          finding={finding}
          severityColors={severityColors}
          stageColors={stageColors}
          isExpanded={expandedFindings[finding.id]}
          onToggle={() =>
            setExpandedFindings({
              ...expandedFindings,
              [finding.id]: !expandedFindings[finding.id],
            })
          }
        />
      ))}
    </div>
  )
}

function FindingCard({ finding, severityColors, stageColors, isExpanded, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition"
      >
        <div className="flex items-center gap-3 flex-1">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <div className="text-left flex-1">
            <h3 className="font-semibold">{finding.finding_id}</h3>
            <p className="text-sm text-slate-400">{finding.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded border ${severityColors[finding.severity] || ''}`}>
            {finding.severity?.replace('_', ' ')}
          </span>
          <span className={`text-xs px-2 py-1 rounded border ${stageColors[finding.current_stage] || ''}`}>
            {finding.current_stage?.replace('_', ' ')}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-eqms-border p-4 bg-slate-900/50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Title</label>
              <p className="text-slate-200">{finding.title || finding.description}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Type</label>
              <p className="text-slate-200">{finding.severity?.replace('_', ' ')}</p>
            </div>
            {finding.clause_reference && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Clause</label>
                <p className="text-slate-200">{finding.clause_reference}</p>
              </div>
            )}
            {finding.target_closure_date && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">Due Date</label>
                <p className="text-slate-200">{new Date(finding.target_closure_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {finding.evidence && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Evidence</label>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{finding.evidence}</p>
            </div>
          )}

          {finding.root_cause && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Root Cause</label>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{finding.root_cause}</p>
            </div>
          )}

          {finding.corrective_action && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Corrective Action</label>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{finding.corrective_action}</p>
            </div>
          )}

          {finding.assigned_capa && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded p-3">
              <p className="text-xs text-slate-400 mb-1">Linked CAPA</p>
              <p className="text-blue-400 font-mono text-sm">{finding.assigned_capa}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// REPORTS TAB
// ============================================================================

function ReportsTab({ audit }) {
  return (
    <div className="card p-8 text-center">
      <TrendingUp size={48} className="mx-auto mb-4 text-slate-600" />
      <h3 className="text-xl font-semibold mb-2">Audit Report Generation</h3>
      <p className="text-slate-400 mb-6">Report generation coming soon. Reports can be generated once the audit is closed.</p>
      <div className="space-y-2 text-sm text-slate-400">
        <p>Available reports will include:</p>
        <ul className="list-disc list-inside inline-block">
          <li>Audit findings summary</li>
          <li>Non-conformances by severity</li>
          <li>Corrective action tracking</li>
          <li>Audit conclusion & recommendations</li>
        </ul>
      </div>
    </div>
  )
}
