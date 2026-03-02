import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Loader, Send, Check } from 'lucide-react'
import { correspondenceAPI } from '../../services/api'

const TYPE_BADGES = {
  REGULATORY: { label: 'Regulatory', bg: 'bg-red-900', text: 'text-red-200' },
  NOTIFIED_BODY: { label: 'Notified Body', bg: 'bg-orange-900', text: 'text-orange-200' },
  SUPPLIER: { label: 'Supplier', bg: 'bg-blue-900', text: 'text-blue-200' },
  CUSTOMER: { label: 'Complaint Response', bg: 'bg-purple-900', text: 'text-purple-200' },
  INTERNAL: { label: 'Internal Memo', bg: 'bg-slate-700', text: 'text-slate-200' },
  FDA: { label: 'FDA', bg: 'bg-red-800', text: 'text-red-100' },
  CE_MARK: { label: 'CE Mark', bg: 'bg-teal-900', text: 'text-teal-200' },
  OTHER: { label: 'Other', bg: 'bg-slate-800', text: 'text-slate-300' },
}

const STATUS_BADGES = {
  draft: { label: 'Draft', bg: 'bg-slate-700', text: 'text-slate-200' },
  sent: { label: 'Sent', bg: 'bg-blue-700', text: 'text-blue-200' },
  received: { label: 'Received', bg: 'bg-slate-600', text: 'text-slate-200' },
  acknowledged: { label: 'Acknowledged', bg: 'bg-green-700', text: 'text-green-200' },
  action_required: { label: 'Action Required', bg: 'bg-orange-700', text: 'text-orange-200' },
  closed: { label: 'Closed', bg: 'bg-slate-800', text: 'text-slate-300' },
}

const PRIORITY_BADGES = {
  LOW: { label: 'Low', bg: 'bg-slate-700', text: 'text-slate-200' },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-700', text: 'text-blue-200' },
  HIGH: { label: 'High', bg: 'bg-orange-700', text: 'text-orange-200' },
  URGENT: { label: 'Urgent', bg: 'bg-red-700', text: 'text-red-200' },
}

