import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader,
  AlertCircle,
  FileText,
  Clock,
  User,
  Calendar,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Download,
  Lock,
  Unlock,
} from 'lucide-react'
import documentsAPI from '../../api/documents'
import ESignatureDialog from '../../components/common/ESignatureDialog'
import RichTextEditor from '../../components/common/RichTextEditor'

const STATUS_COLORS = {
  DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  IN_REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  REVIEWED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  APPROVED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  EFFECTIVE: 'bg-green-500/10 text-green-400 border-green-500/30',
  OBSOLETE: 'bg-red-500/10 text-red-400 border-red-500/30',
  SUPERSEDED: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  ARCHIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const CLASSIFICATION_COLORS = {
  PUBLIC: 'text-blue-400 bg-blue-500/10',
  INTERNAL: 'text-slate-400 bg-slate-500/10',
  CONFIDENTIAL: 'text-yellow-400 bg-yellow-500/10',
  RESTRICTED: 'text-red-400 bg-red-500/10',
}

export default function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [auditTrail, setAuditTrail] = useState([])
  const [updating, setUpdating] = useState(false)
  const [contentEditing, setContentEditing] = useState(false)
  const [contentValue, setContentValue] = useState('')
  const [contentChanged, setContentChanged] = useState(false)

  // E-signature modal
  const [showSignature, setShowSignature] = useState(false)
  const [signatureAction, setSignatureAction] = useState(null)
  const [signatureLoading, setSignatureLoading] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [id])

  const fetchDocument = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await documentsAPI.get(id)
      const doc = response.data || response
      setDocument(doc)
      setContentValue(doc.content || '')

      // Fetch audit trail if available
      try {
        const auditResponse = await documentsAPI.auditTrail(id)
        setAuditTrail(auditResponse.data || [])
      } catch (e) {
        console.log('Audit trail not available')
      }
    } catch (err) {
      console.error('Failed to fetch document:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  const handleStateTransition = async (action) => {
    setSignatureAction(action)
    setShowSignature(true)
  }

  const handleSignature = async (signatureData) => {
    try {
      setSignatureLoading(true)

      const actionMap = {
        submitForReview: 'submitForReview',
        approve: 'approve',
        reject: 'reject',
        makeEffective: 'makeEffective',
        obsolete: 'makeObsolete',
        archive: 'archive',
        checkout: 'checkout',
        checkin: 'checkin',
      }

      const apiAction = actionMap[signatureAction]
      if (!apiAction) throw new Error('Unknown action')

      const payload = {
        password: signatureData.password,
        signing_meaning: signatureData.signing_meaning,
        comment: signatureData.comment || '',
      }

      if (signatureAction === 'reject') {
        payload.rejection_reason = signatureData.comment
      }

      await documentsAPI[apiAction](id, payload)
      setShowSignature(false)
      setSignatureAction(null)
      await fetchDocument()
      alert(`Document ${signatureAction} successful!`)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message
      alert(`Failed to ${signatureAction}: ${errorMsg}`)
    } finally {
      setSignatureLoading(false)
    }
  }

  const handleSaveContent = async () => {
    try {
      setUpdating(true)
      await documentsAPI.updateContent(id, { content: contentValue })
      setContentChanged(false)
      setContentEditing(false)
      await fetchDocument()
      alert('Content saved successfully!')
    } catch (err) {
      alert('Failed to save content: ' + (err.response?.data?.detail || err.message))
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteDocument = async () => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }
    try {
      setUpdating(true)
      await documentsAPI.delete(id)
      alert('Document deleted successfully')
      navigate('/documents')
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.detail || err.message))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-blue-400 animate-spin mr-3" />
        <p className="text-slate-400">Loading document...</p>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="p-8">
        <Link to="/documents" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft size={18} />
          Back to Documents
        </Link>
        <div className="card p-8 bg-red-500/10 border border-red-500/30">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Error Loading Document</h3>
              <p className="text-red-300/80">{error || 'Document not found'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const canEdit = document.status === 'DRAFT'
  const canCheckout = document.status === 'EFFECTIVE'
  const canSubmit = document.status === 'DRAFT'
  const canApprove = document.status === 'IN_REVIEW'
  const canReject = document.status === 'IN_REVIEW'
  const canMakeEffective = document.status === 'APPROVED'
  const canObsolete = document.status === 'EFFECTIVE'
  const canArchive = ['OBSOLETE', 'SUPERSEDED', 'REJECTED'].includes(document.status)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/documents" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
          <ArrowLeft size={18} />
          Back to Documents
        </Link>

        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{document.title}</h1>
              <span
                className={`px-4 py-2 rounded-lg font-semibold border text-lg ${
                  STATUS_COLORS[document.status] || STATUS_COLORS.DRAFT
                }`}
              >
                {document.status}
              </span>
            </div>
            <p className="text-slate-400 font-mono">{document.document_number}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {canSubmit && (
          <button
            onClick={() => handleStateTransition('submitForReview')}
            disabled={updating}
            className="btn-primary flex items-center gap-2"
          >
            <AlertTriangle size={16} />
            Submit for Review
          </button>
        )}
        {canApprove && (
          <button
            onClick={() => handleStateTransition('approve')}
            disabled={updating}
            className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 size={16} />
            Approve
          </button>
        )}
        {canReject && (
          <button
            onClick={() => handleStateTransition('reject')}
            disabled={updating}
            className="btn-secondary flex items-center gap-2 text-red-400 hover:text-red-300"
          >
            <AlertCircle size={16} />
            Reject
          </button>
        )}
        {canMakeEffective && (
          <button
            onClick={() => handleStateTransition('makeEffective')}
            disabled={updating}
            className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 size={16} />
            Make Effective
          </button>
        )}
        {canCheckout && (
          <button
            onClick={() => handleStateTransition('checkout')}
            disabled={updating}
            className="btn-secondary flex items-center gap-2"
          >
            <Unlock size={16} />
            Checkout (Create Revision)
          </button>
        )}
        {canObsolete && (
          <button
            onClick={() => handleStateTransition('obsolete')}
            disabled={updating}
            className="btn-secondary flex items-center gap-2 text-orange-400 hover:text-orange-300"
          >
            <AlertTriangle size={16} />
            Make Obsolete
          </button>
        )}
        {canArchive && (
          <button
            onClick={() => handleStateTransition('archive')}
            disabled={updating}
            className="btn-secondary flex items-center gap-2"
          >
            <FileText size={16} />
            Archive
          </button>
        )}
        <button
          onClick={handleDeleteDocument}
          disabled={updating || document.status !== 'DRAFT'}
          className="btn-secondary flex items-center gap-2 text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-eqms-border">
        <div className="flex gap-8">
          {['overview', 'editor', 'history', 'related'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-medium transition-colors border-b-2 ${
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

      {/* Tab Content */}
      <div className="card p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Document Number</label>
                <p className="font-mono text-blue-400">{document.document_number}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Document Type</label>
                <p className="text-slate-300">{document.document_type}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Category</label>
                <p className="text-slate-300">{document.category || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Department</label>
                <p className="text-slate-300">{document.department || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Classification</label>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${CLASSIFICATION_COLORS[document.classification] || CLASSIFICATION_COLORS.INTERNAL}`}>
                  {document.classification || 'INTERNAL'}
                </span>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Status</label>
                <p className="text-slate-300">{document.status}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Version</label>
                <p className="text-slate-300">{document.version || 1}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Revision</label>
                <p className="text-slate-300">{document.revision_number || 0}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Author</label>
                <p className="text-slate-300 flex items-center gap-2">
                  <User size={16} />
                  {document.author_name || document.author || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Created Date</label>
                <p className="text-slate-300 flex items-center gap-2">
                  <Calendar size={16} />
                  {document.created_at ? new Date(document.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Effective Date</label>
                <p className="text-slate-300 flex items-center gap-2">
                  <Calendar size={16} />
                  {document.effective_date ? new Date(document.effective_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Last Updated</label>
                <p className="text-slate-300 flex items-center gap-2">
                  <Clock size={16} />
                  {document.updated_at ? new Date(document.updated_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            {/* Reviewers & Approvers */}
            {(document.reviewers?.length > 0 || document.approvers?.length > 0) && (
              <div className="pt-6 border-t border-eqms-border">
                <div className="grid grid-cols-2 gap-6">
                  {document.reviewers?.length > 0 && (
                    <div>
                      <label className="text-sm text-slate-400 block mb-3 font-semibold">Reviewers</label>
                      <div className="space-y-2">
                        {document.reviewers.map((reviewer, idx) => (
                          <p key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                            <User size={14} />
                            {reviewer.name || reviewer}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {document.approvers?.length > 0 && (
                    <div>
                      <label className="text-sm text-slate-400 block mb-3 font-semibold">Approvers</label>
                      <div className="space-y-2">
                        {document.approvers.map((approver, idx) => (
                          <p key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                            <User size={14} />
                            {approver.name || approver}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Tab */}
        {activeTab === 'editor' && (
          <div className="space-y-4">
            {!contentEditing ? (
              <>
                {canEdit && (
                  <button
                    onClick={() => setContentEditing(true)}
                    className="btn-primary mb-4"
                  >
                    Edit Content
                  </button>
                )}
                <div className="prose prose-invert max-w-none">
                  {contentValue ? (
                    <div dangerouslySetInnerHTML={{ __html: contentValue }} className="text-slate-300" />
                  ) : (
                    <p className="text-slate-400 italic">No content yet</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <RichTextEditor
                  value={contentValue}
                  onChange={(val) => {
                    setContentValue(val)
                    setContentChanged(true)
                  }}
                  placeholder="Document content..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveContent}
                    disabled={!contentChanged || updating}
                    className="btn-primary"
                  >
                    {updating ? 'Saving...' : 'Save Content'}
                  </button>
                  <button
                    onClick={() => {
                      setContentEditing(false)
                      setContentValue(document.content || '')
                      setContentChanged(false)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {auditTrail.length > 0 ? (
              <div className="space-y-3">
                {auditTrail.map((entry, idx) => (
                  <div key={idx} className="border-l-2 border-blue-400 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-300">{entry.action || entry.action_type}</p>
                      <span className="text-xs text-slate-500">
                        {new Date(entry.timestamp || entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      By: {entry.user_name || entry.performed_by || entry.user || '-'}
                    </p>
                    {entry.details && (
                      <p className="text-sm text-slate-400 mt-1">{entry.details}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">No audit trail available</p>
            )}
          </div>
        )}

        {/* Related Tab */}
        {activeTab === 'related' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-eqms-border rounded-lg p-4 text-center text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Related CAPAs</p>
                <p className="text-xs mt-1">No related records</p>
              </div>
              <div className="border border-eqms-border rounded-lg p-4 text-center text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Related Deviations</p>
                <p className="text-xs mt-1">No related records</p>
              </div>
              <div className="border border-eqms-border rounded-lg p-4 text-center text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Change Controls</p>
                <p className="text-xs mt-1">No related records</p>
              </div>
              <div className="border border-eqms-border rounded-lg p-4 text-center text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Training Records</p>
                <p className="text-xs mt-1">No related records</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* E-Signature Modal */}
      <ESignatureDialog
        isOpen={showSignature}
        onClose={() => {
          setShowSignature(false)
          setSignatureAction(null)
        }}
        onSign={handleSignature}
        action={signatureAction}
        loading={signatureLoading}
        title={`${signatureAction?.charAt(0).toUpperCase() + signatureAction?.slice(1).replace(/([A-Z])/g, ' $1')} Document`}
      />
    </div>
  )
}
