import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Activity, BarChart3 } from 'lucide-react';

/**
 * RiskScoreGauge - Circular gauge showing risk score (0-100)
 * Color coded: 0-30 green, 30-60 yellow, 60-100 red
 */
function RiskScoreGauge({ score = 0, previousScore = null }) {
  const getColor = () => {
    if (score < 30) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' };
    if (score < 60) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', badge: 'bg-red-100 text-red-700' };
  };

  const getStatus = () => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Medium Risk';
    return 'High Risk';
  };

  const getTrendIcon = () => {
    if (previousScore === null || previousScore === undefined) return null;
    if (score > previousScore) return <TrendingUp size={16} className="text-red-600" />;
    if (score < previousScore) return <TrendingDown size={16} className="text-emerald-600" />;
    return <Minus size={16} className="text-slate-600" />;
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-xl border-2 p-6 text-center ${colors.bg} ${colors.border}`}>
      <div className="relative inline-flex items-center justify-center mb-4">
        <svg width="140" height="140" className="transform -rotate-90">
          <circle
            cx="70"
            cy="70"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className={colors.text}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div className="absolute text-center">
          <p className={`text-4xl font-bold ${colors.text}`}>{score}</p>
          <p className="text-xs text-slate-600">/ 100</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className={`text-sm font-semibold ${colors.text}`}>{getStatus()}</p>
        {getTrendIcon() && (
          <div className="flex items-center justify-center gap-1 text-xs">
            {getTrendIcon()}
            <span className={score > previousScore ? 'text-red-600' : 'text-emerald-600'}>
              {Math.abs(score - previousScore)} points
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * RiskTrendingPanel - Main panel showing current risk score
 * Risk Score = (open CAPAs × 5) + (critical deviations × 10) + (overdue items × 8) + (open complaints × 3)
 */
function RiskTrendingPanel({ dashboardData = {} }) {
  const calculateRiskScore = () => {
    const openCapas = dashboardData.summary?.open_capas || dashboardData.capas_open || 0;
    const criticalDeviations = dashboardData.critical_deviations || 0;
    const overdueItems = Object.values(dashboardData.overdue_items || {}).reduce((a, b) => a + b, 0);
    const openComplaints = dashboardData.summary?.open_complaints || dashboardData.complaints_open || 0;

    return (openCapas * 5) + (criticalDeviations * 10) + (overdueItems * 8) + (openComplaints * 3);
  };

  const riskScore = useMemo(() => calculateRiskScore(), [dashboardData]);
  const previousScore = dashboardData.previous_risk_score || null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <AlertTriangle size={20} className="text-red-600" />
        Risk Intelligence
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score Gauge */}
        <div className="md:col-span-1">
          <RiskScoreGauge score={riskScore} previousScore={previousScore} />
        </div>

        {/* Risk Contributors */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">Open CAPAs</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{dashboardData.summary?.open_capas || dashboardData.capas_open || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Impact: ×5 each</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">Critical Deviations</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{dashboardData.critical_deviations || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Impact: ×10 each</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">Overdue Items</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">
                {Object.values(dashboardData.overdue_items || {}).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Impact: ×8 each</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">Open Complaints</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{dashboardData.summary?.open_complaints || dashboardData.complaints_open || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Impact: ×3 each</p>
            </div>
          </div>

          {/* Risk Score Formula */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">Risk Score Calculation</p>
            <p className="text-xs text-blue-800">
              ({dashboardData.summary?.open_capas || 0} × 5) + ({dashboardData.critical_deviations || 0} × 10) + ({Object.values(dashboardData.overdue_items || {}).reduce((a, b) => a + b, 0)} × 8) + ({dashboardData.summary?.open_complaints || 0} × 3) = <span className="font-bold">{riskScore}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PredictiveInsights - Shows predicted issues, at-risk areas, and trending indicators
 */
function PredictiveInsights({ dashboardData = {}, trends = {} }) {
  // Calculate predicted issues based on current trends
  const calculatePredictedIssues = () => {
    const capaTrends = trends.capa_trends || [];
    const complaintTrends = trends.complaint_trends || [];

    let predictedCapas = 0;
    let predictedComplaints = 0;

    if (capaTrends.length > 0) {
      const avgOpened = capaTrends.slice(-3).reduce((sum, m) => sum + (m.opened || 0), 0) / 3;
      const avgClosed = capaTrends.slice(-3).reduce((sum, m) => sum + (m.closed || 0), 0) / 3;
      predictedCapas = Math.round(avgOpened - avgClosed);
    }

    if (complaintTrends.length > 0) {
      const avgComplaints = complaintTrends.slice(-3).reduce((sum, m) => sum + (m.count || 0), 0) / 3;
      predictedComplaints = Math.round(avgComplaints * 1.2); // 20% increase estimate
    }

    return { predictedCapas, predictedComplaints };
  };

  // Identify at-risk areas
  const getAtRiskAreas = () => {
    const areas = [];

    if ((dashboardData.summary?.open_capas || 0) > 5) {
      areas.push({ name: 'CAPAs', risk: 'high', count: dashboardData.summary.open_capas });
    }

    if ((dashboardData.critical_deviations || 0) > 2) {
      areas.push({ name: 'Deviations', risk: 'high', count: dashboardData.critical_deviations });
    }

    if ((dashboardData.summary?.open_complaints || 0) > 3) {
      areas.push({ name: 'Complaints', risk: 'medium', count: dashboardData.summary.open_complaints });
    }

    const overdueTotal = Object.values(dashboardData.overdue_items || {}).reduce((a, b) => a + b, 0);
    if (overdueTotal > 5) {
      areas.push({ name: 'Overdue Items', risk: 'medium', count: overdueTotal });
    }

    return areas;
  };

  // Determine trending direction
  const getTrendingIndicators = () => {
    const capaTrends = trends.capa_trends || [];
    const complaintTrends = trends.complaint_trends || [];

    const indicators = [];

    if (capaTrends.length > 1) {
      const latestCapa = capaTrends[capaTrends.length - 1]?.opened || 0;
      const previousCapa = capaTrends[capaTrends.length - 2]?.opened || 0;
      indicators.push({
        label: 'CAPAs Opened',
        trending: latestCapa > previousCapa ? 'up' : latestCapa < previousCapa ? 'down' : 'stable',
        value: latestCapa,
      });
    }

    if (complaintTrends.length > 1) {
      const latestComplaint = complaintTrends[complaintTrends.length - 1]?.count || 0;
      const previousComplaint = complaintTrends[complaintTrends.length - 2]?.count || 0;
      indicators.push({
        label: 'Complaints',
        trending: latestComplaint > previousComplaint ? 'up' : latestComplaint < previousComplaint ? 'down' : 'stable',
        value: latestComplaint,
      });
    }

    return indicators;
  };

  const { predictedCapas, predictedComplaints } = calculatePredictedIssues();
  const atRiskAreas = getAtRiskAreas();
  const trendingIndicators = getTrendingIndicators();

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-red-600" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-emerald-600" />;
    return <Minus size={16} className="text-slate-600" />;
  };

  const getRiskColor = (risk) => {
    if (risk === 'high') return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-amber-50 border-amber-200 text-amber-700';
  };

  return (
    <div className="space-y-6">
      {/* Predicted Issues */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-purple-600" />
          Predicted Issues (Next 30 Days)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Estimated CAPAs</p>
            <p className="text-3xl font-bold text-purple-700 mt-2">{predictedCapas}</p>
            <p className="text-xs text-purple-600 mt-2">Based on recent trends</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4">
            <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Estimated Complaints</p>
            <p className="text-3xl font-bold text-orange-700 mt-2">{predictedComplaints}</p>
            <p className="text-xs text-orange-600 mt-2">Based on recent trends</p>
          </div>
        </div>
      </div>

      {/* At-Risk Areas */}
      {atRiskAreas.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            At-Risk Areas
          </h3>

          <div className="space-y-3">
            {atRiskAreas.map((area, idx) => (
              <div key={idx} className={`rounded-lg border p-4 ${getRiskColor(area.risk)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{area.name}</span>
                  <span className="text-2xl font-bold">{area.count}</span>
                </div>
                <p className="text-xs mt-2 opacity-75">
                  {area.risk === 'high' ? 'Requires immediate attention' : 'Monitor closely'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Indicators */}
      {trendingIndicators.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Trending Indicators</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingIndicators.filter(ind => ind.trending === 'up').length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Trending Up
                </p>
                <div className="space-y-2">
                  {trendingIndicators.filter(ind => ind.trending === 'up').map((ind, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-red-800">{ind.label}</span>
                      <span className="font-bold text-red-600">{ind.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trendingIndicators.filter(ind => ind.trending === 'down').length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <TrendingDown size={16} />
                  Trending Down
                </p>
                <div className="space-y-2">
                  {trendingIndicators.filter(ind => ind.trending === 'down').map((ind, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-emerald-800">{ind.label}</span>
                      <span className="font-bold text-emerald-600">{ind.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ComplianceGauge - Circular gauge showing overall compliance rate
 * Breakdown: Documents %, Training %, CAPA %, Supplier %
 */
function ComplianceGauge({ dashboardData = {} }) {
  const complianceRate = dashboardData.compliance_rate || 0;
  const trainingCompliance = dashboardData.training_compliance || 0;
  const documentCompliance = dashboardData.document_compliance || 75;
  const capaCompliance = dashboardData.capa_compliance || 65;
  const supplierCompliance = dashboardData.supplier_compliance || 70;

  const getColor = (rate) => {
    if (rate > 90) return { text: 'text-emerald-600', label: 'Excellent' };
    if (rate >= 70) return { text: 'text-amber-600', label: 'Good' };
    return { text: 'text-red-600', label: 'Needs Improvement' };
  };

  const mainColor = getColor(complianceRate);
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (complianceRate / 100) * circumference;

  const breakdownItems = [
    { label: 'Documents', value: documentCompliance, color: 'bg-blue-100 text-blue-700' },
    { label: 'Training', value: trainingCompliance, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'CAPAs', value: capaCompliance, color: 'bg-purple-100 text-purple-700' },
    { label: 'Suppliers', value: supplierCompliance, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <CheckCircle size={20} className="text-blue-600" />
        Compliance Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Gauge */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            <svg width="160" height="160" className="transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className={mainColor.text}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>
            <div className="absolute text-center">
              <p className={`text-4xl font-bold ${mainColor.text}`}>{complianceRate}%</p>
              <p className="text-xs text-slate-600 mt-1">Compliance</p>
            </div>
          </div>
          <p className={`text-sm font-semibold ${mainColor.text}`}>{mainColor.label}</p>
        </div>

        {/* Breakdown */}
        <div className="md:col-span-2">
          <div className="space-y-3">
            {breakdownItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.value}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.value > 90 ? 'bg-emerald-600' : item.value >= 70 ? 'bg-amber-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Color Legend */}
          <div className="mt-6 pt-4 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-600">&gt;90% Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-600" />
              <span className="text-slate-600">70-90% Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span className="text-slate-600">&lt;70% Needs Improvement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * QualityMetricsChart - Multi-line chart showing CAPAs, Deviations, and Complaints trends
 * Uses simple SVG-based chart (no external library dependency)
 */
function QualityMetricsChart({ trends = {} }) {
  const capaTrends = trends.capa_trends || [];
  const complaintTrends = trends.complaint_trends || [];
  const deviationTrends = trends.deviation_trends || [];

  // Combine data for timeline
  const chartData = capaTrends.map((capa, idx) => ({
    month: capa.month || `Month ${idx + 1}`,
    capaOpened: capa.opened || 0,
    capaClosed: capa.closed || 0,
    complaints: complaintTrends[idx]?.count || 0,
    deviations: deviationTrends[idx]?.count || 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          Quality Metrics Trend
        </h3>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-400 text-sm">No trend data available</p>
        </div>
      </div>
    );
  }

  // Simple SVG chart dimensions
  const width = 100;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Find max values for scaling
  const maxValue = Math.max(
    ...chartData.flatMap(d => [d.capaOpened, d.capaClosed, d.complaints, d.deviations])
  ) || 10;

  // Scale function
  const scaleX = (index) => padding + (index / (chartData.length - 1)) * chartWidth;
  const scaleY = (value) => height - padding - (value / maxValue) * chartHeight;

  // Generate SVG paths
  const generatePath = (dataKey) => {
    const points = chartData.map((d, idx) => `${scaleX(idx)},${scaleY(d[dataKey])}`).join(' L ');
    return points ? `M ${points}` : '';
  };

  const metrics = [
    { key: 'capaOpened', label: 'CAPAs Opened', color: '#3b82f6', dasharray: '0' },
    { key: 'capaClosed', label: 'CAPAs Closed', color: '#10b981', dasharray: '3 3' },
    { key: 'complaints', label: 'Complaints', color: '#f59e0b', dasharray: '0' },
    { key: 'deviations', label: 'Deviations', color: '#ef4444', dasharray: '3 3' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-indigo-600" />
        Quality Metrics Trend
      </h3>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg
          width={width * 10}
          height={height * 2.5}
          className="min-w-full"
          style={{ display: 'block', margin: '0 auto' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={`grid-h-${ratio}`}
              x1={padding}
              y1={height - padding - ratio * chartHeight}
              x2={width * 10 - padding}
              y2={height - padding - ratio * chartHeight}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* X Axis */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width * 10 - padding}
            y2={height - padding}
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Y Axis */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Data lines */}
          {metrics.map((metric) => (
            <path
              key={metric.key}
              d={generatePath(metric.key)}
              fill="none"
              stroke={metric.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={metric.dasharray}
            />
          ))}

          {/* Data points */}
          {metrics.map((metric) =>
            chartData.map((_, idx) => (
              <circle
                key={`point-${metric.key}-${idx}`}
                cx={scaleX(idx)}
                cy={scaleY(chartData[idx][metric.key])}
                r="2"
                fill={metric.color}
              />
            ))
          )}

          {/* X-axis labels */}
          {chartData.map((d, idx) => (
            <text
              key={`label-x-${idx}`}
              x={scaleX(idx)}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {d.month.substring(0, 3)}
            </text>
          ))}

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <text
              key={`label-y-${ratio}`}
              x={padding - 10}
              y={height - padding - ratio * chartHeight + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
            >
              {Math.round(maxValue * ratio)}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <div key={metric.key} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-0.5"
              style={{ backgroundColor: metric.color, opacity: 0.8 }}
            />
            <span className="text-slate-600">{metric.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main RiskTrending Component - Exports all sub-components
 * Accepts dashboardData prop with stats from the dashboard API
 */
export default function RiskTrending({ dashboardData = {}, trends = {} }) {
  // Handle null/undefined data
  const safeData = dashboardData || {};
  const safeTrends = trends || {};

  // Check if we have any meaningful data
  const hasData = Object.keys(safeData).length > 0 || Object.keys(safeTrends).length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <p className="text-center text-slate-500 py-8">No risk data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Trending Panel */}
      <RiskTrendingPanel dashboardData={safeData} />

      {/* Compliance Gauge */}
      <ComplianceGauge dashboardData={safeData} />

      {/* Quality Metrics Chart */}
      <QualityMetricsChart trends={safeTrends} />

      {/* Predictive Insights */}
      <PredictiveInsights dashboardData={safeData} trends={safeTrends} />
    </div>
  );
}

// Export individual components for use elsewhere
export { RiskTrendingPanel, RiskScoreGauge, ComplianceGauge, QualityMetricsChart, PredictiveInsights };
