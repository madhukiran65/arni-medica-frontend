import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, ChevronDown, ChevronUp, AlertCircle, Loader } from 'lucide-react'
import { validationAPI } from '../../services/api'

const TYPE_BADGES = {
  iq: { label: 'IQ', bg: 'bg-purple-900', text: 'text-purple-200' },
  oq: { label: 'OQ', bg: 'bg-blue-900', text: 'text-blue-200' },
  pq: { label: 'PQ', bg: 'bg-green-900', text: 'text-green-200' },
  uat: { label: 'UAT', bg: 'bg-orange-900', text: 'text-orange-200' },
  regression: { label: 'Regression', bg: 'bg-teal-900', text: 'text-teal-200' },
  security: { label: 'Security', bg: 'bg-red-900', text: 'text-red-200' },
}

const STATUS_BADGES = {
  draft: { label: 'Draft', bg: 'bg-slate-700', text: 'text-slate-200' },
  approved: { label: 'Approved', bg: 'bg-green-700', text: 'text-green-200' },
  in_execution: { label: 'In Execution', bg: 'bg-blue-700', text: 'text-blue-200' },
  completed: { label: 'Completed', bg: 'bg-slate-600', text: 'text-slate-200' },
  closed: { label: 'Closed', bg: 'bg-slate-800', text: 'text-slate-300' },
}

