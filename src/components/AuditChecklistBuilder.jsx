import React, { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Modal from './common/Modal'
import FormField from './common/FormField'

export default function AuditChecklistBuilder({ auditId, onAddChecklist }) {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    standard_reference: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onAddChecklist(formData)
      setFormData({ title: '', description: '', standard_reference: '' })
      setShowModal(false)
    } catch (err) {
      console.error('Failed to create checklist:', err)
    }
  }

  const templateOptions = [
    {
      name: 'ISO 13485:2016 Quality Management System',
      standard: 'ISO 13485:2016',
    },
    {
      name: 'FDA 21 CFR Part 11 Electronic Records',
      standard: 'FDA 21 CFR 11',
    },
    {
      name: 'Good Manufacturing Practice (GMP)',
      standard: 'GMP',
    },
    {
      name: 'Document Control & Records',
      standard: 'General',
    },
  ]

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Plus size={18} /> Add Checklist
      </button>

      {showModal && (
        <Modal
          title="Create Audit Checklist"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
              >
                Create
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Checklist Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Section 7.5 - Operational Controls"
              required
            />
            <FormField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed description of what this checklist covers"
              as="textarea"
            />
            <FormField
              label="Standard Reference"
              value={formData.standard_reference}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  standard_reference: e.target.value,
                })
              }
              placeholder="e.g., ISO 13485:2016 Section 7.5"
            />

            <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
              <p className="text-sm text-slate-400 mb-3">Quick Templates:</p>
              <div className="space-y-2">
                {templateOptions.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        title: template.name,
                        standard_reference: template.standard,
                      })
                    }
                    className="text-left block w-full p-2 rounded hover:bg-slate-700 transition text-sm"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
