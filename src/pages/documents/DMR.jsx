import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Archive, CheckCircle, AlertCircle, Loader, ChevronDown, X, Trash2 } from 'lucide-react'
import dmrAPI from '../../api/dmr'
import documentsAPI from '../../api/documents'

const DMR_SECTIONS = {
  DESIGN: 'Design Specifications',
  MANUFACTURING: 'Manufacturing Procedures',
  PACKAGING: 'Packaging & Labeling',
  TESTING: 'Testing & Inspection',
  INSTALLATION: 'Installation & Service',
  QUALITY: 'Quality Procedures',
  REGULATORY: 'Regulatory Submissions',
  RISK: 'Risk Management',
  VALIDATION: 'Validation & Verification',
  OTHER: 'Other',
}

const STATUS_COLORS = {
  draft: 'bg-gray-500/20 text-gray-300',
  active: 'bg-green-500/20 text-green-300',
  superseded: 'bg-yellow-500/20 text-yellow-300',
  archived: 'bg-red-500/20 text-red-300',
}

const DEVICE_CLASS_COLORS = {
  I: 'bg-blue-500/20 text-blue-300',
  II: 'bg-purple-500/20 text-purple-300',
  III: 'bg-orange-500/20 text-orange-300',
}

export default function DMR() {
  const [view, setView] = useState('list') // 'list' or 'detail'
  const [dmrs, setDmrs] = useState([])
  const [selectedDmr, setSelectedDmr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddDocModal, setShowAddDocModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState('')
  const [availableDocuments, setAvailableDocuments] = useState([])
  const [allDocuments, setAllDocuments] = useState([])
  const [completenessData, setCompletenessData] = useState(null)

  // Load DMRs on mount
  useEffect(() => {
    loadDmrs()
  }, [])

  // Load all documents for the add document modal
  useEffect(() => {
    if (showAddDocModal) {
      loadAllDocuments()
    }
  }, [showAddDocModal])

  const loadDmrs = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter) params.status = statusFilter
      if (classFilter) params.device_class = classFilter

      const response = await dmrAPI.list(params)
      setDmrs(response.data)
    } catch (err) {
      console.error('Failed to load DMRs:', err)
      setError('Failed to load Device Master Records')
    } finally {
      setLoading(false)
    }
  }

  const loadAllDocuments = async () => {
    try {
      const response = await documentsAPI.list({ limit: 1000 })
      setAllDocuments(response.data.results || response.data)
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  }

  const viewDmrDetail = async (dmr) => {
    try {
      setLoading(true)
      const response = await dmrAPI.get(dmr.id)
      setSelectedDmr(response.data)
      
      // Load completeness check
      const completeness = await dmrAPI.completenessCheck(dmr.id)
      setCompletenessData(completeness.data)
      
      setView('detail')
    } catch (err) {
      console.error('Failed to load DMR detail:', err)
      setError('Failed to load DMR details')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDmr = async (formData) => {
    try {
      setLoading(true)
      const response = await dmrAPI.create(formData)
      setDmrs([response.data, ...dmrs])
      setShowCreateModal(false)
      setError(null)
    } catch (err) {
      console.error('Failed to create DMR:', err)
      setError(err.response?.data?.detail || 'Failed to create DMR')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDocument = async (docId) => {
    if (!selectedSection) {
      setError('Please select a section')
      return
    }

    try {
      setLoading(true)
      await dmrAPI.addDocument(selectedDmr.id, {
        document: docId,
        section: selectedSection,
      })
      
      // Reload DMR detail
      const response = await dmrAPI.get(selectedDmr.id)
      setSelectedDmr(response.data)
      setShowAddDocModal(false)
      setSelectedSection('')
      setError(null)
    } catch (err) {
      console.error('Failed to add document:', err)
      setError('Failed to add document to DMR')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDocument = async (linkId) => {
    if (!confirm('Remove this document from the DMR?')) return

    try {
      setLoading(true)
      await dmrAPI.removeDocument(selectedDmr.id, {
        document_link_id: linkId,
      })
      
      // Reload DMR detail
      const response = await dmrAPI.get(selectedDmr.id)
      setSelectedDmr(response.data)
      setError(null)
    } catch (err) {
      console.error('Failed to remove document:', err)
      setError('Failed to remove document from DMR')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateDmr = async () => {
    if (!confirm(`Activate DMR ${selectedDmr.dmr_number}? This cannot be undone.`)) return

    try {
      setLoading(true)
      const response = await dmrAPI.activate(selectedDmr.id)
      setSelectedDmr(response.data)
      setError(null)
    } catch (err) {
      console.error('Failed to activate DMR:', err)
      setError(err.response?.data?.error || 'Failed to activate DMR')
    } finally {
      setLoading(false)
    }
  }

  if (view === 'detail' && selectedDmr) {
    return (
      <DetailView
        dmr={selectedDmr}
        completeness={completenessData}
        onBack={() => {
          setView('list')
          setSelectedDmr(null)
          loadDmrs()
        }}
        onAddDocument={() => setShowAddDocModal(true)}
        onRemoveDocument={handleRemoveDocument}
        onActivate={handleActivateDmr}
        loading={loading}
        error={error}
        showAddDocModal={showAddDocModal}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        availableDocuments={allDocuments}
        onConfirmAddDoc={handleAddDocument}
        onCloseAddDocModal={() => {
          setShowAddDocModal(false)
          setSelectedSection('')
        }}
      />
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Device Master Record (DMR)</h1>
        <p className="text-slate-400">Maintain the device master record containing all documents related to the finished device per 21 CFR 820.181</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="card p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search DMR number or device name..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={() => loadDmrs()}
            />
          </div>
          
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              loadDmrs()
            }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="superseded">Superseded</option>
            <option value="archived">Archived</option>
          </select>

          <select
            className="input-field"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value)
              loadDmrs()
            }}
          >
            <option value="">All Classes</option>
            <option value="I">Class I</option>
            <option value="II">Class II</option>
            <option value="III">Class III</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New DMR
          </button>
        </div>

        {loading && <div className="text-center py-8"><Loader className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>}

        {!loading && dmrs.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No Device Master Records found</p>
          </div>
        )}

        {!loading && dmrs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-eqms-border">
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">DMR Number</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Device Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Class</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Documents</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Owner</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {dmrs.map((dmr) => (
                  <tr
                    key={dmr.id}
                    onClick={() => viewDmrDetail(dmr)}
                    className="border-b border-eqms-border hover:bg-eqms-input transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-blue-400">{dmr.dmr_number}</td>
                    <td className="py-3 px-4">{dmr.device_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${DEVICE_CLASS_COLORS[dmr.device_class]}`}>
                        Class {dmr.device_class}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[dmr.status]}`}>
                        {dmr.status_display}
                      </span>
                    </td>
                    <td className="py-3 px-4">{dmr.documents_count}</td>
                    <td className="py-3 px-4 text-slate-400">{dmr.owner_name || 'Unassigned'}</td>
                    <td className="py-3 px-4 text-slate-400">{dmr.effective_date ? new Date(dmr.effective_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateDMRModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateDmr}
          loading={loading}
        />
      )}
    </div>
  )
}

function DetailView({
  dmr,
  completeness,
  onBack,
  onAddDocument,
  onRemoveDocument,
  onActivate,
  loading,
  error,
  showAddDocModal,
  selectedSection,
  setSelectedSection,
  availableDocuments,
  onConfirmAddDoc,
  onCloseAddDocModal,
}) {
  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
      >
        ← Back to List
      </button>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{dmr.dmr_number}</h1>
            <p className="text-xl text-slate-300">{dmr.device_name}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded text-sm font-semibold ${DEVICE_CLASS_COLORS[dmr.device_class]}`}>
              Class {dmr.device_class}
            </span>
            <span className={`px-3 py-1 rounded text-sm font-semibold ${STATUS_COLORS[dmr.status]}`}>
              {dmr.status_display}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Metadata</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-400">Device Family</p>
              <p className="text-slate-200">{dmr.device_family || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400">Product Code</p>
              <p className="text-slate-200 font-mono">{dmr.product_code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400">Regulation</p>
              <p className="text-slate-200">{dmr.regulation_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400">Owner</p>
              <p className="text-slate-200">{dmr.owner_name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-slate-400">Effective Date</p>
              <p className="text-slate-200">{dmr.effective_date ? new Date(dmr.effective_date).toLocaleDateString() : 'Not Set'}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Completeness Status</h3>
          {completeness && (
            <div className="space-y-2">
              {completeness.sections && Object.entries(completeness.sections).map(([key, section]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{section.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">({section.count})</span>
                    {section.complete ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="mb-6 flex gap-3">
        {dmr.status === 'draft' && (
          <button
            onClick={onActivate}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Activating...' : 'Activate DMR'}
          </button>
        )}
        <button
          onClick={onAddDocument}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <Plus size={18} />
          Add Document
        </button>
      </div>

      {/* Document Sections */}
      <div className="space-y-4">
        {Object.entries(DMR_SECTIONS).map(([key, name]) => (
          <DocumentSection
            key={key}
            sectionKey={key}
            sectionName={name}
            links={dmr.document_links?.filter(l => l.section === key) || []}
            onRemove={onRemoveDocument}
            loading={loading}
          />
        ))}
      </div>

      {showAddDocModal && (
        <AddDocumentModal
          onClose={onCloseAddDocModal}
          onConfirm={onConfirmAddDoc}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          availableDocuments={availableDocuments}
          linkedDocIds={dmr.document_links?.map(l => l.document) || []}
        />
      )}
    </div>
  )
}

function DocumentSection({ sectionKey, sectionName, links, onRemove, loading }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="card p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left hover:bg-eqms-border/30 transition-colors p-2 -m-2 rounded"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform ${expanded ? '' : '-rotate-90'}`}
          />
          <h3 className="font-semibold text-slate-300">{sectionName}</h3>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-eqms-border text-xs font-semibold text-slate-400">
            {links.length}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {links.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No documents in this section</p>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="flex items-start justify-between p-3 bg-eqms-input rounded border border-eqms-border hover:border-slate-600 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-300">{link.document_id}</p>
                  <p className="text-sm text-slate-400">{link.document_title}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[link.document_status]}`}>
                      {link.document_status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                      v{link.document_version}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(link.id)}
                  disabled={loading}
                  className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function CreateDMRModal({ onClose, onCreate, loading }) {
  const [formData, setFormData] = useState({
    device_name: '',
    device_family: '',
    device_class: 'II',
    product_code: '',
    regulation_number: '',
    description: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.device_name) {
      alert('Device name is required')
      return
    }
    onCreate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Device Master Record</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Device Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="device_name"
              value={formData.device_name}
              onChange={handleChange}
              placeholder="e.g., Glucose Monitoring System"
              className="input-field w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Device Family</label>
              <input
                type="text"
                name="device_family"
                value={formData.device_family}
                onChange={handleChange}
                placeholder="e.g., Diagnostic Devices"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Device Class <span className="text-red-400">*</span></label>
              <select
                name="device_class"
                value={formData.device_class}
                onChange={handleChange}
                className="input-field w-full"
                required
              >
                <option value="I">Class I</option>
                <option value="II">Class II</option>
                <option value="III">Class III</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Product Code</label>
              <input
                type="text"
                name="product_code"
                value={formData.product_code}
                onChange={handleChange}
                placeholder="FDA product code"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Regulation Number</label>
              <input
                type="text"
                name="regulation_number"
                value={formData.regulation_number}
                onChange={handleChange}
                placeholder="e.g., 21 CFR 866.5940"
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the device and intended use"
              className="input-field w-full h-24"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create DMR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddDocumentModal({
  onClose,
  onConfirm,
  selectedSection,
  setSelectedSection,
  availableDocuments,
  linkedDocIds,
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDocs = availableDocuments.filter(
    doc => !linkedDocIds.includes(doc.id) &&
      (doc.document_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doc.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Document to DMR</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Section <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select a section...</option>
              {Object.entries(DMR_SECTIONS).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Document <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full mb-3"
            />

            <div className="border border-eqms-border rounded-lg max-h-64 overflow-y-auto">
              {filteredDocs.length === 0 ? (
                <div className="p-4 text-center text-slate-500">No documents available</div>
              ) : (
                filteredDocs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => onConfirm(doc.id)}
                    className="w-full text-left p-4 border-b border-eqms-border last:border-b-0 hover:bg-eqms-input transition-colors flex items-start justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-300">{doc.document_id}</p>
                      <p className="text-sm text-slate-400">{doc.title}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${STATUS_COLORS[doc.status]}`}>
                      {doc.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => selectedSection && filteredDocs.length > 0 && onConfirm(filteredDocs[0].id)}
              className="btn-primary"
              disabled={!selectedSection}
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