export default function Validation() {
  const [protocols, setProtocols] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [testCases, setTestCases] = useState({})
  const [rtmEntries, setRtmEntries] = useState({})
  const [summaryReports, setSummaryReports] = useState({})
  const [loadingDetails, setLoadingDetails] = useState({})

  // Filter states
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProtocols()
  }, [typeFilter, statusFilter])

  const fetchProtocols = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {}
      if (typeFilter !== 'all') params.protocol_type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter
      
      const { data } = await validationAPI.protocols.getAll(params)
      setProtocols(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error('Error fetching protocols:', err)
      setError('Failed to load validation protocols')
    } finally {
      setLoading(false)
    }
  }

  const fetchProtocolDetails = async (protocolId) => {
    try {
      setLoadingDetails(prev => ({ ...prev, [protocolId]: true }))
      
      const [protocolRes, testCasesRes, rtmRes, reportsRes] = await Promise.all([
        validationAPI.protocols.get(protocolId),
        validationAPI.testCases.getAll({ protocol: protocolId }),
        validationAPI.rtmEntries.getAll({ protocol: protocolId }),
        validationAPI.summaryReports.getAll({ protocol: protocolId }),
      ])
      
      setTestCases(prev => ({
        ...prev,
        [protocolId]: Array.isArray(testCasesRes.data) ? testCasesRes.data : testCasesRes.data.results || []
      }))
      
      setRtmEntries(prev => ({
        ...prev,
        [protocolId]: Array.isArray(rtmRes.data) ? rtmRes.data : rtmRes.data.results || []
      }))
      
      setSummaryReports(prev => ({
        ...prev,
        [protocolId]: Array.isArray(reportsRes.data) ? reportsRes.data : reportsRes.data.results || []
      }))
    } catch (err) {
      console.error('Error fetching protocol details:', err)
    } finally {
      setLoadingDetails(prev => ({ ...prev, [protocolId]: false }))
    }
  }

  const toggleExpand = async (protocolId) => {
    if (expandedId === protocolId) {
      setExpandedId(null)
    } else {
      setExpandedId(protocolId)
      if (!testCases[protocolId]) {
        await fetchProtocolDetails(protocolId)
      }
    }
  }

  const filteredProtocols = protocols.filter(p =>
    p.protocol_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader size={48} className="mx-auto mb-4 text-blue-400 animate-spin" />
            <p className="text-slate-400">Loading validation documents...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Validation Documents</h1>
        <p className="text-slate-400">
          IQ/OQ/PQ protocols, test cases, and validation summary reports
        </p>
      </div>

      <div className="bg-eqms-card border border-eqms-border rounded-lg p-6">
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-80 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search protocol number, title..."
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
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Plus size={18} />
            New Protocol
          </button>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-eqms-input border border-eqms-border rounded">
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
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Protocols Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-eqms-border">
                <th className="text-left py-3 px-4 font-semibold text-slate-300 w-8"></th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Protocol #</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">System/Process</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Approval Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredProtocols.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 px-4 text-center">
                    <p className="text-slate-500">No validation protocols found</p>
                  </td>
                </tr>
              ) : (
                filteredProtocols.map((protocol) => (
                  <React.Fragment key={protocol.id}>
                    <tr
                      className="border-b border-eqms-border hover:bg-eqms-input transition-colors cursor-pointer"
                      onClick={() => toggleExpand(protocol.id)}
                    >
                      <td className="py-3 px-4">
                        {expandedId === protocol.id ? (
                          <ChevronUp size={18} className="text-blue-400" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-500" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-300">{protocol.protocol_id}</td>
                      <td className="py-3 px-4">{protocol.title}</td>
                      <td className="py-3 px-4">
                        {TYPE_BADGES[protocol.protocol_type] && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${TYPE_BADGES[protocol.protocol_type].bg} ${TYPE_BADGES[protocol.protocol_type].text}`}>
                            {TYPE_BADGES[protocol.protocol_type].label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {STATUS_BADGES[protocol.status] && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGES[protocol.status].bg} ${STATUS_BADGES[protocol.status].text}`}>
                            {STATUS_BADGES[protocol.status].label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{protocol.system_name || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {protocol.approval_date
                          ? new Date(protocol.approval_date).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>

                    {/* Expanded Detail View */}
                    {expandedId === protocol.id && (
                      <tr className="border-b border-eqms-border bg-eqms-input">
                        <td colSpan="7" className="p-6">
                          {loadingDetails[protocol.id] ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader size={32} className="text-blue-400 animate-spin" />
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Protocol Overview */}
                              <div>
                                <h4 className="font-semibold text-slate-200 mb-3">Overview</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-slate-400">Description</p>
                                    <p className="text-slate-300">{protocol.description || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Scope</p>
                                    <p className="text-slate-300">{protocol.scope || '-'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Test Cases */}
                              {(testCases[protocol.id]?.length || 0) > 0 && (
                                <div>
                                  <h4 className="font-semibold text-slate-200 mb-3">Test Cases ({testCases[protocol.id].length})</h4>
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {testCases[protocol.id].map((tc) => (
                                      <div key={tc.id} className="p-3 bg-eqms-dark border border-eqms-border rounded text-sm">
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="text-slate-300 flex-1">{tc.name || tc.title || `Test Case #${tc.id}`}</span>
                                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                            tc.result === 'pass'
                                              ? 'bg-green-900 text-green-200'
                                              : tc.result === 'fail'
                                              ? 'bg-red-900 text-red-200'
                                              : 'bg-slate-700 text-slate-200'
                                          }`}>
                                            {tc.result || 'Pending'}
                                          </span>
                                        </div>
                                        {tc.execution_date && (
                                          <p className="text-slate-500 text-xs mt-1">
                                            Executed: {new Date(tc.execution_date).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* RTM Entries */}
                              {(rtmEntries[protocol.id]?.length || 0) > 0 && (
                                <div>
                                  <h4 className="font-semibold text-slate-200 mb-3">Requirements Traceability ({rtmEntries[protocol.id].length})</h4>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {rtmEntries[protocol.id].map((rtm) => (
                                      <div key={rtm.id} className="p-2 bg-eqms-dark border border-eqms-border rounded text-sm text-slate-400">
                                        {rtm.requirement} → {rtm.test_case}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Summary Report */}
                              {(summaryReports[protocol.id]?.length || 0) > 0 && (
                                <div>
                                  <h4 className="font-semibold text-slate-200 mb-3">Summary Report</h4>
                                  <div className="p-3 bg-eqms-dark border border-eqms-border rounded text-sm">
                                    <p className="text-slate-300">{summaryReports[protocol.id][0]?.summary || 'Report available'}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
