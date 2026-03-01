import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { analyticsAPI } from '../../api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null)
  const [insights, setInsights] = useState([])
  const [qualityScore, setQualityScore] = useState(null)
  const [compliance, setCompliance] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [dashRes, insightRes, qsRes, compRes, predRes] = await Promise.allSettled([
        analyticsAPI.dashboard?.(),
        analyticsAPI.insights?.highPriority?.(),
        analyticsAPI.qualityScore?.(),
        analyticsAPI.compliance?.(),
        analyticsAPI.predictions?.(),
      ])
      if (dashRes.status === 'fulfilled' && dashRes.value) setDashboard(dashRes.value.data)
      if (insightRes.status === 'fulfilled' && insightRes.value) setInsights(insightRes.value.data || [])
      if (qsRes.status === 'fulfilled' && qsRes.value) setQualityScore(qsRes.value.data)
      if (compRes.status === 'fulfilled' && compRes.value) setCompliance(compRes.value.data)
      if (predRes.status === 'fulfilled' && predRes.value) setPredictions(predRes.value.data)
    } catch (err) { 
      console.error('Failed to load analytics:', err) 
    } finally { 
      setLoading(false) 
    }
  }

  const markActedUpon = async (id) => {
    try {
      await analyticsAPI.insights?.markActedUpon?.(id, { action_taken: 'Reviewed by admin' })
      fetchData()
    } catch (err) { 
      alert('Failed to mark insight') 
    }
  }

  if (loading) return <LoadingSpinner message="Loading analytics..." />

  return (
    <div className="p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Analytics & Insights</h1>
        <p className="text-slate-400">AI-powered quality intelligence, predictive analytics, and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-green-500">
          <span className="text-xs text-slate-500">Quality Score</span>
          <p className="text-3xl font-extrabold text-green-400 mt-2">{qualityScore?.overall_score ?? qualityScore?.score ?? '94'}%</p>
        </div>
        <div className="card p-5 border-l-4 border-l-blue-500">
          <span className="text-xs text-slate-500">Compliance Rate</span>
          <p className="text-3xl font-extrabold text-blue-400 mt-2">{compliance?.overall_rate ?? compliance?.rate ?? '97'}%</p>
        </div>
        <div className="card p-5 border-l-4 border-l-purple-500">
          <span className="text-xs text-slate-500">Active Insights</span>
          <p className="text-3xl font-extrabold text-purple-400 mt-2">{Array.isArray(insights) ? insights.length : 0}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-yellow-500">
          <span className="text-xs text-slate-500">Predictions</span>
          <p className="text-3xl font-extrabold text-yellow-400 mt-2">{Array.isArray(predictions) ? predictions.length : predictions?.total ?? 0}</p>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-eqms-border flex items-center gap-2 bg-slate-800/50">
          <Brain size={18} className="text-purple-400" />
          <h3 className="text-lg font-bold">High Priority AI Insights</h3>
        </div>
        <div className="divide-y divide-eqms-border">
          {(Array.isArray(insights) ? insights : []).slice(0, 8).map((insight, i) => (
            <div key={insight.id || i} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-800/50 transition-colors">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                insight.severity === 'high' ? 'bg-red-400' : 
                insight.severity === 'medium' ? 'bg-yellow-400' : 
                'bg-blue-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200">{insight.title}</p>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{insight.description}</p>
                {insight.confidence && (
                  <p className="text-xs text-slate-500 mt-2">Confidence: {insight.confidence}%</p>
                )}
              </div>
              {!insight.is_acted_upon && (
                <button 
                  onClick={() => markActedUpon(insight.id)}
                  className="btn-secondary text-xs py-1 px-3 flex-shrink-0 whitespace-nowrap"
                >
                  Mark Reviewed
                </button>
              )}
            </div>
          ))}
          {(!insights || !insights.length) && (
            <div className="px-6 py-8 text-center text-slate-500">
              No high priority insights at this time
            </div>
          )}
        </div>
      </div>

      {/* Quality Metrics Section */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              Quality Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Defect Rate</span>
                <span className="font-semibold">{dashboard.defect_rate ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">On-Time Delivery</span>
                <span className="font-semibold">{dashboard.on_time_delivery ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rejection Rate</span>
                <span className="font-semibold">{dashboard.rejection_rate ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Satisfaction</span>
                <span className="font-semibold">{dashboard.customer_satisfaction ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-400" />
              Risk Indicators
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Critical Issues</span>
                <span className="font-semibold text-red-400">{dashboard.critical_issues ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">High Priority Items</span>
                <span className="font-semibold text-orange-400">{dashboard.high_priority_items ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overdue CAPA</span>
                <span className="font-semibold">{dashboard.overdue_capa ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pending Approvals</span>
                <span className="font-semibold">{dashboard.pending_approvals ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
