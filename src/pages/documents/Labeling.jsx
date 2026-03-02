import React, { useState, useEffect } from 'react'
import { QrCode, Search, Download, Printer } from 'lucide-react'
import { documentsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Labeling() {
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [labelFormat, setLabelFormat] = useState('standard')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentsAPI.getAll({ limit: 100 })
      setDocuments(response.data?.results || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.document_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div
        id="label-content"
        className="bg-white text-black p-8 border-2 border-gray-800 rounded shadow-lg max-w-md mx-auto"
        style={{ width: '5in', height: '5in' }}
      >
        <div className="text-center mb-4 border-b-2 border-gray-800 pb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">Arni Medica</p>
          <p className="text-xs text-gray-500">Document Label</p>
        </div>

        {format !== 'compact' && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-0.5">Document Number</p>
            <p className="text-base font-bold border-b border-gray-300 pb-1">{baseInfo.docNumber}</p>
          </div>
        )}

        {format === 'compact' ? (
          <div className="text-center mb-3">
            <p className="text-xs text-gray-600">Version {baseInfo.version}</p>
            <p className="text-xs text-gray-600 mt-0.5">Effective: {baseInfo.effectiveDate}</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-0.5">Title</p>
              <p className="text-xs font-semibold line-clamp-2">{baseInfo.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <p className="text-gray-600 mb-0.5">Version</p>
                <p className="font-semibold">{baseInfo.version}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-0.5">Effective</p>
                <p className="font-semibold text-xs">{baseInfo.effectiveDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <p className="text-gray-600 mb-0.5">Department</p>
                <p className="font-semibold text-xs">{baseInfo.department}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-0.5">Classification</p>
                <span className="inline-block bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                  {baseInfo.classification}
                </span>
              </div>
            </div>
          </>
        )}

        {format === 'regulatory' && (
          <div className="border-t-2 border-gray-800 pt-2 mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <p className="text-gray-600 mb-0.5">Regulatory</p>
                <p className="font-semibold">{doc.regulatory_requirement ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-0.5">Control #</p>
                <p className="font-semibold text-xs">{baseInfo.docNumber}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t-2 border-gray-800 pt-2 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-200 flex items-center justify-center rounded border border-gray-400 mb-1">
            <div className="text-center">
              <QrCode size={24} className="mx-auto text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-600">Scan for access</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner message="Loading documents..." />
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Label Generator</h1>
        <p className="text-slate-400">Generate and print document labels in multiple formats</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Document Selector */}
        <div className="col-span-1">
          <div className="card p-6">
            <h3 className="font-semibold text-slate-300 mb-4">Select Document</h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-eqms-input rounded-lg p-4 h-96 overflow-y-auto border border-eqms-border space-y-2">
              {filteredDocuments.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No documents found</p>
              ) : (
                filteredDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                      selectedDocument?.id === doc.id
                        ? 'bg-blue-600 text-white border border-blue-400'
                        : 'bg-eqms-card hover:bg-slate-700 text-slate-300 border border-eqms-border'
                    }`}
                  >
                    <p className="font-semibold truncate">{doc.document_id}</p>
                    <p className="text-xs truncate opacity-75">{doc.title}</p>
                    <p className="text-xs opacity-50">v{doc.major_version}.{doc.minor_version}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Label Preview & Controls */}
        <div className="col-span-2">
          <div className="card p-6">
            {selectedDocument ? (
              <>
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-300 mb-4">Label Format</h3>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { id: 'standard', label: 'Standard', desc: 'Full label with all fields' },
                      { id: 'compact', label: 'Compact', desc: 'Document info + version' },
                      { id: 'regulatory', label: 'Regulatory', desc: 'Add regulatory details' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setLabelFormat(fmt.id)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          labelFormat === fmt.id
                            ? 'bg-blue-600 text-white border border-blue-400'
                            : 'bg-eqms-card hover:bg-slate-700 text-slate-400 border border-eqms-border'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {
                      [
                        { id: 'standard', desc: 'Shows all document information' },
                        { id: 'compact', desc: 'Minimal format for quick reference' },
                        { id: 'regulatory', desc: 'Includes regulatory classification' },
                      ].find((f) => f.id === labelFormat)?.desc
                    }
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-slate-300 mb-4">Label Preview</h3>
                  <div className="bg-eqms-input rounded-lg p-8 border border-eqms-border flex justify-center min-h-96 overflow-auto">
                    {generateLabel(selectedDocument, labelFormat)}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '', 'height=600,width=800')
                      const label = generateLabel(selectedDocument, labelFormat)
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Print Label - ${selectedDocument.document_id}</title>
                          <style>
                            body { margin: 0; padding: 20px; background: white; }
                            @media print { body { margin: 0; padding: 0; } }
                          </style>
                        </head>
                        <body>
                          ${label.outerHTML}
                        </body>
                        </html>
                      `)
                      printWindow.document.close()
                      setTimeout(() => printWindow.print(), 250)
                    }}
                    className="btn-primary flex items-center gap-2 flex-1"
                  >
                    <Printer size={18} />
                    Print Label
                  </button>
                  <button
                    onClick={() => {
                      const element = document.getElementById('label-content')
                      if (element) {
                        const canvas = document.createElement('canvas')
                        canvas.width = 400
                        canvas.height = 400
                        const ctx = canvas.getContext('2d')
                        ctx.fillStyle = 'white'
                        ctx.fillRect(0, 0, 400, 400)
                        const link = document.createElement('a')
                        link.href = canvas.toDataURL('image/png')
                        link.download = `label-${selectedDocument.document_id}.png`
                        link.click()
                      }
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download size={18} />
                    Export
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Tip:</strong> Labels are designed for standard 5"x5" label sheets. Adjust printer settings for optimal results.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-96">
                <QrCode size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg font-medium">Select a document to preview its label</p>
                <p className="text-slate-500 text-sm mt-2">Choose from the list on the left to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