export default function Correspondence() {
  const [correspondences, setCorrespondences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Filter states
  const [typeFilter, setTypeFilter] = useState('all')
  const [directionFilter, setDirectionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    correspondence_type: 'REGULATORY',
    direction: 'OUTBOUND',
    status: 'draft',
    from_party: '',
    to_party: '',
    contact_person: '',
    contact_email: '',
    body: '',
    priority: 'MEDIUM',
    requires_response: false,
    response_due_date: '',
    reference_number: '',
  })

  useEffect(() => {
    fetchCorrespondence()
  }, [typeFilter, directionFilter, statusFilter, priorityFilter])

  const fetchCorrespondence = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}
      if (typeFilter !== 'all') params.correspondence_type = typeFilter
      if (directionFilter !== 'all') params.direction = directionFilter
      if (statusFilter !== 'all') params.status = statusFilter
      if (priorityFilter !== 'all') params.priority = priorityFilter

      const response = await correspondenceAPI.list(params)
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setCorrespondences(data)
    } catch (err) {
      console.error('Error fetching correspondence:', err)
      setError('Failed to load correspondence')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    try {
      await correspondenceAPI.create(formData)
      setShowCreateForm(false)
      setFormData({
        subject: '',
        correspondence_type: 'REGULATORY',
        direction: 'OUTBOUND',
        status: 'draft',
        from_party: '',
        to_party: '',
        contact_person: '',
        contact_email: '',
        body: '',
        priority: 'MEDIUM',
        requires_response: false,
        response_due_date: '',
        reference_number: '',
      })
      await fetchCorrespondence()
    } catch (err) {
      console.error('Error creating correspondence:', err)
      setError('Failed to create correspondence')
    }
  }

  const handleAction = async (id, action) => {
    try {
      if (action === 'acknowledge') {
        await correspondenceAPI.acknowledge(id)
      } else if (action === 'close') {
        await correspondenceAPI.close(id)
      } else if (action === 'action_required') {
        await correspondenceAPI.markActionRequired(id)
      }
      await fetchCorrespondence()
      setExpandedId(null)
    } catch (err) {
      console.error(`Error performing ${action}:`, err)
      setError(`Failed to ${action}`)
    }
  }

  const isOverdue = (correspondence) => {
    if (!correspondence.response_due_date || correspondence.status === 'closed') {
      return false
    }
    const dueDate = new Date(correspondence.response_due_date)
    return dueDate < new Date() && correspondence.requires_response && !correspondence.response_sent
  }

  const filteredCorrespondences = correspondences.filter(c =>
    c.correspondence_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.from_party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.to_party?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader size={48} className="mx-auto mb-4 text-blue-400 animate-spin" />
            <p className="text-slate-400">Loading correspondence...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Correspondence</h1>
        <p className="text-slate-400">Track regulatory, supplier, and quality correspondence</p>
      </div>

      <div className="bg-eqms-card border border-eqms-border rounded-lg p-6">
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-80 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search number, subject, from/to party..."
              className="w-full bg-eqms-input border border-eqms-border rounded px-4 py-2 pl-10 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
          >
            <Filter size={18} />
            Filters
          </button>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            <Plus size={18} />
            New Correspondence
          </button>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-eqms-input border border-eqms-border rounded">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-eqms-input border border-eqms-border rounded px-3 py-2 text-slate-300"
              >
                <option value="all">All Types</option>
                {Object.entries(TYPE_BADGES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Direction</label>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="w-full bg-eqms-input border border-eqms-border rounded px-3 py-2 text-slate-300"
              >
                <option value="all">All Directions</option>
                <option value="INBOUND">Received (Inbound)</option>
                <option value="OUTBOUND">Sent (Outbound)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-eqms-input border border-eqms-border rounded px-3 py-2 text-slate-300"
              >
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_BADGES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-eqms-input border border-eqms-border rounded px-3 py-2 text-slate-300"
              >
                <option value="all">All Priorities</option>
                {Object.entries(PRIORITY_BADGES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 p-6 bg-eqms-input border border-eqms-border rounded">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">New Correspondence</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                    placeholder="Correspondence subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                  <select
                    value={formData.correspondence_type}
                    onChange={(e) => setFormData({ ...formData, correspondence_type: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                  >
                    {Object.entries(TYPE_BADGES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">From Party *</label>
                  <input
                    type="text"
                    required
                    value={formData.from_party}
                    onChange={(e) => setFormData({ ...formData, from_party: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                    placeholder="Sender organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">To Party *</label>
                  <input
                    type="text"
                    required
                    value={formData.to_party}
                    onChange={(e) => setFormData({ ...formData, to_party: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                    placeholder="Recipient organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Direction</label>
                  <select
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                  >
                    <option value="OUTBOUND">Sent</option>
                    <option value="INBOUND">Received</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                  >
                    {Object.entries(PRIORITY_BADGES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Response Due Date</label>
                  <input
                    type="date"
                    value={formData.response_due_date}
                    onChange={(e) => setFormData({ ...formData, response_due_date: e.target.value })}
                    className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.requires_response}
                      onChange={(e) => setFormData({ ...formData, requires_response: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Requires Response</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Body</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-eqms-dark border border-eqms-border rounded px-3 py-2 text-slate-300 h-32"
                  placeholder="Correspondence content"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-2"
                >
                  <Send size={16} />
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Correspondence Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-eqms-border">
                <th className="text-left py-3 px-4 font-semibold text-slate-300 w-8"></th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Number</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Direction</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">From/To</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Due</th>
              </tr>
            </thead>
            <tbody>
              {filteredCorrespondences.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 px-4 text-center">
                    <p className="text-slate-500">No correspondence found</p>
                  </td>
                </tr>
              ) : (
                filteredCorrespondences.map((correspondence) => {
                  const overdue = isOverdue(correspondence)
                  return (
                    <React.Fragment key={correspondence.id}>
                      <tr
                        className={`border-b border-eqms-border transition-colors cursor-pointer ${
                          overdue ? 'bg-red-900/10 hover:bg-red-900/20' : 'hover:bg-eqms-input'
                        }`}
                        onClick={() =>
                          setExpandedId(expandedId === correspondence.id ? null : correspondence.id)
                        }
                      >
                        <td className="py-3 px-4">
                          {expandedId === correspondence.id ? (
                            <ChevronUp size={18} className="text-blue-400" />
                          ) : (
                            <ChevronDown size={18} className="text-slate-500" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-blue-300">
                          {correspondence.correspondence_number}
                        </td>
                        <td className="py-3 px-4">{correspondence.subject}</td>
                        <td className="py-3 px-4">
                          {TYPE_BADGES[correspondence.correspondence_type] && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                TYPE_BADGES[correspondence.correspondence_type].bg
                              } ${TYPE_BADGES[correspondence.correspondence_type].text}`}
                            >
                              {TYPE_BADGES[correspondence.correspondence_type].label}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {correspondence.direction === 'INBOUND' ? (
                            <span className="text-blue-300 text-xs">📥 Received</span>
                          ) : (
                            <span className="text-green-300 text-xs">📤 Sent</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {correspondence.direction === 'INBOUND'
                            ? `From: ${correspondence.from_party || '-'}`
                            : `To: ${correspondence.to_party || '-'}`}
                        </td>
                        <td className="py-3 px-4">
                          {STATUS_BADGES[correspondence.status] && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                STATUS_BADGES[correspondence.status].bg
                              } ${STATUS_BADGES[correspondence.status].text}`}
                            >
                              {STATUS_BADGES[correspondence.status].label}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {PRIORITY_BADGES[correspondence.priority] && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                PRIORITY_BADGES[correspondence.priority].bg
                              } ${PRIORITY_BADGES[correspondence.priority].text}`}
                            >
                              {PRIORITY_BADGES[correspondence.priority].label}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {overdue && (
                            <AlertTriangle size={16} className="text-red-400 inline mr-1" />
                          )}
                          {correspondence.response_due_date
                            ? new Date(correspondence.response_due_date).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>

                      {/* Expanded Detail View */}
                      {expandedId === correspondence.id && (
                        <tr className="border-b border-eqms-border bg-eqms-input">
                          <td colSpan="9" className="p-6">
                            <div className="space-y-4">
                              {/* Metadata */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-400">Reference #</p>
                                  <p className="text-slate-300">
                                    {correspondence.reference_number || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Contact Person</p>
                                  <p className="text-slate-300">
                                    {correspondence.contact_person || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Contact Email</p>
                                  <p className="text-slate-300">
                                    {correspondence.contact_email || '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Requires Response</p>
                                  <p className="text-slate-300">
                                    {correspondence.requires_response ? (
                                      <span className="text-green-300 flex items-center gap-1">
                                        <Check size={14} /> Yes
                                      </span>
                                    ) : (
                                      'No'
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Body */}
                              {correspondence.body && (
                                <div>
                                  <p className="text-slate-400 text-sm mb-1">Content</p>
                                  <div className="bg-eqms-dark border border-eqms-border rounded p-3 max-h-48 overflow-y-auto">
                                    <p className="text-slate-300 whitespace-pre-wrap text-sm">
                                      {correspondence.body}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2 pt-4 border-t border-eqms-border">
                                {correspondence.status !== 'acknowledged' &&
                                  correspondence.status !== 'closed' && (
                                    <button
                                      onClick={() =>
                                        handleAction(correspondence.id, 'acknowledge')
                                      }
                                      className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors flex items-center gap-2"
                                    >
                                      <Check size={14} />
                                      Acknowledge
                                    </button>
                                  )}
                                {correspondence.requires_response &&
                                  !correspondence.response_sent && (
                                    <button
                                      onClick={() =>
                                        handleAction(correspondence.id, 'action_required')
                                      }
                                      className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm transition-colors"
                                    >
                                      Mark Action Required
                                    </button>
                                  )}
                                {correspondence.status !== 'closed' && (
                                  <button
                                    onClick={() => handleAction(correspondence.id, 'close')}
                                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm transition-colors"
                                  >
                                    Close
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
