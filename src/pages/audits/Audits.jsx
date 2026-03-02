import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { auditsAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'

export default function Audits() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => { fetchAudits() }, [page, search])

  const fetchAudits = async () => {
    setLoading(true)
    try {
      const { data } = await auditsAPI.list({ page, ...(search && { search }) })
      setAudits(data.results || data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load audits:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audit Management</h1>
        <p className="text-slate-400">Internal and external audits, audit readiness</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search audits..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button onClick={() => navigate('/audits/create')} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Audit
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !audits.length ? (
          <EmptyState icon={Shield} title="No audits found" message="Schedule your first audit" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Audit ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Lead Auditor</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
                    <tr key={a.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{a.audit_id || a.id}</td>
                      <td className="py-3 px-4 font-medium">{a.title}</td>
                      <td className="py-3 px-4 text-slate-400">{a.audit_type || '—'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={a.current_stage} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{a.lead_auditor_name || '—'}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(a.planned_start_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/audits/${a.id}`)}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalCount > 10 && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(totalCount / 10)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
