import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, FileText, BarChart3, QrCode, X, Plus, Filter, Search } from 'lucide-react'
import { periodicReviewsAPI, controlledCopiesAPI, documentsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function DocumentManagement() {
  const [activeTab, setActiveTab] = useState('periodic-reviews')
  const [periodicReviews, setPeriodicReviews] = useState([])
  const [controlledCopies, setControlledCopies] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedCopy, setSelectedCopy] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [labelFormat, setLabelFormat] = useState('standard')
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [completeFormData, setCompleteFormData] = useState({ findings: '', comments: '' })
  const [issueFormData, setIssueFormData] = useState({ issued_to_user: '', location: '' })

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [reviewsRes, copiesRes, docsRes] = await Promise.all([
        periodicReviewsAPI.getAll({ limit: 100 }),
        controlledCopiesAPI.getAll({ limit: 100 }),
        documentsAPI.getAll({ limit: 100 }),
      ])
      setPeriodicReviews(reviewsRes.data?.results || [])
      setControlledCopies(copiesRes.data?.results || [])
      setDocuments(docsRes.data?.results || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteReview = async (review) => {
    try {
      await periodicReviewsAPI.completeReview(review.id, completeFormData)
      await fetchData()
      setShowCompleteModal(false)
      setCompleteFormData({ findings: '', comments: '' })
    } catch (err) {
      console.error('Error completing review:', err)
      setError('Failed to complete review')
    }
  }

  const handleScheduleNext = async (review) => {
    try {
      await periodicReviewsAPI.scheduleNext(review.id)
      await fetchData()
    } catch (err) {
      console.error('Error scheduling next review:', err)
      setError('Failed to schedule next review')
    }
  }

  const handleIssueCopy = async (copy) => {
    try {
      await controlledCopiesAPI.issue(copy.id, issueFormData)
      await fetchData()
      setShowIssueModal(false)
      setIssueFormData({ issued_to_user: '', location: '' })
    } catch (err) {
      console.error('Error issuing copy:', err)
      setError('Failed to issue copy')
    }
  }

  const handleConfirmReceipt = async (copy) => {
    try {
      await controlledCopiesAPI.confirmReceipt(copy.id, {})
      await fetchData()
    } catch (err) {
      console.error('Error confirming receipt:', err)
      setError('Failed to confirm receipt')
    }
  }

  const handleSupersede = async (copy) => {
    try {
      await controlledCopiesAPI.supersede(copy.id)
      await fetchData()
    } catch (err) {
      console.error('Error superseding copy:', err)
      setError('Failed to supersede copy')
    }
  }

  const handleRecall = async (copy) => {
    try {
      await controlledCopiesAPI.recall(copy.id, {})
      await fetchData()
    } catch (err) {
      console.error('Error recalling copy:', err)
      setError('Failed to recall copy')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-300 border-green-500/30',
      overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
      issued: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      received: 'bg-green-500/20 text-green-300 border-green-500/30',
      superseded: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      returned: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    }
    return colors[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const filteredReviews = periodicReviews.filter((r) => {
    const matchesSearch = !searchTerm || r.document?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredCopies = controlledCopies.filter((c) => {
    const matchesSearch = !searchTerm || c.document?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const generateLabel = (doc, format = 'standard') => {
    if (!doc) return null

    const baseInfo = {
      company: 'Arni Medica',
      docNumber: doc.document_id,
      title: doc.title,
      version: `${doc.major_version || 0}.${doc.minor_version || 0}`,
      effectiveDate: doc.effective_date ? new Date(doc.effective_date).toLocaleDateString() : 'N/A',
      department: doc.department_name || 'N/A',
      classification: doc.confidentiality_level || 'Standard',
    }

    return (
      <div className="bg-white text-black p-8 border-2 border-gray-800 rounded shadow-lg max-w-md">
        <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Arni Medica</p>
          <p className="text-sm text-gray-500">Document Label</p>
        </div>

        {format !== 'compact' && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1">Document Number</p>
            <p className="text-lg font-bold border-b border-gray-300 pb-2">{baseInfo.docNumber}</p>
          </div>
        )}

        {format === 'compact' ? (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-600">Version {baseInfo.version}</p>
            <p className="text-xs text-gray-600 mt-1">Effective: {baseInfo.effectiveDate}</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">Title</p>
              <p className="text-sm font-semibold">{baseInfo.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div>
                <p className="text-gray-600 mb-1">Version</p>
                <p className="font-semibold">{baseInfo.version}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Effective Date</p>
                <p className="font-semibold">{baseInfo.effectiveDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div>
                <p className="text-gray-600 mb-1">Department</p>
                <p className="font-semibold">{baseInfo.department}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Classification</p>
                <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                  {baseInfo.classification}
                </span>
              </div>
            </div>
          </>
        )}

        {format === 'regulatory' && (
          <div className="border-t-2 border-gray-800 pt-4 mb-4">
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div>
                <p className="text-gray-600 mb-1">Regulatory Req.</p>
                <p className="font-semibold">{doc.regulatory_requirement ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Control Number</p>
                <p className="font-semibold">{baseInfo.docNumber}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t-2 border-gray-800 pt-4 text-center">
          <div className="w-24 h-24 mx-auto bg-gray-200 flex items-center justify-center rounded mb-2 border border-gray-400">
            <div className="text-center">
              <QrCode size={32} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">QR Code</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Scan for document access</p>
        </div>
      </div>
    )
  }

  if (loading && periodicReviews.length === 0) {
    return <LoadingSpinner message="Loading document management..." />
  }

  return (
    <div className="p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Management</h1>
        <p className="text-slate-400">Periodic reviews, controlled copies, and labeling management</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-eqms-border">
        {[
          { id: 'periodic-reviews', label: 'Periodic Reviews', icon: Clock },
          { id: 'controlled-copies', label: 'Controlled Copies', icon: FileText },
          { id: 'document-labels', label: 'Document Labels', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Periodic Reviews Tab */}
      {activeTab === 'periodic-reviews' && (
        <div className="card p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by document..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-eqms-border">
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Document</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Review Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Reviewer</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Days Until Due</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 px-4 text-center text-slate-500">
                      No periodic reviews found
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => {
                    const daysUntilDue = getDaysUntilDue(review.due_date)
                    const isOverdue = daysUntilDue < 0 && review.status !== 'completed'
                    return (
                      <tr
                        key={review.id}
                        className={`border-b border-eqms-border hover:bg-eqms-input transition-colors ${
                          isOverdue ? 'bg-red-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-medium">{review.document?.title || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(review.scheduled_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-slate-400">{review.reviewer_name || 'Unassigned'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(review.status)}`}>
                            {review.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-semibold ${isOverdue ? 'text-red-400' : daysUntilDue < 7 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {daysUntilDue} days
                        </td>
                        <td className="py-3 px-4 text-right">
                          {review.status !== 'completed' && (
                            <button
                              onClick={() => {
                                setSelectedReview(review)
                                setShowCompleteModal(true)
                              }}
                              className="btn-sm bg-blue-600 hover:bg-blue-700 text-white mr-2"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleScheduleNext(review)}
                            className="btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300"
                          >
                            Schedule Next
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Controlled Copies Tab */}
      {activeTab === 'controlled-copies' && (
        <div className="card p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by document..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="received">Received</option>
              <option value="superseded">Superseded</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-eqms-border">
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Document</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Copy #</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Issued To</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Issued Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Location</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCopies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 px-4 text-center text-slate-500">
                      No controlled copies found
                    </td>
                  </tr>
                ) : (
                  filteredCopies.map((copy) => (
                    <tr key={copy.id} className="border-b border-eqms-border hover:bg-eqms-input transition-colors">
                      <td className="py-3 px-4 font-medium">{copy.document?.title || 'N/A'}</td>
                      <td className="py-3 px-4 font-semibold">{copy.copy_number}</td>
                      <td className="py-3 px-4 text-slate-400">{copy.issued_to_name || 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(copy.status)}`}>
                          {copy.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{new Date(copy.issued_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-400">{copy.location || 'Not specified'}</td>
                      <td className="py-3 px-4 text-right">
                        {copy.status === 'issued' && (
                          <button
                            onClick={() => handleConfirmReceipt(copy)}
                            className="btn-sm bg-green-600 hover:bg-green-700 text-white text-xs mr-2"
                          >
                            Confirm
                          </button>
                        )}
                        {copy.status === 'issued' && (
                          <button
                            onClick={() => handleSupersede(copy)}
                            className="btn-sm bg-yellow-600 hover:bg-yellow-700 text-white text-xs mr-2"
                          >
                            Supersede
                          </button>
                        )}
                        {copy.status !== 'returned' && (
                          <button
                            onClick={() => handleRecall(copy)}
                            className="btn-sm bg-red-600 hover:bg-red-700 text-white text-xs"
                          >
                            Recall
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Labels Tab */}
      {activeTab === 'document-labels' && (
        <div className="card p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Document Selection */}
            <div className="col-span-1">
              <h3 className="font-semibold text-slate-300 mb-4">Select Document</h3>
              <div className="bg-eqms-input rounded-lg p-4 h-96 overflow-y-auto border border-eqms-border">
                {documents.length === 0 ? (
                  <p className="text-slate-500 text-sm">No documents available</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                          selectedDocument?.id === doc.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-eqms-card hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <p className="font-semibold truncate">{doc.document_id}</p>
                        <p className="text-xs truncate opacity-75">{doc.title}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Label Preview & Options */}
            <div className="col-span-2">
              {selectedDocument ? (
                <>
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-300 mb-4">Label Format</h3>
                    <div className="flex gap-3">
                      {[
                        { id: 'standard', label: 'Standard' },
                        { id: 'compact', label: 'Compact' },
                        { id: 'regulatory', label: 'Regulatory' },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          onClick={() => setLabelFormat(fmt.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            labelFormat === fmt.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-eqms-card hover:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-300 mb-4">Label Preview</h3>
                  <div className="bg-eqms-card p-6 rounded-lg border border-eqms-border flex justify-center mb-6 min-h-96">
                    {generateLabel(selectedDocument, labelFormat)}
                  </div>

                  <button
                    onClick={() => {
                      const printWindow = window.open('', '', 'height=400,width=600')
                      printWindow.document.write(generateLabel(selectedDocument, labelFormat).outerHTML)
                      printWindow.document.close()
                      printWindow.print()
                    }}
                    className="btn-primary w-full"
                  >
                    Print Label
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-96 bg-eqms-card rounded-lg border border-eqms-border">
                  <p className="text-slate-500">Select a document to preview its label</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complete Review Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-eqms-dark border border-eqms-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Complete Review</h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Findings</label>
                <textarea
                  value={completeFormData.findings}
                  onChange={(e) => setCompleteFormData({ ...completeFormData, findings: e.target.value })}
                  className="input-field w-full h-24 resize-none"
                  placeholder="Enter review findings..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Comments</label>
                <textarea
                  value={completeFormData.comments}
                  onChange={(e) => setCompleteFormData({ ...completeFormData, comments: e.target.value })}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Additional comments..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCompleteModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => handleCompleteReview(selectedReview)}
                  className="btn-primary flex-1"
                >
                  Complete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
