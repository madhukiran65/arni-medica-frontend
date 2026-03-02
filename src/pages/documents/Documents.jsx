import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, ChevronRight, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PermissionGate from '../../components/common/PermissionGate'
import documentsAPI from '../../api/documents'

const STATUS_COLORS = {
  DRAFT: 'bg-gray-500/10 text-gray-400',
  IN_REVIEW: 'bg-yellow-500/10 text-yellow-400',
  REVIEWED: 'bg-blue-500/10 text-blue-400',
  APPROVED: 'bg-blue-500/10 text-blue-400',
  EFFECTIVE: 'bg-green-500/10 text-green-400',
  OBSOLETE: 'bg-red-500/10 text-red-400',
  SUPERSEDED: 'bg-orange-500/10 text-orange-400',
  ARCHIVED: 'bg-slate-500/10 text-slate-400',
  REJECTED: 'bg-red-500/10 text-red-400',
}

export default function Documents() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('updated_at')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchDocuments()
  }, [searchTerm, filterStatus, filterType, sortBy, page])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page,
        limit: 20,
        ordering: sortBy === 'updated_at' ? '-updated_at' : sortBy,
      }

      if (searchTerm) {
        params.search = searchTerm
      }
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }
      if (filterType !== 'all') {
        params.document_type = filterType
      }

      const response = await documentsAPI.list(params)
      const data = response.data

      // Handle both paginated and non-paginated responses
      if (data.results) {
        setDocuments(data.results)
        setTotalPages(Math.ceil(data.count / 20))
      } else if (Array.isArray(data)) {
        setDocuments(data)
        setTotalPages(1)
      } else {
        setDocuments([])
        setTotalPages(1)
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load documents')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (docId) => {
    navigate(`/documents/${docId}`)
  }

  const handleNewDocument = () => {
    navigate('/documents/new')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Control</h1>
        <p className="text-slate-400">Manage controlled documents and correspondence</p>
      </div>

      <div className="card p-6">
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search by document number or title..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <select
            className="input-field py-2 px-3"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="APPROVED">Approved</option>
            <option value="EFFECTIVE">Effective</option>
            <option value="OBSOLETE">Obsolete</option>
            <option value="SUPERSEDED">Superseded</option>
            <option value="ARCHIVED">Archived</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            className="input-field py-2 px-3"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Types</option>
            <option value="SOP">SOP</option>
            <option value="WI">WI</option>
            <option value="FORM">Form</option>
            <option value="TEMPLATE">Template</option>
            <option value="POLICY">Policy</option>
            <option value="SPEC">Spec</option>
            <option value="DRAWING">Drawing</option>
            <option value="RECORD">Record</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            className="input-field py-2 px-3"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
          >
            <option value="updated_at">Latest Updated</option>
            <option value="title">Title (A-Z)</option>
            <option value="status">Status</option>
            <option value="version">Version</option>
          </select>

          <PermissionGate
            permission="can_create_documents"
            fallback={
              <button className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
                <Plus size={18} />
                New Document
              </button>
            }
          >
            <button
              onClick={handleNewDocument}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              New Document
            </button>
          </PermissionGate>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-blue-400 animate-spin mr-3" />
            <p className="text-slate-400">Loading documents...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && documents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-2">No documents found</p>
            <p className="text-slate-500 text-sm">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'Create your first document to get started'}
            </p>
          </div>
        )}

        {/* Documents Table */}
        {!loading && documents.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Document ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Version</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Author</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => handleRowClick(doc.id)}
                      className="border-b border-eqms-border hover:bg-eqms-input transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono text-blue-400 group-hover:text-blue-300">
                        {doc.document_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{doc.title}</span>
                          <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{doc.document_type}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_COLORS[doc.status] || 'bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {doc.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {doc.version || '1'}.{doc.revision_number || '0'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        {doc.author_name || doc.author || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-sm">
                        {doc.updated_at
                          ? new Date(doc.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: doc.updated_at.includes('-') && new Date(doc.updated_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-eqms-border">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-eqms-border text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-eqms-border text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
