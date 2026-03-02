import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react'
import documentsAPI from '../../api/documents'
import RichTextEditor from '../../components/common/RichTextEditor'

export default function DocumentCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    document_number: '',
    document_type: 'SOP',
    category: '',
    department: '',
    classification: 'INTERNAL',
    content: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.document_type) {
      setError('Title and Document Type are required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await documentsAPI.create(formData)
      const newDoc = response.data || response
      alert('Document created successfully!')
      navigate(`/documents/${newDoc.id}`)
    } catch (err) {
      console.error('Failed to create document:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to create document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/documents" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
          <ArrowLeft size={18} />
          Back to Documents
        </Link>
        <h1 className="text-3xl font-bold">Create New Document</h1>
        <p className="text-slate-400 mt-2">Add a new controlled document to your eQMS</p>
      </div>

      <div className="card p-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Document title"
              className="input-field w-full"
              required
            />
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Document Number
            </label>
            <input
              type="text"
              name="document_number"
              value={formData.document_number}
              onChange={handleChange}
              placeholder="e.g., SOP-QA-001 (auto-generated if left blank)"
              className="input-field w-full"
            />
            <p className="text-xs text-slate-500 mt-1">If left blank, will be auto-generated</p>
          </div>

          {/* Grid for Type, Category, Department, Classification */}
          <div className="grid grid-cols-2 gap-4">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Document Type <span className="text-red-400">*</span>
              </label>
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
                className="input-field w-full"
                required
              >
                <option value="SOP">SOP (Standard Operating Procedure)</option>
                <option value="WI">WI (Work Instruction)</option>
                <option value="FORM">Form</option>
                <option value="TEMPLATE">Template</option>
                <option value="POLICY">Policy</option>
                <option value="SPEC">Specification</option>
                <option value="DRAWING">Drawing</option>
                <option value="RECORD">Record</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Quality, Manufacturing"
                className="input-field w-full"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Quality Assurance"
                className="input-field w-full"
              />
            </div>

            {/* Classification */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Classification
              </label>
              <select
                name="classification"
                value={formData.classification}
                onChange={handleChange}
                className="input-field w-full"
              >
                <option value="PUBLIC">Public</option>
                <option value="INTERNAL">Internal</option>
                <option value="CONFIDENTIAL">Confidential</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Document Content
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Enter document content here..."
              minHeight="300px"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-eqms-border">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Document'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
