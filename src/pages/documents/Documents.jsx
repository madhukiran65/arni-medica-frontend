import React, { useState } from 'react'
import { Plus, Search, Filter, Download } from 'lucide-react'

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const documents = [
    { id: 1, name: 'SOP-QA-001', title: 'Quality Assurance Procedures', status: 'Approved', version: 'Rev 2', date: '2025-02-15' },
    { id: 2, name: 'SOP-MFG-002', title: 'Manufacturing Process', status: 'In Review', version: 'Rev 1', date: '2025-02-20' },
    { id: 3, name: 'WI-TEST-001', title: 'Testing Instructions', status: 'Approved', version: 'Rev 5', date: '2025-01-10' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Control</h1>
        <p className="text-slate-400">Manage controlled documents and correspondence</p>
      </div>

      <div className="card p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search documents..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={18} />
            Filter
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New Document
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-eqms-border">
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Document ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Version</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-eqms-border hover:bg-eqms-input transition-colors cursor-pointer">
                  <td className="py-3 px-4 font-mono text-blue-400">{doc.name}</td>
                  <td className="py-3 px-4">{doc.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      doc.status === 'Approved'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{doc.version}</td>
                  <td className="py-3 px-4 text-slate-500">{doc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
